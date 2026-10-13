import { z } from "zod";
import sanitize from "sanitize-html";
import { safeUrl } from "./security";
export const cleanHtml = (html: string) => sanitize(html,{allowedTags:["p","br","strong","em","s","ul","ol","li","blockquote","h2","h3","a"],allowedAttributes:{a:["href","target","rel"]},allowedSchemes:["https","mailto"],transformTags:{a: sanitize.simpleTransform("a",{rel:"noopener noreferrer"})}});
const text = z.string().max(10000);
const short = z.string().max(300);
const url = z.string().max(2048).refine(v=>safeUrl(v), "Use a valid HTTPS URL.");
const html = z.string().max(50000).transform(cleanHtml);
export const disciplineSchema = z.enum(["marketing","graphic-design","photography","ui-ux"]);
export const blockSchema = z.object({id:z.string().min(1).max(100),kind:z.enum(["text","image","gallery","video","columns","quote","comparison","embed","statistics"]),content:z.object({title:short.optional(),text:html.optional(),rightText:html.optional(),url:url.optional(),secondUrl:url.optional(),urls:z.array(url).max(60).optional(),alt:short.optional(),caption:short.optional(),layout:z.enum(["full","two-column","collage","carousel","split","mockup"]).optional()}).strict()}).strict();
export const projectSchema = z.object({
 id:z.string().min(1).max(100),slug:z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), title:short.min(1),discipline:disciplineSchema,year:z.string().max(10),client:short,description:text,
 cover:url,coverAlt:short,coverX:z.number().min(0).max(100).default(50),coverY:z.number().min(0).max(100).default(50),coverScale:z.number().min(1).max(2).default(1),featured:z.boolean(),placeholder:z.boolean(),published:z.boolean(),position:z.number().int().min(0).max(10000),version:z.number().int().min(1),categories:z.array(short.min(1)).max(20),blocks:z.array(blockSchema).max(100)
}).strict().refine(p=>new Set(p.blocks.map(b=>b.id)).size===p.blocks.length,"Block IDs must be unique.");
const pageSchema = z.object({title:short,subtitle:text,categories:z.array(short.min(1)).max(30)}).strict();
export const siteSchema = z.object({
 name:short.min(1),mark:short,role:short,availability:short,heroLine1:short,heroLine2:short,heroLine3:short,intro:text,
 portrait:url,portraitAlt:short,portraitX:z.number().min(0).max(100),portraitY:z.number().min(0).max(100),portraitScale:z.number().min(1).max(2),composition:z.enum(["rings","orbital","minimal"]),decorations:z.boolean(),
 workTitle:short,aboutTitle:short,aboutText:html,services:z.array(short).max(20),cvUrl:url,contactTitle:short,contactText:text,email:z.email(),
 socials:z.array(z.object({label:short,url})).max(20),seoTitle:short,seoDescription:short,
 nav:z.object({home:short,marketing:short,"graphic-design":short,photography:short,"ui-ux":short,contact:short}).strict(),
 labels:z.object({work:short,contact:short,scroll:short,about:short,cv:short,explore:short,all:short,back:short,send:short,name:short,email:short,subject:short,message:short,copyright:short}).strict(),
 pages:z.object({marketing:pageSchema,"graphic-design":pageSchema,photography:pageSchema,"ui-ux":pageSchema}).strict()
}).strict();
export const contactSchema = z.object({name:z.string().trim().min(2).max(100),email:z.email().max(254),subject:z.string().trim().min(3).max(200),message:z.string().trim().min(10).max(10000),website:z.string().max(200).default("")}).strict();