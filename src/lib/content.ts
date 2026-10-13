import type { PortfolioData, Project, SiteContent } from "./types";
import { sampleSite,sampleProjects } from "./sample";
import { db } from "./db";
import { currentOwner } from "./owner";
import {cache} from "react";
export const getPortfolio=cache(async function getPortfolio(): Promise<PortfolioData> {
 if(!process.env.DATABASE_URL) return {site:sampleSite,projects:sampleProjects,version:1,owner:false,configured:false};
 const owner=await currentOwner();
 const [settings,rows]=await Promise.all([db.siteSettings.findUnique({where:{id:"main"}}),db.project.findMany({where:owner?{}:{published:true},orderBy:{position:"asc"},include:{categories:true,blocks:{orderBy:{position:"asc"}}}})]);
 if(!settings) throw new Error("Database is not seeded. Run npm run db:seed.");
 const projects=rows.map(row=>({id:row.id,slug:row.slug,title:row.title,discipline:row.discipline,year:row.year,client:row.client,description:row.description,cover:row.cover,coverAlt:row.coverAlt,coverX:row.coverX,coverY:row.coverY,coverScale:row.coverScale,featured:row.featured,placeholder:row.placeholder,published:row.published,position:row.position,version:row.version,categories:row.categories.map(c=>c.name),blocks:row.blocks.map(b=>({id:b.id,kind:b.kind,content:b.content}))})) as Project[];
 return {site:settings.published as unknown as SiteContent,projects,version:settings.version,owner:!!owner,configured:true};
});
