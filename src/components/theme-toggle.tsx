"use client";
import {useEffect,useState} from "react";
import {Sun,Moon} from "lucide-react";
type Theme="dark"|"light";
export function ThemeToggle(){
 const [theme,setTheme]=useState<Theme>("dark");
 useEffect(()=>{setTheme(document.documentElement.dataset.theme==="light"?"light":"dark");},[]);
 function toggle(){
  const next=theme==="dark"?"light":"dark";
  document.documentElement.dataset.theme=next;
  setTheme(next);
  try{localStorage.setItem("portfolio-theme",next);}catch{}
 }
 return <button type="button" className="theme-toggle" aria-label={"Switch to "+(theme==="dark"?"light":"dark")+" mode"} aria-pressed={theme==="light"} onClick={toggle}>{theme==="dark"?<Sun size={16}/>:<Moon size={16}/>}<span>{theme==="dark"?"Light mode":"Dark mode"}</span></button>;
}
