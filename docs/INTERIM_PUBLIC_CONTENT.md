# Interim public learning pages before the CMS migration

The Neon production project is connected but its Payload CMS tables have not yet been created. PostgreSQL raises `42P01` on requests for `lessons`, `modules`, `challenges` and `guides`.

While those tables do not exist, public routes use a **read-only snapshot of the curriculum committed in the repository**:

- Five learning modules and 20 lessons from `scripts/content/curriculum.json`
- Eight coding challenges from the same curriculum
- Three temporary setup guides
- An empty announcements list (no announcements are fabricated)

The public pages (including each lesson's code editor and quiz) should load and remain free. This is **not a substitute for database initialization**: the `/admin` dashboard, CMS authentication, editing, publishing and database-backed learning content cannot work until the Payload migration is applied.

## Source-of-truth rule

This fallback is triggered **only** by the database error code `42P01`. Once migrations and seeding are completed, existing Payload queries will return database content, not the static files. Other database errors are not caught. A partially initialized database may mix temporary fallback with published content until the migration is completed; finish the migration in one controlled operation.

To complete CMS setup, follow `docs/DATABASE_INITIALIZATION.md`. Do not add a public setup endpoint or bypass administrator authentication.
