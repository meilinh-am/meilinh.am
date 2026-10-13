"use client";
import {useEffect,useRef} from "react";
export function Cursor(){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!window.matchMedia("(pointer:fine) and (prefers-reduced-motion:no-preference)").matches)return;
 const move=(e:PointerEvent)=>{if(!ref.current)return;ref.current.style.transform="translate("+(e.clientX-18)+"px,"+(e.clientY-18)+"px)";ref.current.style.opacity="1";ref.current.classList.toggle("over-link",!!(e.target as HTMLElement).closest("a,button"));};
 const hide=()=>{if(ref.current)ref.current.style.opacity="0";};
 window.addEventListener("pointermove",move,{passive:true});document.addEventListener("pointerleave",hide);return()=>{window.removeEventListener("pointermove",move);document.removeEventListener("pointerleave",hide)};},[]);
 return <div ref={ref} className="creative-cursor" aria-hidden="true"/>;
}