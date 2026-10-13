# GitHub Actions and Vercel

The pipeline is in `.github/workflows/ci-cd.yml`. Production follows `master`, the current repository branch.

| Event | Checks | Deployment |
| --- | --- | --- |
| Pull request targeting `master` | Prisma validation/generation, Next.js route types, TypeScript, tests, production build, HTTP smoke checks | Vercel Preview after checks pass, for PRs from this repository |
| Push to `master` | All checks | Vercel Production after checks pass |
| Manual run on `master` | All checks | Vercel Production |
| Manual run on another branch | All checks | None |
| Fork pull request | All checks without deployment secrets | None |

CI uses Node.js 22 and `npm ci`. Builds and smoke checks use sample content without a database. The deploy job rebuilds with the selected Vercel environment and uploads that output with `--prebuilt`; Vercel does not rebuild the uploaded artifact. A failed check prevents deployment. Deployment URLs appear in the GitHub job summary and environment history. Production deployments are serialized; superseded preview runs are canceled.

## One-time setup

1. Create/import a Next.js project on Vercel for this repository, with the repository root as its root directory. Select Node.js 22.x and `master` as its production branch. `vercel.json` disables automatic Git deployments so GitHub Actions owns deployment and checks cannot be bypassed by a parallel Git deployment.
2. Create a Vercel token at <https://vercel.com/account/tokens>. Link the project locally with the Vercel CLI (`npx vercel@63.1.2 link`). Read `orgId` and `projectId` from the generated `.vercel/project.json`; this directory is ignored by Git.
3. In GitHub **Settings > Secrets and variables > Actions**, add these repository secrets:

   | Secret | Value |
   | --- | --- |
   | `VERCEL_TOKEN` | Vercel token with access to the project |
   | `VERCEL_ORG_ID` | `orgId` from `.vercel/project.json` |
   | `VERCEL_PROJECT_ID` | `projectId` from `.vercel/project.json` |

4. Create GitHub environments named `preview` and `production`. Set production deployment branch restrictions to `master`. Require the `Checks and build` status in the repository's branch protection/ruleset. Environment approval gates are optional if desired.
5. Set the application's values from `.env.example` in Vercel's **Environment Variables** for Production and Preview. Use a separate database/storage configuration for Preview. Set `AUTH_SECRET`, `AUTH_URL`, and `SITE_URL` to the appropriate environment's values. For owner login on a changing preview URL, provide a stable preview origin or update the configured URL; prebuilt deployments cannot assume Vercel system URL variables exist during the build.
6. Initialize the database and owner account once using the README's `db:deploy` and `db:seed` instructions. Keep `OWNER_PASSWORD` out of GitHub Actions; remove it from deployed environments after initialization. Seeding is deliberately not automatic.
7. Push this setup to `master` or run **Actions > CI/CD > Run workflow** on `master`.

Missing Vercel secrets fail the deploy job with a setup message; CI still works. The workflow files alone do not create the Vercel project or populate account secrets.

## Database migrations

Automatic migrations are opt-in per GitHub environment. To enable them, set the environment variable `RUN_DATABASE_MIGRATIONS` to `true`, and add environment secrets `DATABASE_URL` (runtime/pooler connection) and `DIRECT_URL` (migration connection). These must point to the same database as the matching Vercel environment. Without the flag, migration management remains manual.

The deploy job runs `prisma migrate deploy` before the Vercel build. A migration failure stops deployment. Preview must use its own database; never expose production database credentials to preview builds. Make migrations backward compatible with the currently deployed application: database changes are not rolled back if a later build or deployment fails. Do not use `prisma migrate dev`, `db push`, or automatic seeding in production CI/CD.

## Local validation

```sh
npm ci
npm run db:generate
npx next typegen
npm run typecheck
npm test
npm run build
npm run test:smoke
```

`test:smoke` starts the already-built production server on port 3100, checks public routes, the removed UX/UI route, sitemap, portrait asset, and owner authorization, then stops the server. Keep that port free. These checks validate sample mode; real login, persistence, uploads, and notifications still need verification against the configured backend.

Vercel CLI is pinned to 63.1.2. Upgrade it deliberately and rerun the checks. Node.js is constrained to 22.x in `package.json`.

Reference: [Vercel's GitHub Actions deployment pattern](https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel) and [Git deployment controls](https://vercel.com/docs/project-configuration/git-configuration).
