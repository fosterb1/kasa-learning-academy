# Stage 3 — Problem Solving and Algorithms

Status: development branch and draft PR; **not merged or deployed**.

## Curriculum

Five text-first, interactive lessons:
1. Trace an algorithm step by step (30 min)
2. Find an item with linear search (40 min)
3. Find the largest value safely (35 min)
4. Sort a list using comparisons: bubble sort (45 min)
5. Compare algorithm costs: O(n) vs O(n²) (35 min)

Content lives in `src/lib/algorithms-course.json`. `/learn/algorithms` is the course overview; `/learn/algorithms/[slug]` has a single embedded Kasa editor per lesson with runnable source, exact sample output, trace, Big-O discussion, independent exercise, acceptance checklist, review question and previous/next links. Stage 3's route and course-map entry point here only in this feature branch.

These pages use core Kasa; there is no experimental module import, interpreter modification, database seed, CMS migration, or modification of published videos/transcripts. Correct sample output is not a security-grade grader or complete proof that a student's changed code is correct. There are no automatic stage unlocks, certificates, or persistent graded assessments.

## Verified runtime examples

Executed programmatically against the exact `public/kasa-runtime.js` source from main:
- trace-steps => `25\n`
- linear-search => `nokware\n`
- maximum-value => `-2\n`
- bubble-sort => `1\n3\n6\n8\n`
- count-operations => `4\n16\n`

Five modified-input cases also matched: no search hit (`atoro\n`), positive maximum (`16\n`), duplicate sort (`1\n2\n5\n5\n`), n=8 costs (`8\n64\n`), expanded basket (`35\n`). Regression tests execute all 10 programs in `tests/academy-algorithms-course.test.mjs`.

## Independent acceptance gate (Cloud Shell)

```bash
cd ~/kasa_programming_language/kasa-learning-academy
git fetch origin
git switch --track origin/dev/academy-stage3-algorithms-course
node --test tests/academy-algorithms-course.test.mjs
npm run test:smoke
npm run build
git rev-parse --short HEAD
git status --short
```

Check `/learn`, `/learning-path/problem-solving`, `/learn/algorithms`, and the five `/learn/algorithms/[slug]` pages in the preview. Test keyboard navigation and the embedded editor. Verify old CMS video lessons remain unchanged. The Vercel PR deployment and actual production deployment are separate gates. Do not merge solely on source-level or PR status checks.

## Next milestone

Stage 4 data structures follows Stage 3. Keep file-based editorial courses while this accelerates development; plan a separate backed-up, rehearsed CMS import later.
