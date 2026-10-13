"use client";
import Image from "./image";
import Link from "next/link";
import {pageDisciplines} from "@/lib/types";
import {ArrowUpRight,ArrowDown} from "lucide-react";
import {motion} from "motion/react";
import {usePortfolio,Editable} from "./portfolio-provider";
import {ProjectGallery} from "./gallery";

export function Home(){
 const {site,editing,setSiteValue}=usePortfolio();
 return <>
  <section className="hero" id="top">
   <div className="hero-topline">
    <Editable path="role"/>
    <span><i className="availability-dot"/><Editable path="availability"/></span>
   </div>
   <div className="hero-composition">
    <motion.div className="hero-heading" initial={false} animate={{opacity:1}} transition={{duration:.85,ease:[.2,.8,.2,1]}}>
     <Editable as="h1" path="name"/>
     <p className="hero-roles">{pageDisciplines.map((key,index)=><span key={key}>{index>0&&<span className="role-separator" aria-hidden="true"> / </span>}<Editable path={"nav."+key}/></span>)}</p>
     <div className="hero-intro"><Editable as="p" path="intro"/><a href="#work" className="text-link"><Editable path="labels.work"/><ArrowUpRight size={18}/></a></div>
    </motion.div>
    <motion.div className="portrait-frame" initial={false} animate={{opacity:1}} transition={{duration:1,delay:.2}}>
     {site.portrait?<Image priority src={site.portrait} alt={site.portraitAlt} fill sizes="(max-width:700px) 54vw, (max-width:1000px) 31vw, 27vw" style={{objectFit:"cover",objectPosition:site.portraitX+"% "+site.portraitY+"%",transform:"scale("+site.portraitScale+")"}}/>:<span>Your portrait here</span>}
     {editing&&<button className="replace-portrait" onClick={()=>{const url=window.prompt("New portrait HTTPS URL",site.portrait);if(url!==null)setSiteValue("portrait",url)}}>Replace portrait ↗</button>}
    </motion.div>
   </div>
   <div className="hero-bottom">

    <a className="scroll-cue" href="#work"><span><Editable path="labels.scroll"/></span><ArrowDown size={20}/></a>
   </div>
  </section>
  <div className="discipline-strip">{pageDisciplines.map(key=><Link key={key} href={"/"+key}><Editable path={"nav."+key}/></Link>)}</div>
  <section className="work-section" id="work">
   <div className="section-kicker"><span>01 / SELECTED WORK</span><span>A CROSS-DISCIPLINARY COLLECTION</span></div>
   <div className="section-heading"><Editable as="h2" path="workTitle"/><span className="section-symbol">↗</span></div>
   <ProjectGallery featured/>
   <p className="sample-disclosure">Illustrative sample portfolio. Names, concepts, and projects are placeholders; images are sample photography.</p>
  </section>
  <section className="about-section" id="about">
   <div className="section-kicker"><span>02 / <Editable path="labels.about"/></span><span>A DIFFERENT WAY OF SEEING</span></div>
   <div className="about-layout">
    <div className="about-art" aria-hidden="true"><div className="about-orbit"/><span>IDEAS<br/>WITHOUT<br/><em>LIMITS.</em></span><small>ALWAYS EXPLORING / ALWAYS CREATING</small></div>
    <div><Editable as="h2" path="aboutTitle"/><div className="rich-copy" dangerouslySetInnerHTML={{__html:site.aboutText}}/>{site.cvUrl&&<a href={site.cvUrl} className="text-link" target="_blank" rel="noreferrer"><Editable path="labels.cv"/><ArrowDown size={17}/></a>}</div>
   </div>
  </section>
 </>;
}
