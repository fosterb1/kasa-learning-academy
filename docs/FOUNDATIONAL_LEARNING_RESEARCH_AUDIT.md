# Research-backed Ghana-first Kasa Academy curriculum audit
**Date:** 2026-11-19
**Baseline:** Project owner rates learning depth 15/100; this is stakeholder feedback, not an independent standardized score.
**Scope:** Educational materials before extending grading, examinations, student accounts, instructor review or downloadable credentials.

## Sources reviewed and implications

1. **Ghana NaCCA Computing Primary B4–B6 (2019).** https://nacca.gov.gh/wp-content/uploads/2019/04/COMPUTING-B4-B6.pdf
   - The standards include introduction to computing, programming and databases, internet and social media, and health and safety.
   - B5 includes discussing programming languages and their uses and problem solving; plan early activities around actual computing concepts rather than starting with language syntax.
   - **Caution:** mapping exercises to a national curriculum does not make the Academy an approved Ghanaian textbook. Editorial alignment must be checked by qualified Ghanaian teachers and reviewed against later curricula.
2. **NaCCA Common Core Programme and Computing B7–B9.** https://nacca.gov.gh/common-core-programme-ccp/ and https://nacca.gov.gh/wp-content/uploads/2023/06/COMPUTING.pdf
   - Build a bridge from simple algorithms, digital literacy and data to computational thinking and text-based programming in higher stages.
3. **Raspberry Pi Foundation — computing pedagogy.** https://www.raspberrypi.org/teach/pedagogy
   - Use PRIMM: Predict, Run, Investigate, Modify, Make. Read and reason about code before independently writing programs. Model processes, discuss errors, and use worked examples.
4. **Code.org CS Fundamentals.** https://code.org/en-US/curriculum/computer-science-fundamentals
   - Progressive sequencing, loops, conditionals, unplugged activities, and familiar projects. Kasa should offer a gentler on-ramp for children with no prior coding experience.
5. **CS Unplugged.** https://www.csunplugged.org/en/about/
   - Games, diagrams and paper activities can teach computational thinking without a computer or reliable internet. Our activities are original; never copy worksheets without checking permissions.
6. **MIT Scratch — Coding for All.** https://scratch.mit.edu/codingforall/
   - Projects connected to learners' interests help broaden participation. Text-based Kasa should not pretend to provide Scratch's block or sprite interface.
7. **Official Python tutorial.** https://docs.python.org/3/tutorial/
   - The official tutorial explicitly assumes some existing programming knowledge. Use it for long-run conceptual breadth and language reference, **not** as the primary teaching template for an absolute beginner child.
8. **MDN Learn / JavaScript.** https://developer.mozilla.org/en-US/docs/Learn_web_development
   - Structured outcomes, concept explanations, frequent skill tests, worked challenges and references. Do not copy MDN proprietary or licensed passages into Kasa lessons.
9. **Education Endowment Foundation — worked examples.** https://educationendowmentfoundation.org.uk/news/supporting-pupils-with-worked-examples
   - Present a correct complete model before withdrawing scaffolding; ask learners to explain a step, then modify and finally solve a similar task.
10. **Learning science review (2018):** https://pmc.ncbi.nlm.nih.gov/articles/PMC5780548/
   - Retrieval practice, concrete examples, spaced review and elaboration are useful curricular design principles, but individual strategies are not guaranteed to improve every classroom.
11. **UNESCO multilingual education guidance.** https://www.unesco.org/en/articles/languages-matter-global-guidance-multilingual-education
   - Use learners' strongest familiar language to support comprehension. Ghana is multilingual: Twi vocabulary should be an optional bridge and accurate English definitions must remain available. Other Ghanaian languages need qualified educators.
12. **UNICEF Ghana differentiated learning.** https://www.unicef.org/documents/improving-foundational-learning-scale-evidence-ghanas-differentiated-learning-plus
   - Use structured lesson guides, differentiated foundational instruction, and approachable play activities, rather than assuming all learners share prior knowledge.
