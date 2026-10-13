import {pageDisciplines} from "@/lib/types";
import type {MetadataRoute} from "next";import {getPortfolio} from "@/lib/content";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const {projects}=await getPortfolio();const base=process.env.SITE_URL||"http://localhost:3000";return ["/","/contact",...pageDisciplines.map(discipline=>"/"+discipline),...projects.filter(p=>p.published).map(p=>"/projects/"+p.slug)].map(path=>({url:base+path,changeFrequency:"monthly",priority:path==="/"?1:.7}));}
export const dynamic="force-dynamic";
