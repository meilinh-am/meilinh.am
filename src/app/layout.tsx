import type {Metadata} from "next";
import {getPortfolio} from "@/lib/content";
import {PortfolioProvider} from "@/components/portfolio-provider";
import {Shell} from "@/components/shell";
import "./globals.css";
export const dynamic="force-dynamic";
export async function generateMetadata():Promise<Metadata>{const {site}=await getPortfolio();const base=new URL(process.env.SITE_URL||"http://localhost:3000");return {metadataBase:base,title:{default:site.seoTitle,template:"%s — "+site.name},description:site.seoDescription,openGraph:{title:site.seoTitle,description:site.seoDescription,type:"website",images:site.portrait?[{url:site.portrait,alt:site.portraitAlt}]:[]},robots:{index:true,follow:true}};}
export default async function RootLayout({children}:{children:React.ReactNode}){const data=await getPortfolio();return <html lang="en" data-theme="dark" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:'try{document.documentElement.dataset.theme=localStorage.getItem("portfolio-theme")==="light"?"light":"dark"}catch{}'}}/></head><body><a href="#main-content" className="skip-link">Skip to content</a><PortfolioProvider data={data}><div id="main-content" tabIndex={-1}><Shell>{children}</Shell></div></PortfolioProvider></body></html>;}
