import Link from 'next/link'

export const metadata = {title: 'Teaching Kasa to first-time young learners — facilitator guide'}
const sources = [
  ['Ghana NaCCA primary computing curriculum', 'https://nacca.gov.gh/wp-content/uploads/2019/04/COMPUTING-B4-B6.pdf'],
  ['NaCCA Common Core Programme', 'https://nacca.gov.gh/common-core-programme-ccp/'],
  ['Raspberry Pi Foundation computing pedagogy', 'https://www.raspberrypi.org/teach/pedagogy'],
  ['Code.org Computer Science Fundamentals', 'https://code.org/en-US/curriculum/computer-science-fundamentals'],
  ['CS Unplugged activities', 'https://www.csunplugged.org/en/about/'],
  ['UNESCO multilingual education', 'https://www.unesco.org/en/articles/languages-matter-global-guidance-multilingual-education'],
  ['UNICEF Ghana differentiated foundational learning', 'https://www.unicef.org/documents/improving-foundational-learning-scale-evidence-ghanas-differentiated-learning-plus'],
  ['CAST Universal Design for Learning', 'https://udlguidelines.cast.org/'],
  ['W3C accessibility guidance', 'https://www.w3.org/TR/wcag/'],
] as const
export default function FacilitatorGuide() {
  return <main className="content-width beginner-chapter">
    <div className="lesson-back"><Link href="/start">← Start from zero</Link><span>TEACHER AND CLUB LEADER NOTES</span></div>
    <header className="page-heading"><span className="eyebrow">EDUCATOR COMPANION</span><h1>Teach Kasa by helping children think.</h1><p>A free, practical guide for Ghanaian computing teachers, caregivers and youth-club facilitators. This is an independent Academy resource, not an approved NaCCA textbook.</p></header>
    <div className="beginner-intro">
      <div><strong>Upper-primary learners</strong><p>Use drawings, paper instructions, very short code and pair discussion. Start with input/output and sequences. Support reading and typing rather than demanding memorization.</p></div>
      <div><strong>Junior-high learners and older beginners</strong><p>Increase the complexity of worked programs, introduce explicit comparisons and variables, and invite learners to explain errors, not just fix them.</p></div>
    </div>
    <article className="beginner-reading">
      <section className="beginner-topic"><h2>1. Teach an idea before teaching syntax</h2><p>Begin with a familiar question: how could we work out the total price of three books? Draw the inputs and the calculation. After learners can explain the steps, introduce Kasa symbols. A pupil who understands the problem can transfer that reasoning to Python or another language later.</p></section>
      <section className="beginner-topic"><h2>2. Use PRIMM in every coding session</h2><ol><li><strong>Predict:</strong> ask learners what the code will display.</li><li><strong>Run:</strong> execute the working model without changing it.</li><li><strong>Investigate:</strong> describe what each statement does and trace the values.</li><li><strong>Modify:</strong> change one value or rule and predict again.</li><li><strong>Make:</strong> construct a related but new solution.</li></ol><p>Invite children to explain mistakes in words. Resist typing the answer for them.</p></section>
      <section className="beginner-topic"><h2>3. A sample 40-minute learning session: variables</h2><ol><li><strong>0–5 min:</strong> ask children where they store a nickname or a classroom count. Show a labeled paper box.</li><li><strong>5–12 min:</strong> draw balance = 10. Update the number to 15 and describe the change.</li><li><strong>12–20 min:</strong> read the code in the <Link href="/start/memory-boxes">Variables are labeled boxes</Link> chapter and predict the output.</li><li><strong>20–26 min:</strong> run the code in pairs and compare with the prediction.</li><li><strong>26–34 min:</strong> modify the starting balance and contribution and repeat.</li><li><strong>34–40 min:</strong> ask each learner to explain what ma does and solve a similar count problem on paper.</li></ol></section>
      <section className="beginner-topic"><h2>4. Low-device or no-internet teaching</h2><p>When devices are limited, one learner can be the 'computer' following another learner's written instructions. Use chalkboard flowcharts, bottle-top counters, paper lists and written code traces. The Academy pages themselves require an internet connection unless independently prepared for offline access; the paper activities do not.</p></section>
      <section className="beginner-topic"><h2>5. Languages and belonging</h2><p>Invite learners to discuss the problem using a familiar Ghanaian language when appropriate, but keep programming definitions precise. Twi-inspired Kasa keywords are not a substitute for formally reviewed translations. Ghana has many languages, so do not assume every pupil speaks Twi. Avoid making learners feel less capable because of accent, dialect or English proficiency.</p></section>
      <section className="beginner-topic"><h2>6. Safety and accessibility</h2><p>Use fictional names and figures. Avoid asking pupils to enter real passwords, addresses, phone numbers or sensitive marks. Do not require accounts or collect child data for demonstrations. Make room for learners who need larger text, more reading time, a partner, different input devices or a quiet place to concentrate. Obtain safeguarding and parental consent before any research involving children.</p></section>
      <section className="beginner-topic"><h2>7. Check for understanding without high-stakes grading</h2><p>Ask learners to explain a line in plain language, predict its output, identify a mistake and make one intentional code change. Look for an explanation of why the program works. These are formative observations—not certified examinations, formal mastery scores or automated student records.</p></section>
    </article>
    <section className="beginner-review"><h2>Sources informing this guide</h2><p>The Academy adapts broad teaching principles from these sources. It does not reproduce their curriculum materials verbatim or claim institutional endorsement.</p><ul>{sources.map(([name,url])=><li key={url}><a href={url} target="_blank" rel="noopener noreferrer">{name}</a></li>)}</ul><p>Internal methodological notes: <a href="https://github.com/fosterb1/kasa-learning-academy/blob/main/docs/FOUNDATIONAL_LEARNING_RESEARCH_AUDIT.md" target="_blank" rel="noopener noreferrer">Kasa curriculum research audit</a>.</p></section>
  </main>
}
