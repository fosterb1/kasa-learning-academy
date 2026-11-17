# Why the Kasa Academy homepage reports a server error

The deployment build succeeded, but the **Neon PostgreSQL database has not been initialized**. Vercel runtime error digest `1739420044` corresponds to PostgreSQL `42P01`: missing `challenges`, `modules` and `lessons` tables. Reloading does not repair missing tables.

## Prepare Payload CMS's first migration (do this once)

1. Install Node.js **24.x** on a trusted computer.
2. Clone `https://github.com/fosterb1/kasa-learning-academy` and open the directory.
3. Copy `.env.example` to a private `.env.local` in the project root. In Neon Console, select **kasa-learning-academy → main → neondb**, and copy the **direct (non-pooled)** database connection string. Set `DATABASE_URL` to that value. Set a unique `PAYLOAD_SECRET` of 32+ characters. Keep these secrets **out of GitHub and chat**. Set `NEXT_PUBLIC_SITE_URL=https://kasa-learning-academy.vercel.app`.
4. In the project directory, run:

```bash
npm install
npm run db:migrate:create -- --skip-empty
```

5. Review the generated files in `src/migrations/` (especially the SQL in the `up` function). The initial migration should create the required tables. It should not delete any existing data. For safety, test it on Neon's isolated staging branch first.
6. When ready, apply the reviewed migration with the **direct** Neon connection:

```bash
npm run db:migrate
npx payload migrate:status
```

7. Verify tables `users`, `modules`, `lessons`, `challenges`, `guides`, `announcements` in the Neon Console.
8. Create the first admin by putting private `ADMIN_EMAIL` and a unique 16+ character `ADMIN_PASSWORD` in `.env.local`, then run `npm run bootstrap:admin`.
9. Set `SEED_CONTENT=yes` in the private `.env.local` and run `npm run seed` to import 20 lessons, eight challenges, three guides and five modules. The seed script checks existing content before writing.
10. Commit the reviewed `src/migrations` files (and `package-lock.json`) to GitHub, but **never commit .env.local**. Refresh the homepage and verify an individual lesson, code execution, and admin login at `/admin`.

**Important:** The encrypted Vercel production `DATABASE_URL` is already set to the **pooled** Neon connection for normal web traffic. Do not replace it with a public connection string. For migration commands, prefer a **direct** connection. Never use `migrate:fresh` / `migrate:reset` on production.

If the homepage displays a temporary setup notice, the schema is still missing; the notice is not proof of a completed migration. It is deliberately shown instead of a generic server error for error code `42P01` only. Other server errors still surface normally.
