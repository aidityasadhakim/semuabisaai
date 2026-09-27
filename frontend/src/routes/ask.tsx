import { useAuth } from '@clerk/react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { apiFetch } from '@/lib/api'
import { isClerkConfigured } from '@/lib/clerk'

interface Reply {
  question: string
  answer: string
}

function QuestionsWithClerk() {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const [joined, setJoined] = useState(false)
  const [remaining, setRemaining] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [question, setQuestion] = useState('')
  const [replies, setReplies] = useState<Array<Reply>>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    let active = true
    getToken()
      .then((token) =>
        apiFetch<{ joined: boolean; remaining: number }>('/api/waitlist', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
      )
      .then((status) => {
        if (active) {
          setJoined(status.joined)
          setRemaining(status.remaining)
        }
      })
      .catch(() => {
        if (active) setError('Status pertanyaan belum dapat dimuat. Muat ulang halaman ini.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [getToken, isLoaded, isSignedIn])

  async function ask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!question.trim() || sending || remaining === 0) return
    setSending(true)
    setError('')
    try {
      const token = await getToken()
      const result = await apiFetch<{ answer: string; remaining: number }>('/api/questions', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: { question: question.trim() },
      })
      setReplies((current) => [...current, { question: question.trim(), answer: result.answer }])
      setRemaining(result.remaining)
      setQuestion('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Pertanyaan belum berhasil dikirim.')
      try {
        const token = await getToken()
        const status = await apiFetch<{ remaining: number }>('/api/waitlist', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        setRemaining(status.remaining)
      } catch {
        /* Keep the last known count when status cannot be loaded. */
      }
    } finally {
      setSending(false)
    }
  }

  if (!isLoaded) return <p className="join-status">Memuat sesi tanya jawab...</p>
  if (!isSignedIn)
    return (
      <p>
        Masuk waiting list terlebih dahulu untuk bertanya. <Link to="/join">Ke waiting list</Link>
      </p>
    )
  if (loading) return <p className="join-status">Memuat sesi tanya jawab...</p>
  if (!joined)
    return (
      <p>
        Masuk waiting list terlebih dahulu untuk bertanya. <Link to="/join">Ke waiting list</Link>
      </p>
    )

  return (
    <>
      <p className="ask-count">{remaining} dari 5 pertanyaan tersisa</p>
      <div className="conversation-thread" aria-live="polite">
        <p className="chat-bubble chat-guide">Apa yang ingin kamu tahu tentang Semua Bisa AI?</p>
        {replies.map((reply, index) => (
          <div className="chat-exchange" key={index}>
            <p className="chat-bubble chat-answer">{reply.question}</p>
            <p className="chat-bubble chat-guide">{reply.answer}</p>
          </div>
        ))}
      </div>
      {remaining > 0 ? (
        <form className="ask-form" onSubmit={ask}>
          <label className="sr-only" htmlFor="visitor-question">
            Pertanyaanmu
          </label>
          <textarea
            id="visitor-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            minLength={3}
            maxLength={500}
            rows={3}
            placeholder="Tulis pertanyaanmu..."
            required
          />
          <button
            className="join-link"
            type="submit"
            disabled={sending || question.trim().length < 3}
          >
            {sending ? 'Menyiapkan jawaban...' : 'Kirim pertanyaan'}
          </button>
        </form>
      ) : (
        <p className="ask-finished">
          Lima pertanyaanmu sudah digunakan. Terima kasih sudah mengenal Semua Bisa AI.
        </p>
      )}
      {error && (
        <p className="join-error" role="alert">
          {error}
        </p>
      )}
    </>
  )
}

function AskPage() {
  return (
    <div className="onboarding-page">
      <header className="join-header page-width">
        <Link className="wordmark" to="/">
          semuabisaai.id
        </Link>
      </header>
      <main className="conversation page-width">
        <h1>Kenalan dulu, yuk.</h1>
        <section className="about-ai" aria-label="Tentang Semua Bisa AI">
          <p>Semua Bisa AI membantu siapa pun memakai AI dengan percaya diri dalam keseharian.</p>
          <ul>
            <li>Terbuka untuk semua</li>
            <li>Belajar lewat hasil nyata</li>
            <li>Manusia tetap memegang kendali</li>
            <li>Gunakan AI dengan aman dan bijak</li>
          </ul>
        </section>
        {isClerkConfigured() ? <QuestionsWithClerk /> : <p>Tanya jawab belum tersedia.</p>}
      </main>
    </div>
  )
}

export const Route = createFileRoute('/ask')({ component: AskPage })
