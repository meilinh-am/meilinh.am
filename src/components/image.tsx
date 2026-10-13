import NextImage, {type ImageProps} from "next/image";
export default function Image(props:ImageProps){
 let optimized=true;
 if(typeof props.src==="string" && props.src.startsWith("https://")){
  const host=new URL(props.src).hostname;
  optimized=host==="images.unsplash.com" || host.endsWith(".supabase.co");
 }
 return <NextImage {...props} unoptimized={props.unoptimized || !optimized}/>;
}