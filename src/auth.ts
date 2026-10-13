import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/security";
export const { handlers, auth, signIn, signOut } = NextAuth({
 session:{strategy:"jwt",maxAge:8*60*60},
 pages:{signIn:"/owner/login"},
 providers:[Credentials({credentials:{email:{type:"email"},password:{type:"password"}},
 async authorize(credentials) {
  const parsed = z.object({email:z.email(),password:z.string().min(1).max(128)}).safeParse(credentials);
  if(!parsed.success || !process.env.DATABASE_URL) return null;
  const email=parsed.data.email.toLowerCase();
  await rateLimit("login:"+email,8,900);
  const user=await db.user.findUnique({where:{email}});
  // Constant-cost comparison even for unknown users.
  const valid=await compare(parsed.data.password,user?.passwordHash ?? "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxuNoH.3QbAV1o6P1H9y0A5Ipd.");
  if(!user || !valid || user.role!=="OWNER") return null;
  return {id:user.id,email:user.email};
 }})],
 callbacks:{async jwt({token,user}){if(user) token.ownerId=user.id; return token;},async session({session,token}){if(session.user) session.user.id=String(token.ownerId??"");return session;}}
});