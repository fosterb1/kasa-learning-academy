'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

type RunResult = { ok: boolean; output: string; error: string }
type Props = { sourceCode: string; starterInput?: string; expectedOutput?: string }

export function Playground({ sourceCode, starterInput = '', expectedOutput = '' }: Props) {
  const [code, setCode] = useState(sourceCode)
  const [input, setInput] = useState(starterInput)
  const [output, setOutput] = useState('Run the example to see its output.')
  const [status, setStatus] = useState<'loading'|'ready'|'running'|'error'>('loading')
  const [showExpected, setShowExpected] = useState(false)
  const [assessment, setAssessment] = useState<'pass'|'fail'|null>(null)
  const [debugTip, setDebugTip] = useState('')
  const modeRef = useRef<'run'|'check'>('run')
  const workerRef = useRef<Worker | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingRef = useRef(0)

  const boot = useCallback(() => {
    workerRef.current?.terminate()
    if (timerRef.current) clearTimeout(timerRef.current)
    setStatus('loading')
    setAssessment(null)
    setDebugTip('')
    const worker = new Worker('/kasa-worker.js')
    workerRef.current = worker
    worker.onmessage = ({ data }: MessageEvent) => {
      if (data?.type === 'READY') { setStatus('ready'); return }
      if (data?.type === 'BOOT_ERROR') { setStatus('error'); setOutput(data.message); return }
      if (data?.requestId !== pendingRef.current) return
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
      if (data?.type === 'RESULT') {
        const result = data.result as RunResult
        setOutput([result.output?.trimEnd(), result.error].filter(Boolean).join('\n') || (modeRef.current === 'check' ? 'Syntax OK.' : 'Program finished without output.'))
        setStatus('ready')
        if (modeRef.current === 'run' && expectedOutput) {
          const normalize = (s: string) => s.replace(/\r\n/g, '\n').trimEnd()
          setAssessment(result.ok && normalize(result.output || '') === normalize(expectedOutput) ? 'pass' : 'fail')
        }
        if (!result.ok) {
          const error = result.error || ''
          setDebugTip(/undefined|not defined|unknown variable/i.test(error)
            ? 'Check that you declared the variable with ma and spelled its name consistently.'
            : /division|zero/i.test(error)
              ? 'Check whether a denominator can be zero before dividing.'
              : /syntax|unexpected|expected/i.test(error)
                ? 'Check punctuation, the sɛ ... a header, and matching awiei block endings.'
                : 'Read the reported line carefully, then change one statement and rerun.')
        }
      }
      if (data?.type === 'ERROR') { setOutput(String(data.message)); setStatus('error') }
    }
    worker.onerror = () => { setOutput('Kasa interpreter failed to start. Reload the page.'); setStatus('error') }
  }, [])

  useEffect(() => { boot(); return () => { workerRef.current?.terminate(); if (timerRef.current) clearTimeout(timerRef.current) } }, [boot])
  useEffect(() => { setCode(sourceCode); setInput(starterInput); setShowExpected(false); setAssessment(null); setDebugTip('') }, [sourceCode, starterInput])

  const execute = (mode: 'run'|'check') => {
    if (!workerRef.current || status !== 'ready') return
    modeRef.current = mode
    const requestId = ++pendingRef.current
    setStatus('running')
    setOutput(mode === 'run' ? 'Running Kasa…' : 'Checking syntax…')
    setAssessment(null)
    setDebugTip('')
    workerRef.current.postMessage({ type:'EXECUTE', source: code, input, mode, requestId })
    timerRef.current = setTimeout(() => {
      workerRef.current?.terminate(); workerRef.current = null
      setStatus('error'); setOutput('Program stopped after 5 seconds. Try a smaller loop, then select Restart engine.')
    }, 5000)
  }

  return <section className="code-playground" aria-label="Interactive Kasa code playground">
    <div className="playground-top"><div><span className="eyebrow">TRY IT YOURSELF</span><h2>Run Kasa right here</h2></div><span className="runtime-status" data-state={status}>{status === 'loading' ? 'Starting engine' : status === 'running' ? 'Running' : status === 'error' ? 'Check output' : '● Ready offline'}</span></div>
    <div className="playground-codebar"><span><span className="file-circle"/> main.kasa</span><span>TWI-FIRST CODE</span></div>
    <label htmlFor="kasa-source" className="sr-only">Kasa source code</label><textarea id="kasa-source" className="code-editor" spellCheck={false} value={code} onChange={e=>setCode(e.target.value)} aria-label="Kasa source code" autoComplete="off" autoCapitalize="off" />
    <div className="playground-toolbar"><span>Tip: predict the output, then run. Fix errors and retry without restarting.</span><div><button type="button" className="button button-muted" disabled={status !== 'ready'} onClick={()=>execute('check')}>Check syntax</button><button type="button" className="button button-primary" disabled={status !== 'ready'} onClick={()=>execute('run')}>▶ Run code</button><button type="button" className="small-link" onClick={()=>{setCode(sourceCode);setInput(starterInput);setAssessment(null);setDebugTip('')}}>Reset example</button><button type="button" className="small-link" onClick={boot}>Restart engine</button></div></div>
    <div className="playground-result"><div className="output-head">OUTPUT <button type="button" className="small-link" onClick={()=>setOutput('')}>Clear</button></div><pre aria-live="polite">{output}</pre></div>
    {debugTip && <p role="status" className="playground-guidance"><strong>Debugging suggestion:</strong> {debugTip}</p>}
    {assessment && <div role="status" className={'playground-assessment ' + assessment}>
      <strong>{assessment === 'pass' ? 'Output check passed!' : 'Output does not match the example yet.'}</strong>
      <p>{assessment === 'pass' ? 'Your program produced the expected output for this one sample. Try changing the input and checking edge cases.' : 'Compare each printed line with the expected output. This is a sample-output check, not a complete automated grade.'}</p>
    </div>}
    <div className="playground-bottom"><label htmlFor="program-input">PROGRAM INPUT <small>One line per `bisa()` response</small></label><textarea id="program-input" value={input} onChange={e=>setInput(e.target.value)} rows={2} placeholder="Optional input for bisa()" />{expectedOutput&&<><button type="button" className="small-link expected-toggle" onClick={()=>setShowExpected(v=>!v)}>{showExpected ? 'Hide expected output' : 'Show expected output'}</button>{showExpected&&<pre className="expected-output">{expectedOutput}</pre>}</>}</div>
  </section>
}
