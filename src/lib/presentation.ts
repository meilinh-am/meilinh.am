import type {SiteContent,Project} from "./types";
import {sampleSite,sampleProjects} from "./sample";
const previousCopy = {
  "role": "Independent creative / Selected portfolio",
  "intro": "I turn ideas into meaningful visual experiences. A little strategy, a lot of curiosity, and a different way of seeing.",
  "workTitle": "A few things I've made.",
  "aboutText": "<p>I’m a multidisciplinary creative working at the intersection of strategy, design, and storytelling. From a brand’s first impression to the small details of a digital experience, I bring ideas to life with intention.</p><p>This is a sample biography. Replace it with your story, experience, and creative approach.</p>",
  "seoDescription": "Selected work in digital marketing, graphic design, photography and UI/UX. Sample portfolio ready for your own story."
};
export function refreshSampleSite(site:SiteContent):SiteContent {
 const updates:Partial<SiteContent>={};
 for(const key of ["role","intro","workTitle","aboutText","seoDescription"] as const){
  if(site[key]===previousCopy[key]) updates[key]=sampleSite[key];
 }
 return {...site,...updates};
}
export function refreshSampleProject(project:Project):Project {
 if(project.id!=="sample-04" || project.discipline!=="ui-ux" || !project.placeholder) return project;
 const replacement=sampleProjects.find(project=>project.id==="sample-04")!;
 return {...project,discipline:replacement.discipline,client:replacement.client,description:replacement.description,coverAlt:replacement.coverAlt,categories:replacement.categories,blocks:replacement.blocks};
}
