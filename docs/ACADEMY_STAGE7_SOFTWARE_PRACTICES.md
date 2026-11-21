# Stage 7 — Software Development Practices

Status: Draft feature; **not merged or deployed**.

## Five lessons

1. Debug using a trace (35 min)
2. Design normal, boundary and invalid-input test cases (40 min)
3. Refactor repeated calculations into a function (40 min)
4. Plan a Git branch/commit/test/review workflow (35 min)
5. Document and verify a small inventory project (45 min)

Content: `src/lib/development-course.json`.
Learner routes: `/learn/development` and `/learn/development/[slug]`.
Stage 7 editorial mapping and roadmap link are updated only in the feature branch.

Each lesson has a core-Kasa worked example, predicted output, one editor, trace, independent task, acceptance checklist, complexity note, optional revealed explanation and previous/next navigation.

## Technical boundaries

- Core Kasa can execute the example code; **Git shell commands are not Kasa language constructs** and are not run in the Academy editor.
- A README is a separate document, not auto-generated or stored by a Kasa program.
- The sample output comparator is not a full assessment, hidden-test grader or account-backed completion/certificate.
- No change to native interpreter, Studio release assets, CMS collections, saved videos, transcripts or database schema.
- A Git workflow requires a local checkout and Git tooling; use a sandbox or educational repository rather than an unreviewed change to production.

## Runtime verification

Five worked examples and five modified-input cases were executed against the exact main-branch `public/kasa-runtime.js`. All ten produced the expected output.

## Independent Cloud Shell gate

```bash
cd ~/kasa_programming_language/kasa-learning-academy
git fetch origin
git switch --track origin/dev/academy-stage7-software-practices
node --test tests/academy-development-course.test.mjs
npm run test:smoke
npm run build
git rev-parse --short HEAD
git status --short
```

Preview `/learn`, `/learning-path/development`, `/learn/development`, and all five lessons. Confirm the Kasa editor works and existing CMS lesson video/transcript pages remain unchanged. Merge only after independent smoke/build confirmation and PR checks.
