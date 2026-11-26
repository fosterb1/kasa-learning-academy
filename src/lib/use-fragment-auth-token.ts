'use client'

import { useEffect, useState } from 'react'

/**
 * Read a one-time credential from the URL fragment, not the query string.
 * URL fragments are not transmitted to the HTTP server or normal access logs.
 * Clear immediately after the client has read it; never log or persist it.
 * Legacy ?token= links are intentionally unsupported: they leak to request logs.
 */
export function useFragmentAuthToken(): string {
  const [token, setToken] = useState('')
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1))
    const candidate = params.get('token') || ''
    // Remove the fragment even when the token is malformed.
    if (window.location.hash) {
      window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search)
    }
    if (candidate && candidate.length <= 512 && !/\s/.test(candidate)) setToken(candidate)
  }, [])
  return token
}
