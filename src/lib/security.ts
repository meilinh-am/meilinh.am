import { createHash } from "node:crypto";
import { db } from "./db";
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export function checkOrigin(request: Request) {
 const allowed = new URL(process.env.AUTH_URL || process.env.SITE_URL || "http://localhost:3000").origin;
 if (request.headers.get("origin") !== allowed) throw new ApiError(403, "Request origin is not allowed.");
}
export async function rateLimit(identity: string, max: number, seconds: number) {
 const now = Date.now(); const slot = Math.floor(now / (seconds * 1000));
 const key = createHash("sha256").update(identity + ":" + slot).digest("hex");
 const record = await db.rateLimit.upsert({where:{key},create:{key,count:1,expiresAt:new Date((slot+2)*seconds*1000)},update:{count:{increment:1}}});
 if(record.count > max) throw new ApiError(429,"Too many requests. Please try again later.");
}
export function safeUrl(value: string, allowEmpty = true) {
 if (!value && allowEmpty) return true;
 if (/^\/images\/[\w/-]+\.(?:jpe?g|png|webp)$/i.test(value)) return true;
 try { const url = new URL(value); return url.protocol === "https:" || (process.env.NODE_ENV !== "production" && url.protocol === "http:" && url.hostname === "localhost"); } catch { return false; }
}