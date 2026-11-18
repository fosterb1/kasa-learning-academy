import Link from 'next/link'

const vocabulary = [
  ['ka','Print a value','ka "Akwaaba!"'],
  ['ma','Assign a value','ma age = 18'],
  ['sɛ','Start an if decision','sɛ age >= 18 a'],
  ['a','Conditional header marker','sɛ age >= 18 a'],
  ['anyɛ_saa_a','Otherwise branch','anyɛ_saa_a'],
  ['awiei','End a block','awiei'],
  ['mpɛn','Repeat a fixed number of times','mpɛn 3'],
  ['bere_a','Repeat while a condition holds','bere_a age < 20'],
  ['dwumadie','Define a function','dwumadie add(a, b)'],
  ['sanma','Return from a function','sanma a + b'],
  ['nokware','Boolean true','ma ready = nokware'],
  ['atoro','Boolean false','ma ready = atoro'],
  ['hwee','No value','ma result = hwee'],
  ['ne','Logical AND','nokware ne atoro'],
  ['anaa','Logical OR','nokware anaa atoro'],
  ['ɛnyɛ','Logical NOT','ɛnyɛ nokware'],
  ['gyae','Exit a loop','gyae'],
  ['toa_so','Continue a loop','toa_so'],
  ['bisa()','Read program input','bisa()'],
  ['tentɛn()','Get length','tentɛn([1, 2])'],
  ['nɔma()','Convert numeric text to a number','nɔma("12")'],
  ['nsɛm()','Convert a value into text','nsɛm(12)'],
] as const

export const metadata = {title: 'Kasa keyword glossary — English explanations'}
export default function Glossary() {
  return <main className="content-width">
    <div className="page-heading">
      <span className="eyebrow">LANGUAGE BRIDGE · KASA + ENGLISH</span>
      <h1>Kasa programming vocabulary</h1>
      <p>Understand the current Kasa syntax using clear English computing definitions. These are technical meanings in Kasa, not certified everyday Twi translations. Fluent Akan educators still need to review spelling, dialect variants and terminology.</p>
    </div>
    <div className="glossary-table" role="region" aria-label="Kasa syntax glossary" tabIndex={0}>
      <table><thead><tr><th scope="col">Kasa keyword</th><th scope="col">Programming meaning</th><th scope="col">Example</th></tr></thead><tbody>
        {vocabulary.map(([keyword,meaning,example])=><tr key={keyword}><th scope="row"><code>{keyword}</code></th><td>{meaning}</td><td><code>{example}</code></td></tr>)}
      </tbody></table>
    </div>
    <div className="project-rubric"><h2>Learn both concepts and language</h2>
      <p>We use a bilingual learning approach: understand the computer-science idea in simple English, recognize Kasa's Akan-inspired syntax, and use a working program to prove your understanding. Local-language explanations and future audio recordings should be reviewed with Ghanaian teachers and native speakers before publication.</p>
      <p>See the <a href="https://github.com/fosterb1/kasa_programming_language/blob/main/docs/TWI_KEYWORD_AUDIT.md" target="_blank" rel="noopener noreferrer">source-linked Kasa terminology audit</a> for evidence and words that still require linguistic review.</p>
      <p><Link href="/learn">Start a lesson →</Link> · <Link href="/projects">Build a Ghanaian coding project →</Link></p>
    </div>
  </main>
}
