# Academy milestone: unified device-local learning progress

Status: draft feature branch, not merged or deployed. Independent test and browser verification required.

## Starting point

The Academy already had an opt-in CMS lesson `CompleteLesson` control storing slugs under `kasa-academy-completed-v1`. Older draft PR #10 had a CMS-only dashboard, created before the eight-stage roadmap and compact five-link navigation. This milestone reconciles that draft rather than merging its stale navigation.

## Added

- `/my-learning` combines a read-only editorial course progress dashboard and the older CMS-published-lesson dashboard.
- Covers the six complete file-based courses: Foundations (18), Syntax (16), Algorithms (5), Data (5), Applied (5) and Software Development (5): **54** standalone chapters/labs. Stage 6 experimental modules and Stage 8 project catalog are **not** represented as completed courses.
- `CourseProgressToggle` appears in all 54 standalone lesson routes. The learner chooses when to mark a lesson studied or reverse it.
- Course progress uses `kasa-academy-course-completed-v1`; the older CMS completion key remains `kasa-academy-completed-v1`, avoiding ambiguous overlapping slugs. All identifiers use `course-id/lesson-slug`.
- Browser storage changes and same-tab custom events refresh dashboards; unknown/corrupt progress entries are ignored by the display.
- A per-course count/percentage and a next-unmarked-lesson link help students resume. Minutes are nominal lesson estimates, **not tracked clock time**.
- The CMS dashboard reuses only published `lessons()` / `modules()` and retains the existing access layer.
- The existing five-item global navigation stays unchanged; `My learning` is linked from the footer and the course catalog.
- Responsive dashboard presentation, keyboard focus and semantic progress indicators.

## Important limitations

This is **self-reported study progress, not graded mastery, automatic exercise scoring, certificates or a login-based account**. Merely running code does not mark completion. Browser data can be cleared, blocked or stored independently on different devices. No personal progress is sent to a server. The CMS lesson completion control continues to work with its prior local key.

No Payload CMS migration or reseed, no video/transcript edits, no Studio/WASM modifications and no platform authentication change.

## Test gate

```bash
cd ~/kasa_programming_language/kasa-learning-academy
git fetch origin
git switch --track origin/feat/academy-unified-local-progress-2026
node --test tests/academy-unified-learning-progress.test.mjs
npm run test:smoke
npm run build
git rev-parse --short HEAD
git status --short
```

Then manually open `/my-learning`; mark a chapter studied at `/start/meet-the-computer`, confirm the Foundations count increments and reload retains it; unmark and confirm it decreases. Test a lesson from `/learn/syntax`, `/learn/algorithms`, `/learn/data`, `/learn/applied`, `/learn/development`. Mark one existing published CMS lesson and ensure its separate CMS count updates. In a second tab, confirm cross-tab changes appear; verify an incognito/new-device window starts empty. Confirm the five-link header remains unchanged and existing video/transcript pages work.

After these gates and green GitHub/Vercel checks, use a normal merge commit. Do not merge old PR #10 independently; close it as superseded once the reconciled replacement lands.
