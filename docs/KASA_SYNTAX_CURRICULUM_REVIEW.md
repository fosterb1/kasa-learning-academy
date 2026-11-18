# Kasa Academy syntax-track implementation review

Date: 2026-11-19
Stakeholder-reported current platform rating: 35/100. This is not a measured learner-outcome score.

## Problem
The Foundations / Start from Zero track introduces computer concepts, but the CMS learning path only had brief lesson summaries and a runnable code example. A novice had no comprehensive sequence to learn **exact syntax**, reserved words, valid statement forms, grouping, error categories, output tracing, or transfer to other languages.

## Authoritative source of syntax

The course uses the current Kasa language contract at:
https://github.com/fosterb1/kasa_programming_language/blob/main/docs/RFC-0007-core-language-contract.md

and the existing beginner tutorial:
https://github.com/fosterb1/kasa_programming_language/blob/main/docs/TUTORIAL.md

The RFC is a **candidate** language contract, not an approved 1.0 standard. We deliberately do not teach modules, imports, class definitions, web DOM or production currency types because Kasa 0.4 does not have those features. Existing Twi-inspired tokens are still subject to linguistic review. The browser interpreter is the runtime used for examples; Python/native parity may still differ for numeric edge cases.

## Delivered structure

A **16-chapter Kasa Syntax & Language Fundamentals** learning track is accessible from /learn and /learn/syntax.

Each chapter includes:
- What the concept accomplishes
- A formal-ish syntax pattern and meaning
- Table of at least three relevant tokens and their meaning
- Runnable worked example with expected output
- A written stepwise execution trace
- Second runnable example and expected output
- Invalid or misleading form with correction
- Guided practical task and debugging experiment
- Deeper reasoning question and a warning about common mistakes
- Transfer explanation relating the concept to other programming languages

Chapter coverage: source/comments/identifiers; print; values and types; variables; arithmetic and precedence; comparisons; Boolean logic; conditionals; counted loops; while loops; loop control; functions and returns; lists and indexing; list mutation; built-ins; debugging.

## Verification scope

- Two executable examples per chapter are represented in `tests/syntax-course.test.mjs` (**32 cases**), along with content checks. Merely committing tests does not prove they ran; run `npm run test:smoke` in CI or a trusted local checkout before marking all cases verified.
- Vercel deployment has reported READY for the public /learn/syntax route.
- Manually checked /learn/syntax/if and /learn/syntax/functions; the worked examples passed the live browser output check.
- Follow-up must check remaining code examples against actual runtime; build success checks TypeScript/pages but does not run the Node test suite by default.
- Existing Payload CMS lessons, videos and transcripts were not modified by this track; it is static and adds no database migrations.

## Quality gates before advancing to examinations

1. Run full 32-case syntax examples against the JavaScript browser interpreter; fix mismatches.
2. Confirm selected examples in the Netlify native WASM engine and investigate parity differences rather than hiding them.
3. Have a Ghanaian computing teacher evaluate chapter order, clarity and formative tasks.
4. Pilot with learners with no programming background, including children with limited devices or different first languages.
5. Review accessibility on low-end mobile devices and screen readers.
6. Commission qualified Akan educator review of syntax vocabulary and explanations.
7. Expand reference coverage with debugging decision trees, complete syntax tables and longer multi-step original projects.
8. Keep automated grading, account-based progress tracking, high-stakes exams, and downloadable certificates on hold until the learning materials and safeguarding policies are independently reviewed.

## Educational philosophy

A syntax lesson should answer: Why does the symbol exist? Where does it go? What does it do? What does the interpreter do line by line? Which slightly different program fails, and why? How does that transfer to Python, JavaScript or another language?

The user rating must not be artificially increased by counting chapters or code lines. The real measure is whether a novice can read, write, trace and debug an unfamiliar Kasa program without being told the exact answer.
