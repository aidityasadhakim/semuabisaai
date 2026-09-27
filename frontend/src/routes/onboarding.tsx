import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { apiFetch } from '@/lib/api'

type AnswerKey = 'name' | 'status' | 'place' | 'city' | 'profession' | 'familiarity' | 'goal'
type Answer = { value: string; label: string }
type Answers = Partial<Record<AnswerKey, Answer>>
type Option = Answer

const steps: Array<AnswerKey> = [
  'name',
  'status',
  'place',
  'city',
  'profession',
  'familiarity',
  'goal',
]

const statusOptions: Array<Option> = [
  { value: 'bekerja', label: 'Bekerja' },
  { value: 'mahasiswa', label: 'Mahasiswa' },
  { value: 'pengusaha', label: 'Pengusaha' },
  { value: 'lainnya', label: 'Lainnya' },
]

const activityOptions: Record<string, Array<Option>> = {
  bekerja: [
    { value: 'guru', label: 'Mengajar' },
    { value: 'programmer', label: 'Membuat software' },
    { value: 'akuntan', label: 'Mengurus keuangan' },
    { value: 'pns', label: 'Melayani masyarakat' },
    { value: 'operasional', label: 'Operasional' },
    { value: 'lainnya', label: 'Lainnya' },
  ],
  mahasiswa: [
    { value: 'belajar', label: 'Belajar dan mengerjakan tugas' },
    { value: 'riset', label: 'Riset' },
    { value: 'programmer', label: 'Membuat software' },
    { value: 'kreatif', label: 'Karya kreatif' },
    { value: 'lainnya', label: 'Lainnya' },
  ],
  pengusaha: [
    { value: 'wirausaha', label: 'Menjual produk atau jasa' },
    { value: 'operasional', label: 'Mengelola operasional' },
    { value: 'akuntan', label: 'Mengurus keuangan' },
    { value: 'kreatif', label: 'Membuat konten' },
    { value: 'lainnya', label: 'Lainnya' },
  ],
  lainnya: [
    { value: 'belajar', label: 'Belajar' },
    { value: 'guru', label: 'Mengajar' },
    { value: 'kreatif', label: 'Berkarya' },
    { value: 'operasional', label: 'Mengurus kegiatan harian' },
    { value: 'lainnya', label: 'Lainnya' },
  ],
}

const familiarityOptions: Array<Option> = [
  { value: 'baru', label: 'Belum pernah' },
  { value: 'mencoba', label: 'Pernah mencoba' },
  { value: 'rutin', label: 'Sudah rutin' },
]

const goalOptions: Array<Option> = [
  { value: 'pekerjaan', label: 'Membantu kegiatan sehari-hari' },
  { value: 'belajar', label: 'Belajar hal baru' },
  { value: 'usaha', label: 'Mengembangkan usaha' },
  { value: 'memahami', label: 'Memahami AI lebih baik' },
]

function promptFor(key: AnswerKey, answers: Answers) {
  const name = answers.name?.label || 'kamu'
  const place = answers.place?.label || 'tempatmu'
  switch (key) {
    case 'name':
      return 'Siapa namamu?'
    case 'status':
      return `Senang kenal kamu, ${name}. Saat ini kamu sedang apa?`
    case 'place':
      if (answers.status?.value === 'mahasiswa') return 'Kamu kuliah di mana?'
      if (answers.status?.value === 'pengusaha') return 'Apa nama usaha atau bidangmu?'
      if (answers.status?.value === 'lainnya') return 'Kegiatanmu biasanya di mana?'
      return 'Kamu bekerja di mana?'
    case 'city':
      return 'Kamu tinggal di kota mana?'
    case 'profession':
      return `Di ${place}, apa yang paling sering kamu lakukan?`
    case 'familiarity':
      return 'Sudah pernah memakai AI?'
    case 'goal':
      return 'Ingin memakai AI untuk apa?'
  }
}

function optionsFor(key: AnswerKey, answers: Answers): Array<Option> | null {
  if (key === 'status') return statusOptions
  if (key === 'profession') return activityOptions[answers.status?.value || 'lainnya']
  if (key === 'familiarity') return familiarityOptions
  if (key === 'goal') return goalOptions
  return null
}

function fallbackReply(answers: Answers) {
  const status = {
    bekerja: 'pekerja',
    mahasiswa: 'mahasiswa',
    pengusaha: 'pengusaha',
    lainnya: 'seseorang yang aktif berkegiatan',
  }[answers.status?.value || 'lainnya']
  return `Senang kenal kamu, ${answers.name?.label}; sebagai ${status} di ${answers.place?.label}, ${answers.city?.label}, kamu bisa mulai mencoba AI dari kegiatan sehari-hari.`
}

