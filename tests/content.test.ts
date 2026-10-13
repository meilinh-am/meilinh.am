import test from "node:test";
import assert from "node:assert/strict";
import {siteSchema,projectSchema,contactSchema,cleanHtml} from "../src/lib/validation";
import {sampleSite,sampleProjects} from "../src/lib/sample";
import {embedUrl} from "../src/lib/embeds";
test("sample content satisfies the same contracts as owner mutations",()=>{assert.equal(siteSchema.safeParse(sampleSite).success,true);for(const p of sampleProjects)assert.equal(projectSchema.safeParse(p).success,true);});
test("rich content strips executable tags, attributes and dangerous links",()=>{const result=cleanHtml('<p onclick="alert(1)">Hello <strong>world</strong><script>alert(1)</script><a href="javascript:alert(1)">link</a><img src=x onerror=alert(1)></p>');assert.match(result,/<strong>world<\/strong>/);assert.doesNotMatch(result,/script|onclick|onerror|javascript:|<img/);});
test("content rejects dangerous URLs, malformed slugs and duplicate block identifiers",()=>{assert.equal(siteSchema.safeParse({...sampleSite,portrait:"javascript:alert(1)"}).success,false);assert.equal(projectSchema.safeParse({...sampleProjects[0],slug:"../../owner"}).success,false);assert.equal(projectSchema.safeParse({...sampleProjects[0],blocks:[sampleProjects[0].blocks[0],sampleProjects[0].blocks[0]]}).success,false);});
test("contact validation rejects malformed addresses and empty messages",()=>{assert.equal(contactSchema.safeParse({name:"Jane",email:"invalid",subject:"Hello",message:""}).success,false);assert.equal(contactSchema.safeParse({name:"Jane",email:"jane@example.com",subject:"Design enquiry",message:"I'd like to discuss a design project.",website:""}).success,true);});
test("iframe embeds only use explicitly supported HTTPS platform hosts",()=>{assert.equal(embedUrl("https://evil.example/embed"),null);assert.equal(embedUrl("https://www.youtube.com.evil.example/watch?v=dQw4w9WgXcQ"),null);assert.equal(embedUrl("javascript:alert(1)"),null);assert.equal(embedUrl("https://youtu.be/dQw4w9WgXcQ"),"https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");assert.equal(embedUrl("https://vimeo.com/123456"),"https://player.vimeo.com/video/123456");});

test("homepage copy refresh preserves custom owner content",async()=>{
 const {refreshSampleSite}=await import("../src/lib/presentation");
 const original={...sampleSite,role:"Independent creative / Selected portfolio",workTitle:"A few things I've made.",intro:"An introduction written by the owner."};
 const refreshed=refreshSampleSite(original);
 assert.equal(refreshed.role,"Portfolio");
 assert.equal(refreshed.workTitle,"A visual journal.");
 assert.equal(refreshed.intro,original.intro);
 assert.equal(original.role,"Independent creative / Selected portfolio");
});
test("legacy editorial sample preserves custom imagery and real projects",async()=>{
 const {refreshSampleProject}=await import("../src/lib/presentation");
 const original={...sampleProjects[3],discipline:"ui-ux" as const,cover:"https://example.com/custom-image.jpg"};
 const refreshed=refreshSampleProject(original);
 assert.equal(refreshed.discipline,"graphic-design");
 assert.equal(refreshed.cover,original.cover);
 assert.ok(!refreshed.categories.includes("Website Design"));
 assert.equal(original.discipline,"ui-ux");
 const custom={...original,placeholder:false};
 assert.equal(refreshSampleProject(custom),custom);
});
