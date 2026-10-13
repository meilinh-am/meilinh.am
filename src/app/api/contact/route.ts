import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validation";
import { checkOrigin,rateLimit,ApiError } from "@/lib/security";
export async function POST(request:Request){
 try{
 checkOrigin(request);if(!process.env.DATABASE_URL)throw new ApiError(503,"Contact form is awaiting setup. Please use the email link.");
 const raw=await request.text();if(raw.length>15000)throw new ApiError(413,"Message is too long.");
 const parsed=contactSchema.safeParse(JSON.parse(raw));if(!parsed.success)throw new ApiError(400,"Please check your name, email, subject and message (at least 10 characters).");
 if(parsed.data.website)return NextResponse.json({ok:true});
 await rateLimit("contact-email:"+parsed.data.email.toLowerCase(),3,3600);
 const proxyIP=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
 if(proxyIP)await rateLimit("contact-ip:"+proxyIP,10,3600);
 // Global cap also protects deployments without a trusted IP header.
 await rateLimit("contact-global",100,3600);
 const {website,...data}=parsed.data;
 const record=await db.contactMessage.create({data});
 if(process.env.RESEND_API_KEY && process.env.CONTACT_NOTIFY_EMAIL && process.env.CONTACT_FROM_EMAIL){
  try{const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+process.env.RESEND_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({from:process.env.CONTACT_FROM_EMAIL,to:process.env.CONTACT_NOTIFY_EMAIL,reply_to:data.email,subject:"Portfolio enquiry: "+data.subject,text:data.name+" <"+data.email+">\n\n"+data.message}),signal:AbortSignal.timeout(8000)});
   await db.contactMessage.update({where:{id:record.id},data:{notificationStatus:response.ok?"sent":"failed"}});
  }catch{await db.contactMessage.update({where:{id:record.id},data:{notificationStatus:"failed"}});}
 }
 return NextResponse.json({ok:true});
 }catch(error){return NextResponse.json({error:error instanceof ApiError?error.message:"Unable to send. Please try again."},{status:error instanceof ApiError?error.status:500});}
}