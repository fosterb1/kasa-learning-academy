# Stage-first Academy navigation — read-only rollout

## Student experience

The Academy's main `/learn` page now leads with **eight curriculum stages**. Selecting a stage opens `/learning-path/[slug]`, where learners see a **course → existing CMS module → published lesson** progression. Standalone course collections (18 foundations chapters, 16 syntax chapters, five applied labs, one experimental pinned-modules lesson and the project catalog) are linked as their own course entries. Planned stages explicitly display “In development” instead of pretending to offer completed content.

The old five-module Lesson Library is preserved as a secondary, expandable section on `/learn#lesson-library`. It remains available independently of course-stage mapping, so administrators can publish new lessons without losing visibility. No CMS fields, Payload migrations, lesson IDs, published versions, video URLs, transcripts or Studio assets are changed.

## Course mapping rules

`src/lib/stage-course-map.json` is an **editorial crosswalk**, not a new CMS relationship and not a security access-control system. The existing five module slugs are mapped once each:

- **Stage 2:** Getting started, Core foundations, Control flow, Data and input.
- **Stage 5:** Build real projects.

The other stages point to their established standalone courses or display a planned course. Each stage detail calls the existing `modules()` and `lessons()` readers only when it needs CMS modules; lesson links use original slugs and published `videoUrl` values for media badges. Missing or renamed CMS modules are not silently populated or recreated; the stage shows a notice and a link to browse the canonical Lesson Library.

This is **not** a permanent database-level `Learning Path → Course → Module → Lesson → Exercise` implementation. That would require a separately approved schema, backup, migration, roll-back plan and live-data verification. Existing videos remain authoritative and attached by CMS lesson ID.

## Test gate and interaction checks

```bash
cd ~/kasa_programming_language/kasa-learning-academy
git fetch origin
git switch --track origin/dev/academy-stage-first-course-navigation
node --test tests/academy-stage-course-mapping.test.mjs
npm run test:smoke
git status --short
```

Verify the Academy in a staging preview before merging:

1. `/learn` shows eight stage cards first; the original five-topic library is collapsed beneath.
2. `/learning-path/syntax` links to the syntax course, plus published CMS lessons grouped by existing topics.
3. `/learning-path/applied` links to five applied labs and original published project lessons.
4. `/learning-path/problem-solving` transparently says the course is not yet available; do not deploy incomplete Stage 3 work under that route.
5. Open a CMS lesson with a valid published YouTube URL and confirm its player and transcripts remain present.
6. Expand the Lesson Library, browse its five modules, and confirm every old lesson route works.

The CSS-only cleanup in draft PR #15 overlaps `/learn` presentation. **Reconcile PR #15 before merging both** rather than overwriting either set of changes. Draft Stage 3 algorithm data remains separate until its own runtime verification.
