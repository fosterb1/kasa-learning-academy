# Kasa Learning Academy — CMS-powered free programming courses

A **separate, public learning website** for [Kasa Programming Language](https://github.com/fosterb1/kasa_programming_language). Teachers and students can learn Kasa for free; an authorized administrator can edit modules, lessons, code examples, challenges, setup guides and announcements at `/admin` **without changing GitHub code or redeploying**.

## Features

- Responsive learning site: course catalog, 24 prepared interactive lessons, 13 prepared coding challenges and 3 setup guides
- Browser-based Twi-first Kasa code editor with local JavaScript worker, Run, Check and input for `bisa()`
- Lesson quizzes, expected outputs, progress completion stored **only in the browser** (no learner signup)
- Payload CMS v3 on Next.js with PostgreSQL, secured administrator authentication, drafts, versions and publishing
- Admin-controlled lessons, module ordering, challenges, guides and news
- Optional **AI-generated timed captions** from instructor-owned audio clips (server-side Groq integration with admin-only access); editable Twi/English transcripts alongside YouTube videos
- First-admin bootstrap and **idempotent** curriculum seeding scripts

## Requirements

- **Node.js 24.22.3+** (aligned with the current Payload/Next requirements); npm
- Docker Engine with Compose, or an available PostgreSQL server
- This is a **dynamic Node + PostgreSQL web application**, **not a static ZIP**. Netlify Drop alone will not host its CMS.

## Local installation

```bash
git clone https://github.com/fosterb1/kasa-learning-academy.git
cd kasa-learning-academy
cp .env.example .env.local
# Edit .env.local: set unique PAYLOAD_SECRET (at least 32 characters),
# ADMIN_EMAIL, and a strong ADMIN_PASSWORD of at least 16 characters.
docker compose up -d
npm install
npm run generate:importmap
npm run generate:types
npm run bootstrap:admin
# To import the starter content once, set SEED_CONTENT=yes in .env.local:
npm run seed
npm run dev
```

For Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`. Open **http://localhost:3000** for the public site, and **http://localhost:3000/admin** to log in as the administrator created by the bootstrap script. The seed script adds 24 published lessons, 13 challenges, 3 setup guides and 5 modules; it **never overwrites** existing documents.

### First administrator: important security detail

The public website does **not** allow account creation. You **must** run `npm run bootstrap:admin` once with private environment variables before logging in. Do not commit `.env.local` or run the bootstrap script with a shared/default password. Once a user exists, rerunning it does not change that account's password. Administrators manage any additional users through `/admin`.

### Automatic lesson transcription

Add a private `GROQ_API_KEY` to the Vercel project's Production environment and redeploy. In `/admin → Lessons`, attach your YouTube recording, then use **Generate transcript with AI** inside the Twi or English transcript field. Upload an original recording under 3.5 MB; the server calls Groq without exposing your key to browsers. Inspect every generated caption and **Save/Publish** explicitly. Twi support is experimental and requires human correction. Uploading a YouTube URL alone does not obtain or transcribe its audio. Full instructions: [Video Classroom](docs/VIDEO_LESSONS.md).

### Content workflow

Log into `/admin`, open **Lessons**, and choose Create New. Choose a module, enter text, code and an optional quiz, then save as Draft. Use Publish to make the lesson visible to everyone. The same process applies to Guides, Challenges and Announcements. Visitors only receive published documents.

## Hosting online

Use a host that supports **a persistent Node server and PostgreSQL**. Create a managed Postgres database, deploy this GitHub repository as a Node web service, set `DATABASE_URL`, `PAYLOAD_SECRET` and `NEXT_PUBLIC_SITE_URL=https://your-academy-domain.example`, and configure Node 24+. The build command is `npm install && npm run build`, and the start command is `npm run start`. **Before the first production start**, create and commit a reviewed initial PostgreSQL migration (`npm run db:migrate:create` against a development database), then run `npm run db:migrate` against production. Never rely on development database schema push in production. Use a platform shell or a securely configured local environment to run `npm run bootstrap:admin` and `npm run seed` against the production database **once**. Configure automated database backups and HTTPS.

**Do not host this project as a static Netlify Drop upload:** it would show only static assets and cannot authenticate admins or persist CMS changes. The old Kasa Playground remains on your original Netlify site until you intentionally replace it.

## Development checks

```bash
npm run test:smoke
npm run generate:importmap
npm run generate:types
npm run build
```

The smoke tests validate curriculum data and Kasa sample execution locally, without a database. A complete CMS integration test additionally needs the actual dependencies and PostgreSQL service. **No dependency lockfile or database migration has been generated in this initial scaffold** because the build environment could not reach the npm registry. Run `npm install` with internet access, commit `package-lock.json`, generate/review an initial DB migration and verify `npm run build` before production deployment.

## Repository layout

```text
src/app/(site)/           Free public pages and course views
src/app/(payload)/        Payload CMS admin/API routes
src/collections/          CMS content, drafts, permissions and user auth
src/components/           Kasa editor, quiz and progress components
src/lib/content.ts        Public published-only server queries
scripts/bootstrap-admin.ts  One-time first administrator
scripts/seed.ts             Import prepared curriculum without overwrites
scripts/content/           Initial 24-lesson curriculum
public/kasa-runtime.js      Versioned browser-language snapshot
public/kasa-worker.js       Web Worker execution isolation
docs/                       Architecture notes
```

## Maintainer notes

This repository is separate from the compiler repo to avoid coupling CMS deployments to language releases. It is a source prototype until dependencies, migrations, auth and hosting are validated in the target environment. A license has **not yet been selected**; do not assume unrestricted third-party reuse until the repository owner adds one.


## Netlify playground inside Academy — CMS-controlled

The Academy now has a **/playground** page for the full Netlify-hosted Kasa interpreter. The Netlify URL is **editable without redeploying**: log in at `/admin`, choose **Website Settings → Playground Settings**, paste the HTTPS Netlify site-root URL and Save. Existing lesson and challenge editors still use their local JavaScript interpreter; they are not replaced.

Before the field becomes available, apply the new **additive** CMS migration `20261118_200729` through the approved production database workflow (`npm run db:migrate` with authorized credentials). It creates the single `playground_settings` table without altering lesson, video, user or challenge tables. Before setup, the full-playground page falls back to the local browser interpreter. The remote iframe and external link appear only after the URL is saved. See [Netlify Playground CMS setup](docs/NETLIFY_PLAYGROUND_CMS.md).

The standalone playground is published separately using `fosterb1/kasa_programming_language` and its Netlify build configuration. **Do not deploy this dynamic Academy CMS as a static ZIP.**

## Missing video on a published lesson

The public lesson page displays a video only when the **published** lesson has a valid YouTube URL. If a video was entered but cannot be seen, go to **/admin → Lessons → the exact lesson → YouTube lesson URL**. Confirm the URL is on that lesson (not a separate module), click **Publish** (not only Save Draft), and reload the public lesson page. The course index now labels videos explicitly; lessons without a video say **Text + interactive code**. A valid YouTube link must be public or unlisted and allow embedding. The academy does **not** store uploaded video files; it embeds YouTube videos. Existing CMS content is never overwritten by the seed script. If you published and the video still does not appear, check the active production database, the published version and whether Vercel deployed the current revision.

The additional market-profit, student-average, stock-reorder and saving-target lessons are new seed entries. For a database that was already seeded, run the idempotent seeder again with the documented environment setting and authorized database access. It inserts the new lessons while preserving all existing lesson edits, including video URLs and transcripts.

## Ghana-first learning expansion (November 2026)

Every one of the 24 bundled lesson slugs now has an authored study chapter and study companion (objectives, multiple concept explanations, computing vocabulary, guided practice, common mistakes, independent assignments, and review prompts). The companion is rendered alongside existing CMS records, without editing users' videos, captions or lessons. These are deliberately short instructional chapters and **not yet equivalent in depth to a complete Python textbook**.

The public **/glossary** explains current Kasa keyword behavior in English and points to the ongoing Twi terminology audit; the programming vocabulary is not certified as a native-language translation. The public **/projects** catalog contains five Ghana-oriented practice assignments (receipts, marks, reorder decisions, savings, and trotro fare calculation). They are bundled as read-only web content, independent of the CMS seed, and each project has a functional browser editor.

The in-lesson code editor now supports sample-output matching and beginner-friendly debugging suggestions, with repeatable runs after ordinary execution errors. **Output matching is not a secure auto-grader or proof of correctness for arbitrary inputs**; future assessment development requires hidden test coverage and careful security controls.

The JSON curriculum also contains 24 starter lessons and 13 practice entries. **The existing production CMS has its own records**; the idempotent seed script must be executed through an authorized application environment to insert missing curriculum entries. Do not manually overwrite edited records, including videos, or treat GitHub changes as evidence that the PostgreSQL records were automatically inserted.

The new public project pages and study companions require no database migration; they ship through existing Vercel Git deployments. To verify, open /learn/variables, /projects/p9 and /glossary, and exercise the Kasa code worker. Development checks include `npm run test:smoke`; CI smoke tests are not run by the normal production build unless explicitly configured.
