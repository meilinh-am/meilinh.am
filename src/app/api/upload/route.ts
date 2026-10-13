import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { checkOrigin,ApiError,rateLimit } from "@/lib/security";
export const runtime="nodejs";
export async function POST(request:Request){
 try{
 checkOrigin(request);const owner=await requireOwner();await rateLimit("upload:"+owner.id,40,3600);
 if(!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)throw new ApiError(503,"Supabase storage is not configured.");
 if(Number(request.headers.get("content-length")??0)>51*1024*1024)throw new ApiError(413,"Maximum upload size is 50 MB.");
 const reader=request.body?.getReader();if(!reader)throw new ApiError(400,"Empty upload.");
 const chunks:Uint8Array[]=[];let received=0;
 while(true){const {done,value}=await reader.read();if(done)break;received+=value.byteLength;if(received>51*1024*1024){await reader.cancel();throw new ApiError(413,"Maximum upload size is 50 MB.");}chunks.push(value);}
 const form=await new Response(Buffer.concat(chunks),{headers:{"Content-Type":request.headers.get("content-type")||""}}).formData();const file=form.get("file");
 if(!(file instanceof File))throw new ApiError(400,"Choose a file.");
 const limits:Record<string,number>={"image/jpeg":10,"image/png":10,"image/webp":10,"video/mp4":50,"video/webm":50,"application/pdf":10};
 if(!limits[file.type] || file.size>limits[file.type]*1024*1024 || !file.size)throw new ApiError(400,"Allowed: JPG, PNG, WebP or PDF up to 10 MB; MP4 or WebM up to 50 MB.");
 const bytes=Buffer.from(await file.arrayBuffer());
 const valid=file.type==="image/jpeg"?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:file.type==="image/png"?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):file.type==="image/webp"?bytes.toString("ascii",0,4)==="RIFF"&&bytes.toString("ascii",8,12)==="WEBP":file.type==="video/mp4"?bytes.toString("ascii",4,8)==="ftyp":file.type==="application/pdf"?bytes.toString("ascii",0,5)==="%PDF-":bytes.subarray(0,4).equals(Buffer.from([26,69,223,163]));
 if(!valid)throw new ApiError(400,"File content does not match its type.");
 const extension:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","video/mp4":"mp4","video/webm":"webm","application/pdf":"pdf"};
 const path="assets/"+randomUUID()+"."+extension[file.type];const bucket=process.env.SUPABASE_STORAGE_BUCKET||"portfolio";
 const storage=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}}).storage.from(bucket);
 const {error}=await storage.upload(path,bytes,{contentType:file.type,upsert:false,cacheControl:"31536000"});if(error)throw new ApiError(502,"Storage upload failed. Check the bucket and credentials.");
 const url=storage.getPublicUrl(path).data.publicUrl;
 try{const media=await db.mediaAsset.create({data:{storagePath:path,url,type:file.type,size:file.size,alt:String(form.get("alt")??"").slice(0,300)}});return NextResponse.json({url,id:media.id});}
 catch(error){await storage.remove([path]);throw error;}
 }catch(error){return NextResponse.json({error:error instanceof ApiError?error.message:"Upload failed."},{status:error instanceof ApiError?error.status:500});}
}