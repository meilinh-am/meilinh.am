# Beyond Ordinary — Creative Portfolio

A unified Next.js App Router application with TypeScript, React, Tailwind CSS, Motion, Lenis, Tiptap, Prisma, Auth.js, and Supabase PostgreSQL + Storage.

## Local preview

Node.js 22 LTS is recommended. A checksum-verified portable Node runtime has been installed in the ignored `.tools` directory on this workstation.

On this workstation run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-local.ps1
```

On another machine:

```sh
npm ci
npm run db:generate
npm run dev
```

Visit http://localhost:3000. Without DATABASE_URL the portfolio renders clearly labeled sample content. Login, editing, uploads and contact submission remain unavailable until the backend is configured. This mode is a public visual preview, and does not simulate successful persistence.

## Connect your Supabase project

1. Copy `.env.example` to `.env`. Never commit this file.
2. From Supabase's **Connect** dialog, copy the **Transaction pooler** connection into DATABASE_URL (usually port 6543) and add `pgbouncer=true&connection_limit=1`. Set DIRECT_URL to the **Session pooler** (5432) or direct connection suitable for your network. URL-encode reserved characters in the database password.
3. Set SUPABASE_URL and the server-only SUPABASE_SERVICE_ROLE_KEY. In Supabase Storage, create a **public** bucket named `portfolio`; keep uploads restricted to server-side service access. Do not create anonymous upload policies. Set the bucket limit to 50 MB and allowed MIME types to image/jpeg, image/png, image/webp, video/mp4, video/webm, application/pdf. Public bucket media is visible to anyone with its URL, including media uploaded for drafts.
4. Generate AUTH_SECRET using `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`. Set OWNER_EMAIL and a unique OWNER_PASSWORD of at least 14 characters. Set AUTH_URL and SITE_URL to http://localhost:3000 for development.
5. Run:

```sh
npm run db:deploy
npm run db:seed
npm run dev
```

6. Sign in at **/owner/login**. The floating **Edit portfolio** control appears only for authenticated owners. Replace the sample name, portrait, address, project imagery and biographies.
7. Remove OWNER_PASSWORD from your deployed environment after seeding. Seeding preserves existing content and existing owner passwords. To rotate a password, update the bcrypt hash through a trusted database administration process.

Reference: [Supabase database connections](https://supabase.com/docs/guides/database/connecting-to-postgres) and [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).

## Editing workflow

- Click outlined text directly to edit headings, introductions and navigation.
- **Settings** provides portrait upload, position, crop scale, decoration toggles, background composition, Tiptap biography editing, services, CV upload, contact links, SEO and all page/category/button labels.
- **Save draft** persists content without changing what visitors see. Draft autosave starts a few seconds after a change. **Publish** commits content for visitors. **Cancel** discards the current draft.
- **Projects** opens the project studio at /owner/projects. Create, duplicate and drag projects to reorder; arrow buttons are the keyboard alternative.
- Open a project and choose **Edit this project**. Change its fields and categories, upload cover/media, add layout blocks, drag blocks to reorder, and toggle publication/featured/sample status.
- **Save & publish state** commits the project with its selected publication state; unchecking “Visible to visitors” unpublishes it.
- Layout blocks: text, image, gallery, video, columns, quote, before/after comparison, external embed, statistics. Empty story sections are hidden.
- Galleries support full, two-column, collage, carousel, split and mockup presentation. Photo viewing has next/previous, arrow keys, Escape and zoom.
- Video files play directly. YouTube, Vimeo and Figma use explicitly supported embeds after visitor consent. Instagram, TikTok, Facebook, Behance and custom URLs open the linked platform.
- Site and project history restores previous published content into a draft. Project deletion requires confirmation and retains a database snapshot. The UI does not restore deleted projects automatically.
- Media records remain in the library after removing a reference so revision images keep working. Unused cloud assets need deliberate administrative cleanup.

## Contact inbox and notifications

Messages are validated, honeypot checked, database rate limited and stored in PostgreSQL. Owners can inspect the inbox from Edit Mode. Optional Resend notifications use RESEND_API_KEY, CONTACT_NOTIFY_EMAIL, and CONTACT_FROM_EMAIL (a verified sender). Failed notifications do not discard enquiries.

## Database and security

All mutation routes verify an Auth.js session and re-check the OWNER role in PostgreSQL. Cross-origin mutations are rejected. Inputs are strictly validated; rich text is sanitized; uploads are size, MIME and signature checked. Storage credentials never reach the browser. Auth.js handles login CSRF and secure production cookies. Passwords use bcrypt cost 12; login attempts are database limited.

The initial migration enables RLS on application tables with no browser policies. Application access runs through the trusted server's PostgreSQL connection. Do not grant anonymous or authenticated Supabase API access to users, messages, settings, drafts or revisions. Supabase Auth is not used; account authentication uses Auth.js as requested.

Content versions protect saves against stale tabs. Revisions are created transactionally with publication. Drafts and publication states persist across refreshes. Navigation away from a project may leave an autosaved draft; use explicit save before navigating.

Use a reverse proxy that replaces untrusted X-Forwarded-For headers for contact IP limits. Email and global database limits remain active independently. Periodically delete expired RateLimit rows (seeding also performs this cleanup). For high traffic, add edge rate limiting and a CAPTCHA provider. These integrations are not currently configured.

## Production deployment

Deploy this application to a Node.js-capable Next.js host, such as Vercel or a Node/Docker platform. The requested Next.js + Prisma stack has not been converted to the Sites Vinext/Cloudflare runtime.

1. Create the Supabase project and storage bucket, configure environment variables, migrate and seed as above.
2. Set AUTH_URL and SITE_URL to the same HTTPS production origin.
3. Run `npm ci`, `npm run db:deploy`, and `npm run build`. Start with `npm start`.
4. Allow at least 50 MB request bodies on a Node reverse proxy if using server uploads. Some serverless hosts impose much smaller payload limits (including Vercel functions); on those hosts use smaller media or implement signed direct/resumable uploads before enabling large videos.
5. Confirm owner login, uploads, draft refresh, publication, conflict detection, revision restore, CRUD, and contact persistence against the real Supabase project before considering the deployment production verified.
6. Configure a backup and retention policy for Supabase and rotate credentials through the deployment provider.

No Supabase project or hosting account has been configured by this build. Live database/media/notification verification and deployment require those credentials.

## Validation

```sh
npm run typecheck
npm test
npm run build
```

Security tests cover rich-text sanitization, content contracts, unsafe links, duplicate block IDs, contact validation and iframe host restrictions. Route smoke checks verify the public pages and deny unauthenticated mutation requests.

## Source map

- src/app — five primary pages, project routes, owner login/studio, API handlers, metadata/sitemap
- src/components — portfolio layouts, galleries, rich editor, upload controls, site/project editing
- src/lib — sample content, validation, authorization, embeds, database integration
- prisma — normalized schema, initial migration, idempotent seed
- .env.example — configuration template

Sample photographs are served from Unsplash; they are illustrative assets, not the owner's photography. Replace them with owned or properly licensed media before launching. No client claims, testimonials, or campaign metrics have been invented.

## CI/CD

GitHub Actions runs checks and deploys to Vercel: pull requests get previews and pushes to master deploy to production after checks pass. See [setup and secrets](docs/ci-cd.md).
