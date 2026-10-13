import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {pageDisciplines,type Discipline} from "@/lib/types";
import {getPortfolio} from "@/lib/content";
import {DisciplinePage} from "@/components/discipline";
export async function generateMetadata({params}:{params:Promise<{discipline:string}>}):Promise<Metadata>{const {discipline}=await params;if(!pageDisciplines.includes(discipline as Discipline))return {};const {site}=await getPortfolio();return {title:site.nav[discipline as Discipline],description:site.pages[discipline as Discipline].subtitle};}
export default async function Page({params}:{params:Promise<{discipline:string}>}){const {discipline}=await params;if(!pageDisciplines.includes(discipline as Discipline))notFound();return <DisciplinePage discipline={discipline as Discipline}/>;}