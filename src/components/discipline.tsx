"use client";
import {usePortfolio,Editable} from "./portfolio-provider";
import {ProjectGallery} from "./gallery";
import {Contact} from "./contact";
import type {Discipline} from "@/lib/types";
export function DisciplinePage({discipline}:{discipline:Discipline}){
 const {site}=usePortfolio();
 return <div className={"discipline-page discipline-"+discipline}><section className="discipline-hero" id="top"><div className="section-kicker"><span>SELECTED PRACTICE / {site.nav[discipline]}</span><span>AN INDEPENDENT PERSPECTIVE</span></div><Editable as="h1" path={"pages."+discipline+".title"}/><div className="discipline-subtitle"><span className="blue-asterisk">✳</span><Editable as="p" path={"pages."+discipline+".subtitle"}/></div><span className="discipline-number">0{["marketing","graphic-design","photography","ui-ux"].indexOf(discipline)+1}</span></section><section className="discipline-work"><ProjectGallery discipline={discipline}/><p className="sample-disclosure">Sample projects · Replace concepts and imagery with your own work in Edit Mode.</p></section><Contact/></div>;
}