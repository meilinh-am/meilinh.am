import { PrismaClient, Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { sampleSite, sampleProjects } from "../src/lib/sample";
const db=new PrismaClient();const json=(v:unknown)=>JSON.parse(JSON.stringify(v)) as Prisma.InputJsonValue;
async function main(){
 const email=process.env.OWNER_EMAIL?.trim().toLowerCase(),password=process.env.OWNER_PASSWORD;
 if(!email || !password || password.length<14)throw new Error("Set OWNER_EMAIL and OWNER_PASSWORD (at least 14 characters) before seeding.");
 await db.user.upsert({where:{email},create:{email,passwordHash:await hash(password,12),role:"OWNER"},update:{}});
 await db.siteSettings.upsert({where:{id:"main"},create:{id:"main",published:json(sampleSite)},update:{}});
 for(const [position,slug] of ["home","marketing","graphic-design","photography","ui-ux"].entries())await db.page.upsert({where:{slug},create:{slug,title:slug,position},update:{}});
 for(const p of sampleProjects){
  const {blocks,categories,version,...fields}=p;
  await db.project.upsert({where:{id:p.id},update:{},create:{...fields,version,blocks:{create:blocks.map((b,position)=>({id:b.id,kind:b.kind,content:json(b.content),position}))},categories:{connectOrCreate:categories.map(name=>({where:{discipline_name:{discipline:p.discipline,name}},create:{discipline:p.discipline,name}}))}}});
 }
 await db.rateLimit.deleteMany({where:{expiresAt:{lt:new Date()}}});
 console.log("Seed complete. Existing portfolio content was preserved.");
}
main().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>db.$disconnect());