# Connect the Netlify Playground through Payload CMS

The **full playground URL is maintained in the academy admin dashboard**. You do not need to edit code or environment variables to change the Netlify site.

## Admin workflow

1. Publish the standalone `fosterb1/kasa_programming_language` playground on Netlify, using the verified real-WASM build.
2. Apply the additive academy migration `20261118_200729` using the already configured secure production database deployment workflow. Back up the database first. **Do not run `migrate:fresh`, `migrate:reset` or create new first-user accounts.** Example from a trusted checkout with authorized direct database credentials: `npm run db:migrate`.
3. Open the academy CMS at `/admin` and sign in as an existing administrator.
4. Under **Website Settings → Playground Settings**, paste the full HTTPS Netlify address into **Netlify Playground URL** (for example, `https://your-kasa-playground.netlify.app/`) and **Save**.
5. Visit `/playground` on the academy. It embeds the Netlify site inside the learning platform and provides a separate-tab fallback. The main navigation, lessons and challenges link to that full page. Existing lesson/challenge inline editors remain available.
6. To change Netlify domains later, simply edit the field and save. The page reads live CMS content on every request; no academy redeployment is necessary.

## Validation and migration behavior

- The setting accepts only **HTTPS site-root URLs** with no credentials, query or fragment; the server checks the same before embedding.
- If the setting is blank, or the settings table does not yet exist (PostgreSQL `42P01` before migration), the academy full-playground page uses its existing local JavaScript interpreter. Unexpected database errors are surfaced rather than hidden.
- The global settings are admin-editable only and are not exposed through a public CMS read endpoint. The sanitized URL is intentionally visible to visitors as the embedded iframe destination.
- The new migration adds one table `playground_settings` with an optional `playground_url` column. No existing users, lessons, courses, videos, challenges or settings are removed.
- The Netlify site must permit embedding by the academy's origin via its `frame-ancestors` Content-Security-Policy. The companion Netlify config supports HTTPS embedding initially. Restrict it to confirmed academy domains in production.
- Since this iframe loads a separate origin, the Netlify site retains its own local source-draft storage. Existing in-lesson editor drafts are not automatically transferred into the iframe. Cross-origin iframe communication is intentionally not added.
- Changes require the academy to deploy this code and run the additive migration **once**. Subsequent Netlify URL changes happen directly in the CMS.

The academy stays on its existing dynamic Next.js/Payload/PostgreSQL host; Netlify serves only the static WASM playground. An HTML iframe does not provide CMS administration or student progress syncing by itself.
