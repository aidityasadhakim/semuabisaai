import { SignIn, useUser } from '@clerk/react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { isClerkConfigured } from '@/lib/clerk'

function JoinWithClerk() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [hasJoined, setHasJoined] = useState(false)

  if (!isLoaded) return <p className="join-status">Memuat akun...</p>

  if (!isSignedIn) {
    return (
      <div className="clerk-panel">
        <SignIn routing="hash" signUpUrl="/auth/sign-up" forceRedirectUrl="/join" />
      </div>
    )
  }

  const joinedAt = user.unsafeMetadata.waitlistJoinedAt
  const joined = hasJoined || typeof joinedAt === 'string'
  const email = user.primaryEmailAddress?.emailAddress

  async function joinWaitlist() {
    if (!user || !email || joined) return
    setIsSaving(true)
    setError('')
    try {
      await user.updateMetadata({ unsafeMetadata: { waitlistJoinedAt: new Date().toISOString() } })
      setHasJoined(true)
    } catch {
      setError('Belum berhasil menyimpan. Coba lagi sebentar.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="join-account">
      {joined ? (
        <>
          <span className="join-check" aria-hidden="true">
            ✓
          </span>
          <h2>Anda sudah masuk daftar.</h2>
          <p>
            Alamat: <strong>{email}</strong>
          </p>
        </>
      ) : (
        <>
          <p className="join-account-label">Akun terhubung</p>
          <h2>Satu langkah lagi.</h2>
          <p>
            Masuk waiting list dengan <strong>{email}</strong>.
          </p>
          <button
            className="join-link join-button"
            type="button"
            onClick={joinWaitlist}
            disabled={isSaving || !email}
          >
            {isSaving ? 'Menyimpan...' : 'Konfirmasi masuk daftar'}
            <span aria-hidden="true">↗</span>
          </button>
          {!email && (
            <p className="join-error">
              Akun ini belum memiliki alamat email. Tambahkan email di akun Clerk Anda untuk
              melanjutkan.
            </p>
          )}
          {error && (
            <p className="join-error" role="alert">
              {error}
            </p>
          )}
        </>
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
          <p>Masuk dengan Google atau email.</p>
        </div>
        <div className="join-card">
          {isClerkConfigured() ? (
            <JoinWithClerk />
          ) : (
            <div className="join-account">
              <h2>Pendaftaran belum aktif.</h2>
              <p>
                Tambahkan key Clerk di <code>.env</code> pada root proyek.
              </p>
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
