import assert from "node:assert/strict";
import {mkdir,writeFile} from "node:fs/promises";
import {chromium} from "../.tools/qa/node_modules/playwright-core/index.mjs";
const base="http://localhost:3000";await mkdir("artifacts",{recursive:true});
const browser=await chromium.launch({executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:"reduce"});
const page=await context.newPage();const errors=[];page.on("pageerror",e=>errors.push(e.message));page.on("console",message=>{if(message.type()==="error" && /hydration|hydrated|didn.t match/i.test(message.text()))errors.push(message.text())});
const routes=["/","/marketing","/graphic-design","/photography","/projects/form-and-feeling","/projects/a-moment-in-between","/owner/login"];
for(const route of routes){const response=await page.goto(base+route,{waitUntil:"networkidle",timeout:90000});assert.equal(response.status(),200,route);await page.locator("h1").waitFor();const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);assert.equal(overflow,false,route+" desktop overflow");console.log("PASS desktop "+route);}
await page.goto(base+"/",{waitUntil:"networkidle"});await page.locator(".project-card").last().scrollIntoViewIfNeeded();await page.waitForTimeout(1200);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:"artifacts/home-desktop.png",fullPage:true});
assert.equal(await page.getByRole("button",{name:/Edit portfolio/i}).count(),0,"Visitors must not see owner controls");
await page.goto(base+"/graphic-design",{waitUntil:"networkidle"});await page.getByRole("button",{name:"Logo Design",exact:true}).click();await page.getByText("No projects in this collection yet.").waitFor();await page.getByRole("button",{name:"All work",exact:true}).click();assert.equal(await page.locator(".project-card").count(),3);console.log("PASS category filtering");
await page.goto(base+"/projects/a-moment-in-between",{waitUntil:"networkidle"});await page.locator(".photo-series button").first().click();await page.getByRole("dialog").waitFor();await page.keyboard.press("ArrowRight");assert.match(await page.locator(".lightbox-top").innerText(),/2 \/ 2/);await page.getByRole("button",{name:"Zoom in",exact:true}).click();assert.equal(await page.locator(".lightbox-image.zoomed").count(),1);await page.keyboard.press("Escape");assert.equal(await page.getByRole("dialog").count(),0);console.log("PASS photo viewer keyboard navigation and zoom");
for(const endpoint of ["/api/manage","/api/upload"]){const response=await context.request.post(base+endpoint,{headers:{Origin:base},data:{}});assert.equal(response.status(),401,endpoint+" owner authorization");}
const crossOrigin=await context.request.post(base+"/api/manage",{headers:{Origin:"https://evil.example"},data:{}});assert.equal(crossOrigin.status(),403);
const inbox=await context.request.get(base+"/api/manage?view=messages");assert.equal(inbox.status(),401);
const contact=await context.request.post(base+"/api/contact",{headers:{Origin:base},data:{name:"Jane",email:"jane@example.com",subject:"Enquiry",message:"A sample enquiry for QA.",website:""}});assert.equal(contact.status(),503,"Unconfigured contact must not claim persistence");
console.log("PASS API authorization, cross-origin rejection and explicit contact setup state");
await page.goto(base+"/owner/projects",{waitUntil:"networkidle"});assert.match(page.url(),/owner\/login/);
await page.setViewportSize({width:390,height:844});
for(const route of routes.slice(0,7)){await page.goto(base+route,{waitUntil:"networkidle"});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1),false,route+" mobile overflow");console.log("PASS mobile "+route);}
await page.goto(base+"/",{waitUntil:"networkidle"});await page.locator(".project-card").last().scrollIntoViewIfNeeded();await page.waitForTimeout(1200);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:"artifacts/home-mobile.png",fullPage:true});
await page.getByRole("button",{name:"Open menu",exact:true}).click();await page.locator("header nav").getByRole("link",{name:"Photography",exact:true}).click();await page.waitForURL("**/photography");assert.equal(await page.getByRole("button",{name:"Open menu",exact:true}).getAttribute("aria-expanded"),"false");console.log("PASS mobile navigation");
assert.deepEqual(errors,[],"Browser runtime errors");
await writeFile("artifacts/qa-results.json",JSON.stringify({routes,desktop:true,mobile:true,filters:true,photoViewer:true,authorization:true,errors},null,2));
await browser.close();console.log("Browser QA passed.");
