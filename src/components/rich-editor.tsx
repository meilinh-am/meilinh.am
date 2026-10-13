"use client";
import {useEditor,EditorContent} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {useEffect} from "react";
export function RichEditor({value,onChange}:{value:string;onChange:(value:string)=>void}){
 const editor=useEditor({extensions:[StarterKit],content:value,immediatelyRender:false,onUpdate:({editor})=>onChange(editor.getHTML()),editorProps:{attributes:{class:"rich-input"}}});
 useEffect(()=>{if(editor && editor.getHTML()!==value && !editor.isFocused)editor.commands.setContent(value,{emitUpdate:false});},[value,editor]);
 return <div className="rich-editor"><div className="rich-tools">{[["Bold",()=>editor?.chain().focus().toggleBold().run()],["Italic",()=>editor?.chain().focus().toggleItalic().run()],["List",()=>editor?.chain().focus().toggleBulletList().run()],["Heading",()=>editor?.chain().focus().toggleHeading({level:2}).run()]].map(([label,action])=><button key={String(label)} type="button" onClick={action as ()=>void}>{String(label)}</button>)}</div><EditorContent editor={editor}/></div>;
}