'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/store'
import { Landing } from '@/components/landing'
import { AppShell } from '@/components/app-shell'
import { Spinner } from '@/components/glass'

export function MainApp() {
  const { ready } = useApp()
  const [showLanding, setShowLanding] = useState(true)
  const [landingShown, setLandingShown] = useState(false)

  // Determine if landing was already shown in this session
  useEffect(() => {
    const shown = sessionStorage.getItem('sa_landing_shown')
    if (shown === 'true') {
      setShowLanding(false)
      setLandingShown(true)
    }
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  const handleEnterApp = () => {
    setShowLanding(false)
    sessionStorage.setItem('sa_landing_shown', 'true')
  }

  return (
    <>
      {showLanding ? (
        <Landing onEnter={handleEnterApp} />
      ) : (
        <AppShell />
      )}
    </>
  )
}
