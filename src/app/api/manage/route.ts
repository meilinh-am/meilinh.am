import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { checkOrigin,ApiError } from "@/lib/security";
import { siteSchema,projectSchema } from "@/lib/validation";
const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
export async function GET(request:Request) {
 try { await requireOwner(); const url=new URL(request.url); const type=url.searchParams.get("type")??"site"; const id=url.searchParams.get("id")??"main";
 if(url.searchParams.get("view")==="messages") return NextResponse.json(await db.contactMessage.findMany({take:100,orderBy:{createdAt:"desc"}}));
 if(url.searchParams.get("view")==="media") return NextResponse.json(await db.mediaAsset.findMany({take:100,orderBy:{createdAt:"desc"}}));
 if(url.searchParams.get("view")==="revisions") return NextResponse.json(await db.contentRevision.findMany({where:{entityType:type,entityId:id},orderBy:{createdAt:"desc"},take:30}));
 const record=type==="site"?await db.siteSettings.findUnique({where:{id}}):await db.project.findUnique({where:{id}});
 return NextResponse.json({draft:record?.draft??null});
 }catch(error){return failure(error);}
}
export async function POST(request: Request) {
 try {
 checkOrigin(request);const owner=await requireOwner();
 const raw=await request.text();if(raw.length>2_000_000)throw new ApiError(413,"Content is too large.");
 const body=z.object({action:z.enum(["draft","publish","cancel","create","delete","restore","reorder"]),type:z.enum(["site","project"]),id:z.string().max(100),version:z.number().int().min(1).optional(),content:z.unknown().optional(),revisionId:z.string().optional(),ids:z.array(z.string()).max(1000).optional()}).strict().parse(JSON.parse(raw));
 if(body.action==="reorder") {
  if(body.type!=="project")throw new ApiError(400,"Only projects can be reordered.");
  const ids=body.ids??[];
  await db.$transaction(ids.map((id,position)=>db.project.update({where:{id},data:{position,version:{increment:1}}})));
  return NextResponse.json({ok:true});
 }
 if(body.action==="create"){
  if(body.type!=="project")throw new ApiError(400,"Invalid creation.");
  const p=projectSchema.parse(body.content);
  await db.project.create({data:{id:p.id,slug:p.slug,title:p.title,discipline:p.discipline,year:p.year,client:p.client,description:p.description,cover:p.cover,coverAlt:p.coverAlt,placeholder:p.placeholder,position:p.position,published:false,draft:json(p)}});
  return NextResponse.json({ok:true,version:1});
 }
 if(body.action==="delete"){
  if(body.type!=="project")throw new ApiError(400,"Only projects can be deleted.");
  await db.$transaction(async tx=>{
   const record=await tx.project.findUnique({where:{id:body.id},include:{categories:true,blocks:true}});
   if(!record)throw new ApiError(404,"Project not found.");
   if(record.version!==body.version)throw new ApiError(409,"This project changed. Reload before deleting.");
   await tx.contentRevision.create({data:{entityType:"deleted-project",entityId:body.id,content:json(record),createdBy:owner.id}});
   await tx.project.delete({where:{id:body.id}});
  });return NextResponse.json({ok:true});
 }
 let content=body.content;
 if(body.action==="restore"){
  const revision=await db.contentRevision.findFirst({where:{id:body.revisionId,entityId:body.id,entityType:body.type}});
  if(!revision)throw new ApiError(404,"Revision not found.");content=revision.content;
 }
 const parsed=body.action==="cancel"?null:body.type==="site"?siteSchema.parse(content):projectSchema.parse(content);
 const result=await db.$transaction(async tx=>{
  if(body.type==="site"){
   const existing=await tx.siteSettings.findUnique({where:{id:"main"}});
   if(!existing)throw new ApiError(404,"Site settings not found.");
   if(existing.version!==body.version)throw new ApiError(409,"Content changed in another tab. Reload before saving.");
   if(body.action==="publish")await tx.contentRevision.create({data:{entityType:"site",entityId:"main",content:existing.published as Prisma.InputJsonValue,createdBy:owner.id}});
   const changed=await tx.siteSettings.updateMany({where:{id:"main",version:body.version},data:body.action==="publish"?{published:json(parsed),draft:Prisma.DbNull,version:{increment:1}}:{draft:parsed?json(parsed):Prisma.DbNull,version:{increment:1}}});
   if(!changed.count)throw new ApiError(409,"Content changed. Reload before saving.");
   return {version:existing.version+1};
  }
  const p=parsed as z.infer<typeof projectSchema>|null;
  const existing=await tx.project.findUnique({where:{id:body.id},include:{categories:true,blocks:{orderBy:{position:"asc"}}}});
  if(!existing)throw new ApiError(404,"Project not found.");
  if(existing.version!==body.version)throw new ApiError(409,"Project changed in another tab. Reload before saving.");
  if(p && p.id!==body.id)throw new ApiError(400,"Project identity cannot be changed.");
  if(body.action==="publish" && p){
   const snapshot={...existing,categories:existing.categories.map(c=>c.name),blocks:existing.blocks.map(b=>({id:b.id,kind:b.kind,content:b.content}))};
   const validated=projectSchema.parse(Object.fromEntries(Object.keys(p).map(key=>[key,(snapshot as Record<string,unknown>)[key]])));
   await tx.contentRevision.create({data:{entityType:"project",entityId:body.id,content:json(validated),createdBy:owner.id}});
   const {blocks,categories,id,version,...fields}=p;
   const changed=await tx.project.updateMany({where:{id,version:body.version},data:{...fields,version:{increment:1},draft:Prisma.DbNull}});
   if(!changed.count)throw new ApiError(409,"Project changed. Reload before saving.");
   await tx.projectContentBlock.deleteMany({where:{projectId:id}});
   for(const [position,block] of blocks.entries())await tx.projectContentBlock.create({data:{id:block.id,projectId:id,kind:block.kind,content:json(block.content),position}});
   await tx.project.update({where:{id},data:{categories:{set:[],connectOrCreate:categories.map(name=>({where:{discipline_name:{discipline:p.discipline,name}},create:{discipline:p.discipline,name}}))}}});
  }else{
   const changed=await tx.project.updateMany({where:{id:body.id,version:body.version},data:{draft:p?json(p):Prisma.DbNull,version:{increment:1}}});
   if(!changed.count)throw new ApiError(409,"Project changed. Reload before saving.");
  }
  return {version:existing.version+1};
 },{timeout:15000});
 return NextResponse.json({ok:true,...result});
 }catch(error){return failure(error);}
}
function failure(error:unknown){if(error instanceof ApiError)return NextResponse.json({error:error.message},{status:error.status});if(error instanceof z.ZodError)return NextResponse.json({error:error.issues.map(i=>i.path.join(".")+": "+i.message).join("; ")},{status:400});if(error instanceof Prisma.PrismaClientKnownRequestError && error.code==="P2002")return NextResponse.json({error:"A project with that slug already exists."},{status:409});console.error("Management request failed",error instanceof Error?error.name:"Unknown error");return NextResponse.json({error:"Unable to save. Please try again."},{status:500});}