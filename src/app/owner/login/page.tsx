import {signIn} from "@/auth";
import {AuthError} from "next-auth";
import {redirect} from "next/navigation";
export const metadata={title:"Owner login",robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{error?:string}>}){
 const {error}=await searchParams;
 async function login(form:FormData){"use server";try{await signIn("credentials",{email:form.get("email"),password:form.get("password"),redirectTo:"/"});}catch(error){if(error instanceof AuthError)redirect("/owner/login?error=credentials");throw error;}}
 return <section className="login-page" id="top"><p className="section-kicker">PRIVATE / OWNER ACCESS</p><h1>Your creative <span className="blue-text">space.</span></h1><p>Sign in to edit your portfolio, manage projects and review enquiries.</p>{!process.env.DATABASE_URL?<p className="setup-note">Connect Supabase and seed your owner account to enable login. See README.md.</p>:<form action={login}><label>Email<input name="email" type="email" required autoComplete="username"/></label><label>Password<input name="password" type="password" required maxLength={128} autoComplete="current-password"/></label>{error&&<p role="alert">Unable to sign in. Check your credentials or try again later.</p>}<button className="button light">Sign in ↗</button></form>}</section>;
}