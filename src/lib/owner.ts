import { auth } from "@/auth";
import { db } from "./db";
import { ApiError } from "./security";
export async function currentOwner() {
 if(!process.env.DATABASE_URL) return null;
 const session=await auth();
 if(!session?.user?.id) return null;
 return db.user.findFirst({where:{id:session.user.id,role:"OWNER"}});
}
export async function requireOwner() {const owner=await currentOwner();if(!owner) throw new ApiError(401,"Owner authentication required.");return owner;}