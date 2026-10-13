export function embedUrl(input:string):string|null {
 try{const url=new URL(input);if(url.protocol!=="https:")return null;
 if(["www.youtube.com","youtube.com","youtu.be"].includes(url.hostname)){const id=url.hostname==="youtu.be"?url.pathname.slice(1):url.searchParams.get("v")??url.pathname.split("/").at(-1);return id && /^[\w-]{11}$/.test(id)?"https://www.youtube-nocookie.com/embed/"+id:null;}
 if(["vimeo.com","www.vimeo.com","player.vimeo.com"].includes(url.hostname)){const id=url.pathname.split("/").at(-1);return id&&/^\d+$/.test(id)?"https://player.vimeo.com/video/"+id:null;}
 if(["www.figma.com","figma.com"].includes(url.hostname) && /^\/(proto|design|file)\//.test(url.pathname))return "https://www.figma.com/embed?embed_host=share&url="+encodeURIComponent(url.href);
 return null;
 }catch{return null;}
}