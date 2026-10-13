"use client";
import { createContext,useContext,useState,useEffect,useRef,useCallback, type ReactNode } from "react";
import type { PortfolioData,SiteContent,Project } from "@/lib/types";
type Context = PortfolioData & {editing:boolean;setEditing:(v:boolean)=>void;setSiteValue:(path:string,value:unknown)=>void;setProjects:React.Dispatch<React.SetStateAction<Project[]>>;save:(action:"draft"|"publish"|"cancel")=>Promise<void>;dirty:boolean;busy:boolean;notice:string;setNotice:(v:string)=>void;loadSite:(site:SiteContent)=>void};
const PortfolioContext=createContext<Context|null>(null);
export function usePortfolio(){const value=useContext(PortfolioContext);if(!value)throw new Error("Portfolio provider missing");return value;}
export function PortfolioProvider({data,children}:{data:PortfolioData;children:ReactNode}){
 const [site,setSite]=useState(data.site),[projects,setProjects]=useState(data.projects),[editing,setEditing]=useState(false),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState(""),[change,setChange]=useState(0);
 const version=useRef(data.version),baseline=useRef(data.site),latest=useRef(site),lock=useRef(false);
 latest.current=site;
 const setSiteValue=useCallback((path:string,value:unknown)=>{setSite(old=>{const copy=structuredClone(old);const keys=path.split(".");let parent=copy as unknown as Record<string,unknown>;for(const key of keys.slice(0,-1))parent=parent[key] as Record<string,unknown>;parent[keys.at(-1)!]=value;return copy;});setDirty(true);setChange(c=>c+1);},[]);
 const loadSite=(value:SiteContent)=>{setSite(value);setDirty(true);setChange(c=>c+1)};
 const save=useCallback(async(action:"draft"|"publish"|"cancel")=>{
 if(lock.current)return;lock.current=true;setBusy(true);
 try{const snapshot=structuredClone(latest.current);const res=await fetch("/api/manage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,type:"site",id:"main",version:version.current,content:action==="cancel"?undefined:snapshot})});const result=await res.json();if(!res.ok)throw new Error(result.error);version.current=result.version;
 if(action==="cancel"){setSite(baseline.current);setDirty(false);setNotice("Changes discarded.");}
 else if(action==="publish"){baseline.current=snapshot;if(JSON.stringify(latest.current)===JSON.stringify(snapshot))setDirty(false);setNotice("Portfolio published.");}
 else setNotice("Draft saved. Publish to make it visible.");
 }catch(error){setNotice(error instanceof Error?error.message:"Save failed.");}finally{lock.current=false;setBusy(false);}
 },[]);
 useEffect(()=>{if(!editing || !dirty || change===0)return;const timer=setTimeout(()=>{void save("draft");},3500);return()=>clearTimeout(timer);},[change,editing,dirty,save]);
 useEffect(()=>{const handler=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue=""}};window.addEventListener("beforeunload",handler);return()=>window.removeEventListener("beforeunload",handler);},[dirty]);
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(""),7000);return()=>clearTimeout(timer);},[notice]);
 return <PortfolioContext.Provider value={{...data,site,projects,version:version.current,editing,setEditing,setSiteValue,setProjects,save,dirty,busy,notice,setNotice,loadSite}}>{children}{notice&&<div className="toast" role="status">{notice}</div>}</PortfolioContext.Provider>;
}
export function Editable({path,as:Tag="span",className=""}:{path:string;as?: "span"|"p"|"h1"|"h2"|"h3";className?:string}){
 const {site,editing,setSiteValue}=usePortfolio();let value:unknown=site;for(const key of path.split("."))value=(value as Record<string,unknown>)[key];
 const element=useRef<HTMLElement|null>(null);
 useEffect(()=>{if(element.current && document.activeElement!==element.current)element.current.innerText=String(value??"");},[value]);
 return <Tag ref={element as React.Ref<never>} className={className+(editing?" editable":"")} contentEditable={editing} suppressContentEditableWarning role={editing?"textbox":undefined} aria-label={editing?"Edit "+path:undefined} onBlur={e=>{if(editing && e.currentTarget.innerText!==value)setSiteValue(path,e.currentTarget.innerText)}} onPaste={e=>{if(editing){e.preventDefault();document.execCommand("insertText",false,e.clipboardData.getData("text/plain"));}}}>{String(value??"")}</Tag>;
}