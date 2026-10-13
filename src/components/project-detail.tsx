"use client";
import {useState} from "react";
import Image from "./image";
import Link from "next/link";
import {ArrowUpRight,ArrowLeft} from "lucide-react";
import {usePortfolio} from "./portfolio-provider";
import {PhotoViewer} from "./gallery";
import {ProjectEditor} from "./project-editor";
import {embedUrl} from "@/lib/embeds";
import type {Block} from "@/lib/types";
export function ProjectDetail({slug}:{slug:string}){
 const {projects,site,editing,setProjects}=usePortfolio();const project=projects.find(p=>p.slug===slug);
 if(!project)return <section className="discipline-hero"><h1>Project unavailable.</h1><Link href="/">Back home</Link></section>;
 return <article className="project-detail" id="top"><Link className="text-link" href={"/"+project.discipline}><ArrowLeft size={17}/>{site.labels.back}</Link><div className="project-title-row"><h1 className={editing?"editable":""} contentEditable={editing} suppressContentEditableWarning onBlur={e=>{if(editing){const title=e.currentTarget.innerText;setProjects(rows=>rows.map(p=>p.id===project.id?{...p,title}:p))}}}>{project.title}</h1><span>{project.year}<ArrowUpRight size={45}/></span></div><div className="project-meta"><span>{site.nav[project.discipline]}</span><span>{project.client}</span><span>{project.categories.join(" / ")}</span></div>{project.placeholder&&<p className="sample-disclosure">Sample project — illustrative concept, not commissioned work.</p>}<p className={"project-description "+(editing?"editable":"")} contentEditable={editing} suppressContentEditableWarning onBlur={e=>{if(editing){const description=e.currentTarget.innerText;setProjects(rows=>rows.map(p=>p.id===project.id?{...p,description}:p))}}}>{project.description}</p>{project.cover&&<div className="project-cover"><Image priority src={project.cover} alt={project.coverAlt} width={1800} height={1100} sizes="100vw" style={{objectFit:"cover",width:"100%",height:"100%",objectPosition:(project.coverX??50)+"% "+(project.coverY??50)+"%",scale:project.coverScale??1}}/></div>}<div className="project-blocks">{project.blocks.map(block=><ContentBlock key={block.id} block={block}/>)}</div>{editing&&<ProjectEditor project={project}/>}<Link className="button outline" href={"/"+project.discipline}>{site.labels.back}<ArrowUpRight size={18}/></Link></article>;
}
function ContentBlock({block}:{block:Block}){
 const c=block.content;
 if(block.kind==="text")return (c.title||c.text)?<section className="story-text">{c.title&&<h2>{c.title}</h2>}{c.text&&<div className="rich-copy" dangerouslySetInnerHTML={{__html:c.text}}/>}</section>:null;
 if(block.kind==="quote")return <blockquote className="project-quote">{c.title&&<small>{c.title}</small>}<div dangerouslySetInnerHTML={{__html:c.text||""}}/></blockquote>;
 if(block.kind==="statistics")return c.text?<section className="story-text"><h2>{c.title}</h2><div dangerouslySetInnerHTML={{__html:c.text}}/></section>:null;
 if(block.kind==="columns")return <section className="story-columns">{c.title&&<h2>{c.title}</h2>}<div className="rich-copy" dangerouslySetInnerHTML={{__html:c.text||""}}/><div className="rich-copy" dangerouslySetInnerHTML={{__html:c.rightText||""}}/></section>;
 if(block.kind==="image")return c.url?<figure className="story-image"><PhotoViewer images={[c.url]} alt={c.alt||c.title}/>{c.caption&&<figcaption>{c.caption}</figcaption>}</figure>:null;
 if(block.kind==="gallery")return c.urls?.length?<section className={"story-gallery layout-"+(c.layout||"two-column")}>{c.title&&<h2>{c.title}</h2>}<PhotoViewer images={c.urls} alt={c.alt||c.title}/>{c.caption&&<p>{c.caption}</p>}</section>:null;
 if(block.kind==="comparison")return c.url&&c.secondUrl?<Comparison before={c.url} after={c.secondUrl} alt={c.alt||"Before and after"}/>:null;
 if(block.kind==="video" && c.url && /\.(mp4|webm)(\?.*)?$/i.test(c.url))return <figure className="story-video"><video controls playsInline preload="none" poster={c.secondUrl||undefined} src={c.url}/>{c.caption&&<figcaption>{c.caption}</figcaption>}</figure>;
 if(block.kind==="video"||block.kind==="embed")return c.url?<Embedded url={c.url} title={c.title||"Project preview"}/>:null;
 return null;
}
function Embedded({url,title}:{url:string;title:string}){const [loaded,setLoaded]=useState(false);const src=embedUrl(url);return <section className="embed-block"><h2>{title}</h2>{src?(loaded?<iframe title={title} src={src} allow="fullscreen; picture-in-picture" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" loading="lazy"/>:<button onClick={()=>setLoaded(true)}>Load external preview ↗<small>Loads content from {new URL(url).hostname}.</small></button>):<a className="button outline" target="_blank" rel="noreferrer" href={url}>View on {new URL(url).hostname}<ArrowUpRight size={18}/></a>}</section>}
function Comparison({before,after,alt}:{before:string;after:string;alt:string}){const [position,setPosition]=useState(50);return <figure className="comparison"><Image src={before} alt={alt+" — before"} fill sizes="100vw"/><div style={{clipPath:"inset(0 "+(100-position)+"% 0 0)"}}><Image src={after} alt={alt+" — after"} fill sizes="100vw"/></div><label style={{left:position+"%"}}>↔</label><input type="range" aria-label="Compare original and edited photograph" min={0} max={100} value={position} onChange={e=>setPosition(Number(e.target.value))}/><span className="before-label">Original</span><span className="after-label">Edited</span></figure>}