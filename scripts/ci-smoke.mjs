import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {once} from "node:events";

const port = 3100;
const base = `http://127.0.0.1:${port}`;
// Exercise the production build in sample mode without accessing a real database.
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  env: {...process.env, DATABASE_URL: "", DIRECT_URL: "", AUTH_SECRET: "ci-only-placeholder-not-a-production-secret", AUTH_URL: base, SITE_URL: base, NEXT_TELEMETRY_DISABLED: "1"},
  stdio: ["ignore", "pipe", "pipe"],
});
let output = "";
let startupError;
server.on("error", error => { startupError = error; });
for (const stream of [server.stdout, server.stderr]) {
  stream.on("data", chunk => { output = (output + chunk.toString()).slice(-12000); });
}
const request = path => fetch(base + path, {redirect: "manual", signal: AbortSignal.timeout(10000)});

try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (startupError) throw startupError;
    if (server.exitCode !== null) throw new Error(`Production server exited with ${server.exitCode}`);
    try { ready = (await request("/")).status === 200; } catch {}
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert.ok(ready, "Production server did not become ready");
  for (const path of ["/", "/marketing", "/graphic-design", "/photography", "/contact", "/projects/form-and-feeling", "/projects/a-moment-in-between", "/owner/login"]) {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /<h1\b/, `${path} has a page heading`);
    assert.doesNotMatch(html, /href="\/ui-ux"/, `${path} has no removed page links`);
  }
  assert.equal((await request("/ui-ux")).status, 404, "Removed UX/UI page");
  const sitemap = await request("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  assert.match(xml, /\/photography<\/loc>/);
  assert.doesNotMatch(xml, /\/ui-ux<\/loc>/);
  assert.equal((await request("/images/meilinh-am.png")).status, 200, "Portrait asset");
  for (const path of ["/api/manage", "/api/upload"]) {
    const response = await fetch(base + path, {method: "POST", headers: {Origin: base, "Content-Type": "application/json"}, body: "{}", signal: AbortSignal.timeout(10000)});
    assert.equal(response.status, 401, `${path} requires authentication`);
  }
  const owner = await request("/owner/projects");
  assert.ok([302, 303, 307, 308].includes(owner.status), "Owner studio redirects visitors");
  assert.match(owner.headers.get("location") || "", /\/owner\/login/);
  console.log("Production smoke checks passed: public pages, removed route, sitemap, portrait and owner authorization.");
} catch (error) {
  console.error(output);
  throw error;
} finally {
  if (server.exitCode === null && !startupError) {
    const closed = once(server, "exit");
    server.kill();
    await closed;
  }
}