export function OnboardingPage() {
  const referral = new URLSearchParams(window.location.search).get('ref')?.trim().slice(0, 60) || ''
  const [answers, setAnswers] = useState<Answers>({})
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState('')
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState('')

  const key = steps[step]
  const prompt = promptFor(key, answers)
  const options = optionsFor(key, answers)
  const greeting =
    referral.toLowerCase() === 'aidityasadhakim'
      ? 'Halo! Kamu datang lewat Aidityas Adhakim, ya?'
      : referral
        ? `Halo! Kamu datang lewat ${referral}, ya?`
        : 'Halo! Yuk kenalan.'

  async function advance(answer: Answer) {
    if (busy) return
    setError('')
    const nextAnswers = { ...answers, [key]: answer }
    for (const laterKey of steps.slice(step + 1)) delete nextAnswers[laterKey]
    setAnswers(nextAnswers)
    setDraft('')

    if (key === 'city') {
      setBusy(true)
      try {
        const result = await apiFetch<{ reply: string }>('/api/onboarding/intro', {
          method: 'POST',
          body: {
            name: nextAnswers.name?.value,
            status: nextAnswers.status?.value,
            place: nextAnswers.place?.value,
            city: nextAnswers.city?.value,
          },
        })
        setReply(result.reply)
      } catch {
        setReply(fallbackReply(nextAnswers))
      } finally {
        setBusy(false)
        setStep(step + 1)
      }
      return
    }

    if (key === 'goal') {
      setBusy(true)
      try {
        const result = await apiFetch<{ id: string }>('/api/onboarding', {
          method: 'POST',
          body: {
            referral,
            name: nextAnswers.name?.value,
            status: nextAnswers.status?.value,
            place: nextAnswers.place?.value,
            city: nextAnswers.city?.value,
            profession: nextAnswers.profession?.value,
            familiarity: nextAnswers.familiarity?.value,
            goal: nextAnswers.goal?.value,
          },
        })
        sessionStorage.setItem('sba_onboarding_id', result.id)
        setCompleted(true)
      } catch {
        setError('Jawabanmu belum tersimpan. Coba pilih lagi.')
      } finally {
        setBusy(false)
      }
      return
    }

    setStep(step + 1)
  }

  function submitText(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = draft.trim()
    const limit = key === 'name' ? 60 : key === 'place' ? 100 : 80
    if (value.length < 2 || value.length > limit) return
    void advance({ value, label: value })
  }

  function goBack() {
    if (busy || step === 0) return
    const previous = step - 1
    setStep(previous)
    setDraft(answers[steps[previous]]?.label || '')
    setError('')
    if (previous <= 3) setReply('')
  }

  return (
    <div className="onboarding-page">
      <header className="join-header page-width">
        <Link className="wordmark" to="/">
          semuabisaai.id
        </Link>
      </header>
      <main className="onboarding-flow page-width">
        <div className="onboarding-progress">
          <span>Kenalan singkat</span>
          <span>{completed ? 'Selesai' : `${step + 1} / ${steps.length}`}</span>
        </div>
        <div className="onboarding-progress-line" aria-hidden="true">
          <span
            style={{ width: `${((completed ? steps.length : step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {step === 0 && <p className="onboarding-greeting">{greeting}</p>}

        {step > 0 && (
          <details className="onboarding-history">
            <summary>Jawaban sebelumnya ({completed ? steps.length : step})</summary>
            <div>
              {steps.slice(0, completed ? steps.length : step).map((previousKey) => (
                <p key={previousKey}>
                  <span>{promptFor(previousKey, answers)}</span>
                  <strong>{answers[previousKey]?.label}</strong>
                </p>
              ))}
            </div>
          </details>
        )}

        {completed ? (
          <section className="onboarding-turn onboarding-complete" aria-live="polite">
            <h1>Terima kasih, {answers.name?.label}.</h1>
            <p>Yuk lanjut kenalan dengan Semua Bisa AI.</p>
            <Link className="join-link" to="/join">
              Gabung waiting list
            </Link>
          </section>
        ) : (
          <section className="onboarding-turn" aria-live="polite">
            {step === 4 && reply && <p className="onboarding-greeting">{reply}</p>}
            {busy && (key === 'city' || key === 'goal') ? (
              <p className="onboarding-thinking" role="status">
                {key === 'city' ? 'Menyusun sapaan untukmu...' : 'Menyimpan jawabanmu...'}
              </p>
            ) : (
              <>
                <h1 key={key}>{prompt}</h1>
                {options ? (
                  <div className="onboarding-options" role="group" aria-label={prompt}>
                    {options.map((option, index) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => void advance(option)}
                        disabled={busy}
                      >
                        <span>{option.label}</span>
                        <span className="onboarding-option-key" aria-hidden="true">
                          {index + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <form className="onboarding-text-form" onSubmit={submitText}>
                    <label className="sr-only" htmlFor="onboarding-answer">
                      {prompt}
                    </label>
                    <input
                      id="onboarding-answer"
                      autoComplete={
                        key === 'name' ? 'given-name' : key === 'city' ? 'address-level2' : 'off'
                      }
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      maxLength={key === 'name' ? 60 : key === 'place' ? 100 : 80}
                      placeholder={
                        key === 'name'
                          ? 'Nama panggilanmu'
                          : key === 'city'
                            ? 'Contoh: Bandung'
                            : 'Tulis jawabanmu'
                      }
                      required
                    />
                    <button
                      className="join-link"
                      type="submit"
                      disabled={busy || draft.trim().length < 2}
                    >
                      Lanjut
                    </button>
                  </form>
                )}
              </>
            )}
            {step > 0 && (
              <button className="onboarding-back" type="button" onClick={goBack} disabled={busy}>
                Kembali
              </button>
            )}
            {error && (
              <p className="join-error" role="alert">
                {error}
              </p>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export const Route = createFileRoute('/onboarding')({ component: OnboardingPage })
