import Link from 'next/link'

export const metadata = {
 title: 'Kasa modules and imports — experimental Twi syntax',
 description: 'Learn provisional fa ... firi ... Kasa imports and test pinned math and collections libraries in the full Studio.',
}
const example = `fa math firi stdlib: m
fa collections firi stdlib: c
ma nneɛma = [10, 20, 30]
ka m.kasa_sum(nneɛma)
ka c.kasa_contains(nneɛma, 20)`

export default function ModuleLesson() {
 return <main className="content-width syntax-detail">
  <div className="lesson-back"><Link href="/learn/syntax">← Kasa syntax course</Link><span>EXPERIMENTAL MODULES · OPTIONAL EXTENSION</span></div>
  <header className="page-heading">
   <span className="eyebrow">KASA LANGUAGE 0.4 · EXPERIMENTAL, NOT NATIVE</span>
   <h1>Reuse code with <code>fa</code> and <code>firi</code></h1>
   <p>Modules let one Kasa program reuse functions kept in another named library. This is a provisional Twi-first design, currently supported only by the opt-in JavaScript Studio and experimental Python runner, not the native C++/KBC1 compiler or ordinary embedded lesson editors.</p>
  </header>
  <section className="syntax-route-info">
   <h2>Understand the import phrase</h2>
   <table className="syntax-token-table"><thead><tr><th scope="col">Part</th><th scope="col">Meaning here</th></tr></thead><tbody>
    <tr><th scope="row"><code>fa</code></th><td>Introduce an experimental module import. It is contextual, not a globally approved Kasa keyword.</td></tr>
    <tr><th scope="row"><code>math</code></th><td>The catalog module to reuse; <code>collections</code> is another pinned module.</td></tr>
    <tr><th scope="row"><code>firi stdlib</code></th><td>Read it from Kasa&apos;s locally pinned standard-library catalog. Arbitrary files, URLs and packages are not supported.</td></tr>
    <tr><th scope="row"><code>: m</code></th><td>Optional short alias. Without it, the alias defaults to the module name, as in <code>math.kasa_sum(...)</code>.</td></tr>
    <tr><th scope="row"><code>m.kasa_sum(...)</code></th><td>Call a function explicitly exported by the module. The dot does not permit unrestricted object access.</td></tr>
   </tbody></table>
   <p>For brevity, <code>fa math</code> and <code>fa math: m</code> work in the same experimental mode. The older <code>@math:m</code> notation is a temporary compatibility form, not our preferred way to teach Kasa.</p>
  </section>
  <section className="syntax-read">
   <h2>Work through a Ghanaian market basket</h2>
   <p>Predict what the program prints. Three prices total 60, and the basket contains 20. Both functions come from separately imported Kasa libraries.</p>
   <pre><code>{example}</code></pre>
   <h3>Expected output</h3>
   <pre><code>{'60\nnokware\n'}</code></pre>
   <ol className="syntax-trace">
    <li><code>fa math firi stdlib: m</code> makes exported math functions accessible through <code>m</code>.</li>
    <li><code>fa collections firi stdlib: c</code> introduces collection helpers under <code>c</code>.</li>
    <li><code>m.kasa_sum(nneɛma)</code> adds the three values.</li>
    <li><code>c.kasa_contains(nneɛma, 20)</code> returns Kasa&apos;s true value, <code>nokware</code>.</li>
   </ol>
  </section>
  <section className="syntax-route-info">
   <h2>Run this in the full Kasa Studio</h2>
   <p><strong>Use the full Studio, not the editor inside an ordinary lesson.</strong> Open Studio, select <strong>Market baskets · experimental modules</strong>, check that <strong>Experimental modules (JavaScript only)</strong> is enabled, and press Run. The module feature bypasses native WASM intentionally.</p>
   <p><Link href="/playground" className="button button-primary">Open Kasa Studio →</Link></p>
   <p>Try changing 20 to 25 and predict the Boolean result. Remove the alias to use <code>math.kasa_sum</code> instead. A function not listed among the module&apos;s exports is unavailable.</p>
  </section>
  <section className="syntax-practice">
   <h2>Limits, safety and language review</h2>
   <p>Only the two pinned catalog modules (<code>math</code> and <code>collections</code>) can currently be imported. The syntax does not fetch remote code and does not run in native or KBC1. Module sources are pinned by SHA-256 and bundled with Studio; a hash is an integrity check, not a signature or a security sandbox.</p>
   <p>We chose the provisional wording <code>fa ... firi ...</code> as a development direction. Fluent Asante/Akuapem reviewers and computing educators have not yet approved the full phrase as an idiomatic programming instruction. Other vocabulary decisions remain open.</p>
   <p><Link href="/language-status">See the supported-feature matrix →</Link> · <Link href="/learn/syntax">Return to core grammar →</Link></p>
  </section>
 </main>
}
