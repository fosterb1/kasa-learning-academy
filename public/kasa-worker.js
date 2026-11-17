/* Kasa Academy: execute user code locally, isolated from the UI thread. */
'use strict'
try {
  importScripts('/kasa-runtime.js')
  if (!self.KasaRuntime || typeof self.KasaRuntime.executeKasa !== 'function') {
    throw new Error('Kasa runtime could not start')
  }
  self.postMessage({ type: 'READY' })
} catch (error) {
  self.postMessage({ type: 'BOOT_ERROR', message: String(error?.message || error) })
}
self.onmessage = ({ data }) => {
  if (!data || data.type !== 'EXECUTE' || !self.KasaRuntime) return
  const { requestId, source, input, mode } = data
  try {
    const result = self.KasaRuntime.executeKasa(String(source || ''), String(input || ''), mode === 'check' ? 'check' : 'run')
    self.postMessage({ type: 'RESULT', requestId, result })
  } catch (error) {
    self.postMessage({ type: 'ERROR', requestId, message: String(error?.message || error) })
  }
}
