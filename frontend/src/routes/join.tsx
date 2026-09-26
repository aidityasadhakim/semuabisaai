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
            Kami akan mengirim kabar ke <strong>{email}</strong> saat informasi kegiatan tersedia.
          </p>
        </>
      ) : (
        <>
          <p className="join-account-label">Akun terhubung</p>
          <h2>Satu langkah lagi.</h2>
          <p>
            Konfirmasi alamat <strong>{email}</strong> untuk masuk waiting list.
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
        <Link className="back-link" to="/">
          ← Kembali ke beranda
        </Link>
      </header>
      <main className="join-main page-width">
        <div className="join-intro">
          <p className="eyebrow">Waiting list</p>
          <h1>Mulai perjalananmu di sini.</h1>
          <p>
            Masuk dengan Google atau email, lalu konfirmasi untuk menerima kabar kegiatan Semua Bisa
            AI.
          </p>
        </div>
        <div className="join-card">
          {isClerkConfigured() ? (
            <JoinWithClerk />
          ) : (
            <div className="join-account">
              <h2>Clerk belum dikonfigurasi.</h2>
              <p>
                Tambahkan <code>VITE_CLERK_PUBLISHABLE_KEY</code> di <code>frontend/.env</code>{' '}
                untuk mengaktifkan pendaftaran.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export const Route = createFileRoute('/join')({ component: JoinPage })
