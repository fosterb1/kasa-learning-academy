import Link from 'next/link'

export const metadata = {
 title:'Download and install Kasa — platform release status',
 description:'Track Windows, macOS and Linux native Kasa installer readiness and find verified source setup guides.',
}
const platforms = [
 {name:'Windows', architecture:'x64', status:'Developer preview only', details:'Portable ZIP tested locally and an unsigned Inno Setup first-install prototype compiled. Clean-machine dependency, disposable VM install/uninstall, recovery, upgrade and signing checks remain open.'},
 {name:'macOS', architecture:'Intel x86_64', status:'Developer preview only', details:'Unsigned .pkg built, installed and upgraded on one Intel Mac running Ventura. Clean-machine validation, safe uninstall, signing and notarization are outstanding.'},
 {name:'macOS', architecture:'Apple Silicon arm64', status:'Not verified', details:'A supported native installer has not yet passed actual Apple Silicon testing.'},
 {name:'Linux', architecture:'Native source build', status:'Build from source', details:'Native C++20 build instructions exist. A tested distributable installer/package and stable platform compatibility matrix are not yet published.'},
] as const
export default function DownloadsPage() {
 return <main className="content-width">
  <header className="page-heading">
   <span className="eyebrow">KASA 0.4 ALPHA · DESKTOP RELEASE STATUS</span>
   <h1>Install Kasa on your computer</h1>
   <p>Use Kasa Studio in your browser today. Desktop installation previews exist, but no Windows, macOS or Linux installer has yet been approved as a signed, trusted public download.</p>
   <p><Link href="/playground" className="button button-primary">Start coding in your browser →</Link></p>
  </header>
  <section className="syntax-route-info"><h2>Platform readiness</h2>
   <p>These descriptions refer to developer-test artifacts, not general availability. We will add verified versioned downloads only after installation, clean-machine, security and distribution checks pass.</p>
   <div className="practice-grid">
    {platforms.map(platform=><article key={platform.name+'-'+platform.architecture} className="practice-card">
     <span className="eyebrow">{platform.architecture}</span><h2>{platform.name}</h2>
     <p><strong>Current status: {platform.status}</strong></p>
     <p>{platform.details}</p>
    </article>)}
   </div>
  </section>
  <section className="syntax-route-info">
   <h2>For developers who want to build Kasa locally</h2>
   <p>You can use the maintained Python reference runner or compile the native C++20 implementation from the source repository. The Academy has platform-neutral setup guides, but their instructions must be followed with the actual prerequisites and your own device in mind.</p>
   <p><Link href="/guides">Read setup guides →</Link> · <a href="https://github.com/fosterb1/kasa_programming_language" target="_blank" rel="noopener noreferrer">View Kasa source on GitHub</a></p>
  </section>
  <section className="syntax-route-info">
   <h2>How official downloads will work</h2>
   <p>Each approved release will include a platform and architecture label, exact Kasa version, supported engine features, release notes, SHA-256 checksums and documented upgrade/uninstall instructions. Installation files will be hosted as verified release assets rather than in the Academy CMS database.</p>
   <p>SHA-256 detects file changes but does not prove who published a binary. Signed Windows and macOS distributions remain separate release requirements. We will not ask learners to disable device security protections to install Kasa.</p>
   <p><Link href="/language-status">Compare browser and desktop support →</Link></p>
  </section>
 </main>
}
