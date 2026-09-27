import { SignIn, useAuth, useUser } from '@clerk/react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { apiFetch } from '@/lib/api'
import { isClerkConfigured } from '@/lib/clerk'

function JoinWithClerk() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user.primaryEmailAddress?.emailAddress) return
    let active = true
    const onboardingId = sessionStorage.getItem('sba_onboarding_id') || ''
    async function joinWaitlist() {
      try {
        const token = await getToken()
        await apiFetch('/api/waitlist', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: { onboardingId },
        })
        if (!active) return
        sessionStorage.removeItem('sba_onboarding_id')
        await navigate({ to: '/ask', replace: true })
      } catch {
        if (active) setError('Belum berhasil masuk waiting list. Coba lagi.')
      }
    }
    void joinWaitlist()
    return () => {
      active = false
    }
  }, [attempt, getToken, isLoaded, isSignedIn, navigate, user?.primaryEmailAddress?.emailAddress])

  if (!isLoaded) return <p className="join-status">Memuat akun...</p>
  if (!isSignedIn)
    return (
      <div className="clerk-panel">
        <SignIn routing="hash" signUpUrl="/auth/sign-up" forceRedirectUrl="/join" />
      </div>
    )

  return (
    <div className="join-account">
      {!user.primaryEmailAddress?.emailAddress ? (
        <>
          <h2>Tambahkan email.</h2>
          <p>Alamat email diperlukan untuk masuk waiting list.</p>
        </>
      ) : error ? (
        <button
          className="join-link"
          type="button"
          onClick={() => {
            setError('')
            setAttempt(attempt + 1)
          }}
        >
          Coba lagi
        </button>
      ) : (
        <p className="join-status">Menyiapkan ruang tanya jawab...</p>
      )}
      {error && (
        <p className="join-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function JoinPage() {
  return (
    <div className="join-page">
      <header className="join-header page-width">
        <Link className="wordmark" to="/">
          semuabisaai.id
        </Link>
      </header>
      <main className="join-main page-width">
        <div className="join-intro">
          <p className="eyebrow">Waiting list</p>
          <h1>Bergabung.</h1>
          <p>Masuk dengan Google atau email untuk menerima kabar kegiatan berikutnya.</p>
        </div>
        <div className="join-card">
          {isClerkConfigured() ? (
            <JoinWithClerk />
          ) : (
            <div className="join-account">
              <h2>Pendaftaran belum aktif.</h2>
              <p>Konfigurasi akun belum tersedia.</p>
            </div>
          )}
        </div>
        <Link className="back-link" to="/">
          Kembali ke beranda
        </Link>
      </main>
    </div>
  )
}

export const Route = createFileRoute('/join')({ component: JoinPage })
