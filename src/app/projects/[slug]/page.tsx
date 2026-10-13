import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {getPortfolio} from "@/lib/content";
import {ProjectDetail} from "@/components/project-detail";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const {projects}=await getPortfolio();const p=projects.find(p=>p.slug===slug);return p?{title:p.title,description:p.description,openGraph:{title:p.title,description:p.description,images:p.cover?[{url:p.cover,alt:p.coverAlt}]:[]}}:{};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const {projects}=await getPortfolio();if(!projects.some(p=>p.slug===slug))notFound();return <ProjectDetail slug={slug}/>;}