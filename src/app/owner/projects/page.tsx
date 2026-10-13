import {redirect} from "next/navigation";import {currentOwner} from "@/lib/owner";import {ProjectManager} from "@/components/project-editor";
export const metadata={title:"Project studio",robots:{index:false,follow:false}};
export default async function Page(){if(!await currentOwner())redirect("/owner/login");return <ProjectManager/>;}