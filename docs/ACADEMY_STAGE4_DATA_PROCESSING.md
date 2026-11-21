# Stage 4 — Data Structures and Data Processing

Status: Stage 4 draft course on a feature branch; **not merged, not a live-deployment claim**.

## Scope and learning outcomes

Five text-first core-Kasa lessons, each with a single interactive editor, predicted/exact output, guided trace, algorithmic cost, independent exercise, self-review checklist, review question and previous/next navigation:

1. Nested lists — 35 min; two-column row sums
2. Positional records — 35 min; `[name, quantity, price]` as a documented list convention
3. Numeric range validation — 40 min; count accepted and rejected values
4. Aggregate summaries — 40 min; total, mean, explicit empty-list guard exercise
5. Filtered summaries — 40 min; count and sum positive stock entries

Course data is versioned at `src/lib/data-course.json`; learners use `/learn/data` and `/learn/data/[slug]`. The editorial Stage 4 entry in `learning-path.json` and `stage-course-map.json` points to this route. No Payload CMS schema, migration, database seed, video/transcript, native compiler, Studio worker, or release artifact is modified.

## Honest feature boundaries

These exercises demonstrate **core Kasa lists, numeric arithmetic, conditions and loops only**. Row-shaped nested lists are not a native table; `[name, quantity, price]` is not a native typed record or dictionary. Numeric-range checks are not schema validation or a safety guarantee for arbitrary untrusted input. CSV and JSON parsing/serialization are not taught as core builtins. Previous G1.x experimental prototypes in the language repository do not automatically become supported Academy builtins.

The sample editor output check is not a hidden-test grader, mastery certification or persistent learner progress system. The worked mean example assumes a nonempty dataset; learners must implement an explicit guard in the exercise before dividing by a list's length.

## Reproduced runtime results

Used the exact Academy `public/kasa-runtime.js` from main; five worked programs returned the outputs below, and five changed-input cases also passed.

| Lesson | Worked output | Changed-data output |
| --- | --- | --- |
| Nested rows | `20, 16, 12` | `20, 16, 12, 10` |
| Positional record | `Akua, 96` | `Kojo, 45` |
| Range validation | `4, 1` | `3, 2` |
| Sum/mean | `60, 15.0` | `15, 5.0` |
| Filtered stock | `3, 13` | `2, 6` |

These results are locked down by `tests/academy-data-course.test.mjs`.

## Independent Cloud Shell gate

```bash
cd ~/kasa_programming_language/kasa-learning-academy
git fetch origin
git switch --track origin/dev/academy-stage4-data-processing-course
node --test tests/academy-data-course.test.mjs
npm run test:smoke
npm run build
git rev-parse --short HEAD
git status --short
```

In preview, inspect `/learn`, `/learning-path/data`, `/learn/data`, and each of the five data lesson pages. Check mobile layout, accessibility and runnable output. Check that previously published CMS video and transcript lessons remain intact.

Only merge after independent suite/build verification and green GitHub PR checks. Stage 5 applied labs and subsequent modules remain separate. Do not run a CMS migration for this release.
