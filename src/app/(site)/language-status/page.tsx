import Link from 'next/link'

export const metadata = {title: 'Kasa language feature status and platform compatibility'}

const features = [
 ['Variables, arithmetic, conditions, loops and functions','Supported','Supported','Supported (0.4 subset)','Use the syntax course'],
 ['Lists, indexing, mutation and built-ins','Supported','Supported','Supported (0.4 subset)','Some numeric and resource limits differ by engine'],
 ['Structured diagnostics and Unicode identifiers','Supported','Supported','Targeted support','Output and error details can vary between engines'],
 ['fa ... firi stdlib imports','Experimental: opt-in','Experimental Python runner','Not supported','Only math and collections; use JavaScript mode in full Studio'],
 ['Module aliases and exported function calls','Experimental: opt-in','Experimental Python runner','Not supported','No user-created imports yet'],
 ['KBC1 disk bytecode','Not supported','Not a browser feature','Experimental native CLI','Alpha format; untrusted bytecode is not sandboxed'],
 ['KBC2 and extended native integers','Not supported','Reference may differ','Opt-in experimental native build','Not default and not a stable file format'],
 ['Custom file imports and package registry','Not supported','Not supported','Not supported','Future design; no remote imports'],
 ['Classes, async and public export keyword','Not supported','Not supported','Not supported','Unsettled vocabulary and semantics'],
] as const

export default function LanguageStatus() {
 return <main className="content-width">
  <header className="page-heading">
   <span className="eyebrow">KASA 0.4 · FEATURE COMPATIBILITY</span>
   <h1>What Kasa can do today</h1>
   <p>Kasa has multiple runtimes, and not every experiment works on every platform. This reference describes implemented capabilities and important boundaries, not a guarantee of stable 1.0 compatibility.</p>
  </header>
  <section className="syntax-route-info">
   <h2>Which editor am I using?</h2>
   <p><strong>Embedded lesson editors</strong> use a basic JavaScript worker and are intended for the core syntax course. <strong>Full Kasa Studio</strong> hosts the native WebAssembly engine, a JavaScript fallback, and an explicit experimental module switch. Desktop installs run an independently built native compiler/VM; those installers are still development previews.</p>
   <p><Link href="/playground">Open full Studio →</Link> · <Link href="/learn/modules">Learn experimental imports →</Link> · <Link href="/guides">Installation guides →</Link></p>
  </section>
  <div className="glossary-table" role="region" aria-label="Kasa features by execution engine" tabIndex={0}>
   <table>
    <thead><tr><th scope="col">Feature</th><th scope="col">Full browser Studio</th><th scope="col">Python reference</th><th scope="col">Native / bytecode</th><th scope="col">Caveats</th></tr></thead>
    <tbody>{features.map(([feature,studio,python,native,notes])=><tr key={feature}><th scope="row">{feature}</th><td>{studio}</td><td>{python}</td><td>{native}</td><td>{notes}</td></tr>)}</tbody>
   </table>
  </div>
  <section className="syntax-route-info">
   <h2>Release and review boundaries</h2>
   <p>Some Kasa core behavior is verified through shared test suites, but full cross-platform parity, arbitrary untrusted-code safety, desktop installer signing, and all proposed Twi terminology remain open. The standard library is not yet a production finance or currency library.</p>
   <p>Local installation builds are not automatically updated when the Academy deploys. Native features must be rebuilt and verified separately.</p>
   <p><Link href="/learn/syntax">Study core grammar →</Link> · <a href="https://github.com/fosterb1/kasa_programming_language/blob/main/docs/LANGUAGE_COMPATIBILITY_POLICY.md" target="_blank" rel="noopener noreferrer">Read the compatibility policy</a></p>
  </section>
 </main>
}