13. **CAST UDL 3.0.** https://udlguidelines.cast.org/
   - Offer varied ways to understand and express learning: plain-language reading, oral discussion, drawing, code and teacher-supported practice.
14. **W3C WCAG 2.2.** https://www.w3.org/TR/wcag/
   - Keyboard-accessible controls, visible focus, scalable text, good contrast, and text alternatives for any future imagery and audio.
15. **UNESCO digital privacy in learning.** https://iite.unesco.org/publications/personal-data-and-privacy-protection-in-online-learning/
   - Do not require young learners to submit real names, phone numbers, school marks or passwords to practice; use invented records.

## Findings from the existing Kasa Academy code review

- The Academy previously opened directly into Kasa syntax and lessons such as variables, conditions and sorting. This was too steep for a student who does not yet know input/output or algorithms.
- The 24 existing lesson companions provided objectives, a short concept summary and code samples, but they generally did not include age-appropriate unplugged tasks or an explicit conceptual bridge.
- The single-example code-output check is **not** an assessment of general correctness. We will postpone designing multi-case automated grading until the content itself passes educator review.
- Most language content is English with Akan-inspired syntax, not fully bilingual reviewed instructional translation. Keep all technical meanings explicit and seek Ghanaian native-speaker and educator review before claiming Twi translations are accurate.
- A learner might have a shared phone or limited data: foundational notes must stand alone without embedded videos and avoid requiring account registration or uploads.
- Existing video URLs, transcripts, CMS versions and lessons must not be overwritten.

## New priority sequence (do not confuse with completed work)

### Priority A: pre-coding foundations — implemented as a ten-chapter free reading pathway
What is a computer; sequencing and algorithms; patterns/decomposition; first Kasa output; variables; data types; decisions; repetition; debugging; a simple safe project.

Each chapter has: contextual story, two measurable objectives, four explained concepts, unplugged activity, prediction and trace task, runnable Kasa example, modification challenge, independent build, misconception, and three self-review questions with answer explanations.

### Priority B: expand existing language lessons — further work
For each of 24 topics, publish at least: explanation of relevance; prerequisite reminder; several runnable examples; line-by-line execution trace; common errors; boundary cases; guided and independent tasks; glossary; spaced review. Where a feature is unsupported by Kasa's current runtime, document it as future learning rather than teaching invalid syntax.

### Priority C: teaching-quality review before large-scale assessment systems
- Recruit Ghanaian Basic 4–9 and SHS computing teachers from different regions and language backgrounds.
- Run supervised reading/usability tests with consent and appropriate child safeguarding.
- Test at least one entry-level Android phone and a slow connection; verify that reading and practice remain usable without video.
- Include learners with disabilities; assess keyboard, magnification, contrast and screen-reader support.
- Validate every runnable code snippet with the current interpreter, expected output, intentional errors and edge cases.
- Document reviewers' findings and revise lessons before certificates, grading, or tracking are promoted as educationally reliable.

## Pilot evaluation rubric (proposed, not yet independently scored)
- Foundational clarity and sequencing: 25 points
- Conceptual depth and original worked examples: 20 points
- Practice and feedback quality: 20 points
- Ghanaian relevance and inclusive language: 15 points
- Mobile accessibility / low-data learning: 10 points
- Technical accuracy and verification: 10 points

A high rubric score requires external learner testing and educator review, not simply more pages or lines of text. Do not claim that the user's baseline 15/100 automatically improves to a particular number after this commit.

## Governance and content rights
Adapt ideas and methodologies from sources, not their verbatim learning materials. Track links and dates; obtain permission before reusing protected textbook diagrams, video transcripts or worksheets. Do not claim curriculum accreditation or official linguistic certification. When adding Twi translations, retain English technical labels and record native-speaker verification and dialect context. When working with children, do not solicit or store their personal information without a specific reviewed safeguarding process.
