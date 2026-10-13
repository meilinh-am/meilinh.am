"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useState} from "react";
import {ArrowUpRight,Menu,X,ArrowUp} from "lucide-react";
import Lenis from "lenis";
import {usePortfolio,Editable} from "./portfolio-provider";
import {OwnerToolbar} from "./site-editor";
import {Cursor} from "./cursor";
import {ThemeToggle} from "./theme-toggle";
const routes=[["home","/"],["marketing","/marketing"],["graphic-design","/graphic-design"],["photography","/photography"]] as const;
export function Shell({children}:{children:React.ReactNode}){
 const {site,editing}=usePortfolio();const pathname=usePathname();const [open,setOpen]=useState(false);
 useEffect(()=>setOpen(false),[pathname]);
 useEffect(()=>{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches || editing)return;const lenis=new Lenis({autoRaf:true,anchors:true,duration:1.1});return()=>lenis.destroy();},[editing]);
 return <><header className="navigation"><Link className="wordmark" href="/" aria-label={site.name+" home"}><Editable path="mark"/></Link><nav className={open?"nav-links is-open":"nav-links"} aria-label="Main navigation">{routes.map(([key,url])=><Link key={key} href={url} className={pathname===url?"active":""} aria-current={pathname===url?"page":undefined}><Editable path={"nav."+key}/></Link>)}</nav><Link href="/#contact" className="nav-contact"><Editable path="nav.contact"/><ArrowUpRight size={15}/></Link><ThemeToggle/><button className="menu-button" aria-label={open?"Close menu":"Open menu"} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></header><main key={pathname} className="page-enter">{children}</main><footer className="footer"><Link href="/" className="wordmark"><Editable path="mark"/></Link><p>© {new Date().getFullYear()} <Editable path="name"/> · <Editable path="labels.copyright"/></p><a href="#top" aria-label="Back to top"><ArrowUp size={18}/></a></footer><OwnerToolbar/><Cursor/></>;
}