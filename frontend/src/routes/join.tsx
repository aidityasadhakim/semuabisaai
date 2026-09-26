import { SignIn, useAuth, useUser } from '@clerk/react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { apiFetch } from '@/lib/api'
import { isClerkConfigured } from '@/lib/clerk'

function JoinWithClerk() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const [joined, setJoined] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    let active = true
    getToken()
      .then((token) =>
        apiFetch<{ joined: boolean }>('/api/waitlist', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
      )
      .then((status) => {
        if (active) setJoined(status.joined)
      })
      .catch(() => {
        if (active) setError('Status waiting list belum dapat dimuat.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [getToken, isLoaded, isSignedIn])

  if (!isLoaded) return <p className="join-status">Memuat akun...</p>
  if (!isSignedIn)
    return (
      <div className="clerk-panel">
        <SignIn routing="hash" signUpUrl="/auth/sign-up" forceRedirectUrl="/join" />
      </div>
    )

  async function joinWaitlist() {
    setSaving(true)
    setError('')
    try {
      const token = await getToken()
      await apiFetch('/api/waitlist', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: { onboardingId: sessionStorage.getItem('sba_onboarding_id') || '' },
      })
      sessionStorage.removeItem('sba_onboarding_id')
      setJoined(true)
    } catch {
      setError('Belum berhasil masuk waiting list. Coba lagi sebentar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="join-account">
      {loading ? (
        <p className="join-status">Memeriksa pendaftaran...</p>
      ) : joined ? (
        <>
          <span className="join-check" aria-hidden="true">
            ✓
          </span>
          <h2>Kamu sudah masuk waiting list.</h2>
          <p>
            Alamat: <strong>{user.primaryEmailAddress?.emailAddress}</strong>
          </p>
          <Link className="join-link" to="/ask">
            Tanyakan tentang Semua Bisa AI
          </Link>
        </>
      ) : (
        <>
          <p className="join-account-label">Akun terhubung</p>
          <h2>Satu langkah lagi.</h2>
          <p>
            Masuk waiting list dengan <strong>{user.primaryEmailAddress?.emailAddress}</strong>.
            Setelah itu kamu bisa mengajukan lima pertanyaan.
          </p>
          <button
            className="join-link join-button"
            type="button"
            onClick={joinWaitlist}
            disabled={saving || !user.primaryEmailAddress?.emailAddress}
          >
            {saving ? 'Menyimpan...' : 'Konfirmasi masuk waiting list'}
          </button>
          {!user.primaryEmailAddress?.emailAddress && (
            <p className="join-error">Tambahkan alamat email di akunmu untuk melanjutkan.</p>
          )}
        </>
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
          semua bisa<span>ai.</span>
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
