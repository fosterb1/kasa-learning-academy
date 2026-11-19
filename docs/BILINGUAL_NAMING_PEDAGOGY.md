# Kasa teaching: Twi-style identifiers without forced Twi
Date: 2026-11-19

## Purpose
A learner should hear familiar Ghanaian words in Kasa examples without falsely believing that variable names are reserved language keywords or that a learner must speak Twi.

## What changed
- The existing `/learn/[slug]` lessons display a **Twi + English names** option, with **Original lesson names** selectable wherever name substitutions are available.
- The same naming view appears on relevant first-time beginner chapters and all five free Ghanaian coding projects.
- The editor explains that `ma`, `ka`, `sɛ` and other syntax words are *Kasa keywords*, while `sika`, `din`, `mfe`, `score`, and `total` are user-selected names.
- Side-by-side examples show `ma sika = 4` and `ma money = 4`; both should print `4`.
- An explicitly curated per-lesson mapping names the substitutions for relevant chapters, with a notice that Akan vocabulary needs educator review.
- The original CMS source and video/transcript fields are not modified. Changing the view only changes the current example shown in the client editor. Switching views resets the editor to that example, so learners should copy their working draft first if they want to keep changes.

## How it works
`src/lib/kasa-identifiers.ts` contains a bounded identifier scanner with Unicode-aware name boundaries. It replaces **whole identifier tokens only** outside quoted strings and comments; it does not replace arbitrary substrings. The replacements are selected by lesson identifier and only apply to the educational code view, not to arbitrary learner-defined variables.

Why no simple global text replacement? That would change output labels such as `"score"`, comments, unrelated identifiers such as `score2`, and potentially reserved keywords. A language-aware transformation is safer.

## Testing and limitations
`tests/bilingual-identifiers.test.mjs` covers whole-name preservation, Unicode identifiers, all 24 bundled lesson outputs, starter programs in the foundation pathway, and the client-UI routes. Test code is committed; production Vercel builds are **not** a substitute for running `npm run test:smoke`. The live Variables example was manually executed in Twi-blended and original views; both produced the same output. The Market day receipt starter was inspected in both naming styles.

The mapping is instructional, not an authoritative Twi dictionary. Phrases, word choices, inflections and orthography remain under review and must be checked by native speakers and Ghanaian educators before promotion as verified educational translation. In particular, mixed compound names are intentionally code identifiers, not claims about standard spoken Twi.

## Safeguards
- Preserve CMS lessons and author edits; no database changes, migrations or automatic rewrites.
- Let learners use English, Twi-inspired, or other valid Unicode names, consistent with language rules.
- Teach Kasa as an independent programming language; the names are choices, not Python variable rules.
- Check the expected output on the current interpreter and against selected native/WASM builds before claiming complete runtime equivalence.
