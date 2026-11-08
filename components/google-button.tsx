'use client'

import { useEffect, useRef } from 'react'

// ID client OAuth "Application Web" (Google Cloud Console). Sans lui, le
// bouton n'est tout simplement pas affiché : le formulaire e-mail reste
// utilisable.
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

interface GoogleIdApi {
  initialize: (config: {
    client_id: string
    callback: (response: { credential: string }) => void
  }) => void
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: 'outline' | 'filled_blue' | 'filled_black'
      size?: 'large' | 'medium' | 'small'
      shape?: 'rectangular' | 'pill'
      text?: 'signin_with' | 'signup_with' | 'continue_with'
      locale?: string
      width?: number
    },
  ) => void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdApi } }
  }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client'

export function GoogleButton({
  onCredential,
  text = 'continue_with',
  disabled = false,
}: {
  onCredential: (credential: string) => void
  text?: 'signin_with' | 'signup_with' | 'continue_with'
  disabled?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Toujours la dernière version du callback, sans ré-initialiser Google
  // à chaque rendu.
  const callbackRef = useRef(onCredential)
  useEffect(() => {
    callbackRef.current = onCredential
  }, [onCredential])

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    let cancelled = false

    function render() {
      const api = window.google?.accounts.id
      const el = containerRef.current
      if (cancelled || !api || !el) return
      api.initialize({
        client_id: GOOGLE_CLIENT_ID as string,
        callback: (response) => callbackRef.current(response.credential),
      })
      el.innerHTML = ''
      api.renderButton(el, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text,
        locale: 'fr',
        // Google impose une largeur entre 200 et 400 px
        width: Math.min(400, Math.max(200, el.offsetWidth || 320)),
      })
    }

    if (window.google?.accounts.id) {
      render()
      return () => { cancelled = true }
    }

    let script = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`)
    if (!script) {
      script = document.createElement('script')
      script.src = GSI_SRC
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
    script.addEventListener('load', render)
    return () => {
      cancelled = true
      script?.removeEventListener('load', render)
    }
  }, [text])

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div
      className="transition-opacity"
      style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
    >
      <div ref={containerRef} className="flex justify-center" />
    </div>
  )
}
