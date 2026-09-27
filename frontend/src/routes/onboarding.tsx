import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { apiFetch } from '@/lib/api'

type AnswerKey = 'name' | 'status' | 'place' | 'city' | 'profession' | 'familiarity' | 'goal'
type TurnKey = 'profile' | 'city' | 'profession' | 'familiarity' | 'goal'
type Answer = { value: string; label: string }
type Answers = Partial<Record<AnswerKey, Answer>>
type Turn = { key: TurnKey; question: string; answer: string; reply: string; nextQuestion: string }

type TurnResponse = { reply: string; question: string }

const steps: Array<TurnKey> = ['profile', 'city', 'profession', 'familiarity', 'goal']

const statusOptions: Array<Answer> = [
  { value: 'bekerja', label: 'Bekerja' },
  { value: 'mahasiswa', label: 'Mahasiswa' },
  { value: 'pengusaha', label: 'Pengusaha' },
  { value: 'lainnya', label: 'Lainnya' },
]

const activityOptions: Record<string, Array<Answer>> = {
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

const familiarityOptions: Array<Answer> = [
  { value: 'baru', label: 'Belum pernah' },
  { value: 'mencoba', label: 'Pernah mencoba' },
  { value: 'rutin', label: 'Sudah rutin' },
]

const goalOptions: Array<Answer> = [
  { value: 'pekerjaan', label: 'Membantu kegiatan sehari-hari' },
  { value: 'belajar', label: 'Belajar hal baru' },
  { value: 'usaha', label: 'Mengembangkan usaha' },
  { value: 'memahami', label: 'Memahami AI lebih baik' },
]

function placePrompt(status: string) {
  if (status === 'mahasiswa') return 'Kamu kuliah di mana?'
  if (status === 'pengusaha') return 'Apa nama usaha atau bidangmu?'
  if (status === 'lainnya') return 'Kegiatanmu biasanya di mana?'
  return 'Kamu bekerja di mana?'
}

function fallbackTurn(key: TurnKey, answers: Answers, lastAnswer: string): TurnResponse {
  switch (key) {
    case 'profile': {
      const statusLabel = {
        bekerja: 'pekerja',
        mahasiswa: 'mahasiswa',
        pengusaha: 'pengusaha',
        lainnya: 'seseorang yang aktif berkegiatan',
      }[answers.status?.value || 'lainnya']
      return {
        reply: `Senang kenal kamu, ${answers.name?.label}; sebagai ${statusLabel} di ${answers.place?.label}, keseharianmu pasti punya cerita sendiri.`,
        question: `Agar ceritamu lebih dekat, kamu tinggal di kota mana, ${answers.name?.label}?`,
      }
    }
    case 'city': {
      const activityQuestion = {
        mahasiswa: `Di ${answers.place?.label}, bagian kuliah apa yang paling sering kamu kerjakan?`,
        pengusaha: `Dalam usahamu di ${answers.place?.label}, kegiatan apa yang paling sering kamu tangani?`,
        bekerja: `Di ${answers.place?.label}, tugas apa yang paling sering kamu kerjakan?`,
        lainnya: `Di ${answers.place?.label}, kegiatan apa yang paling sering kamu lakukan?`,
      }[answers.status?.value || 'lainnya']
      return {
        reply: `Oke, ${answers.city?.label} jadi tempatmu beraktivitas saat ini.`,
        question: activityQuestion || `Di ${answers.place?.label}, kegiatan apa yang paling sering kamu lakukan?`,
      }
    }
    case 'profession':
      return {
        reply: `Kegiatan ${lastAnswer} di ${answers.place?.label} bisa jadi titik awal mencoba AI.`,
        question: `Untuk kegiatan ${lastAnswer}, sudah pernah memakai AI?`,
      }
    case 'familiarity':
      return {
        reply: `Baik, kamu bilang ${lastAnswer}; kita bisa mulai dari situ.`,
        question: 'Dengan pengalaman itu, kamu ingin memakai AI untuk apa?',
      }
    case 'goal':
      return {
        reply: `Tujuanmu ${lastAnswer}; kita bisa mulai dari langkah kecil yang berguna buatmu.`,
        question: '',
      }
  }
}

function optionsFor(key: TurnKey, answers: Answers): Array<Answer> | null {
  if (key === 'profession') return activityOptions[answers.status?.value || 'lainnya']
  if (key === 'familiarity') return familiarityOptions
  if (key === 'goal') return goalOptions
  return null
}

export function OnboardingPage() {
  const referral = new URLSearchParams(window.location.search).get('ref')?.trim().slice(0, 60) || ''
  const [profile, setProfile] = useState({ name: '', status: '', place: '' })
  const [answers, setAnswers] = useState<Answers>({})
  const [turns, setTurns] = useState<Array<Turn>>([])
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState('')

  const key = steps[step]
  const latestTurn: Turn | undefined =
    step === 0 ? undefined : turns[completed ? turns.length - 1 : step - 1]
  const currentQuestion =
    latestTurn?.nextQuestion || fallbackTurn(steps[step - 1] || 'profile', answers, '').question
  const options = optionsFor(key, answers)
  const greeting =
    referral.toLowerCase() === 'aidityasadhakim'
      ? 'Halo! Kamu datang lewat Aidityas Adhakim, ya?'
      : referral
        ? `Halo! Kamu datang lewat ${referral}, ya?`
        : 'Halo! Yuk kenalan.'

  async function sendTurn(
    turnKey: TurnKey,
    nextAnswers: Answers,
    lastAnswer: string,
    question: string,
  ) {
    const fallback = fallbackTurn(turnKey, nextAnswers, lastAnswer)
    let response = fallback
    try {
      response = await apiFetch<TurnResponse>('/api/onboarding/turn', {
        method: 'POST',
        body: {
          lastStep: turnKey,
          lastAnswer,
          name: nextAnswers.name?.value,
          status: nextAnswers.status?.value,
          place: nextAnswers.place?.value,
          city: nextAnswers.city?.value || '',
          activity: nextAnswers.profession?.label || '',
          familiarity: nextAnswers.familiarity?.label || '',
          goal: nextAnswers.goal?.label || '',
        },
      })
    } catch {
      // A failed model request should not prevent someone from finishing onboarding.
    }
    setTurns((current) => [
      ...current.slice(0, step),
      {
        key: turnKey,
        question,
        answer: lastAnswer,
        reply: response.reply,
        nextQuestion: response.question,
      },
    ])
    return response
  }

  async function submitProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const name = profile.name.trim()
    const place = profile.place.trim()
    if (name.length < 2 || place.length < 2 || !profile.status) return
    const nextAnswers: Answers = {
      name: { value: name, label: name },
      status: statusOptions.find((option) => option.value === profile.status),
      place: { value: place, label: place },
    }
    setAnswers(nextAnswers)
    setError('')
    setBusy(true)
    await sendTurn(
      'profile',
      nextAnswers,
      `${name} · ${nextAnswers.status?.label} · ${place}`,
      'Tentang kamu',
    )
    setStep(1)
    setBusy(false)
  }

  async function advance(answer: Answer) {
    if (busy || step === 0) return
    setError('')
    const answerKey = key === 'city' ? 'city' : key
    const nextAnswers = { ...answers, [answerKey]: answer }
    const laterKeys: Array<AnswerKey> = ['city', 'profession', 'familiarity', 'goal']
    for (const laterKey of laterKeys.slice(step)) delete nextAnswers[laterKey]
    setAnswers(nextAnswers)
    setDraft('')
    setBusy(true)

    if (key === 'goal') {
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
      } catch {
        setError('Jawabanmu belum tersimpan. Coba pilih lagi.')
        setBusy(false)
        return
      }
    }

    await sendTurn(key, nextAnswers, answer.label, currentQuestion)
    if (key === 'goal') setCompleted(true)
    else setStep(step + 1)
    setBusy(false)
  }

  function submitText(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = draft.trim()
    if (value.length < 2 || value.length > 80) return
    void advance({ value, label: value })
  }

  function goBack() {
    if (busy || step === 0) return
    const previous = step - 1
    const nextAnswers = { ...answers }
    if (previous === 0) {
      delete nextAnswers.name
      delete nextAnswers.status
      delete nextAnswers.place
    }
    const laterKeys: Array<AnswerKey> = ['city', 'profession', 'familiarity', 'goal']
    for (const laterKey of laterKeys.slice(Math.max(0, previous - 1))) delete nextAnswers[laterKey]
    setAnswers(nextAnswers)
    setTurns(turns.slice(0, previous))
    setDraft(previous === 1 ? answers.city?.label || '' : '')
    setStep(previous)
    setError('')
  }

  const previousTurns = turns.slice(0, completed ? -1 : Math.max(0, step - 1))

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

        {previousTurns.length > 0 && (
          <details className="onboarding-history">
            <summary>Percakapan sebelumnya ({previousTurns.length})</summary>
            <div>
              {previousTurns.map((turn) => (
                <div className="onboarding-history-turn" key={turn.key}>
                  <span>{turn.question}</span>
                  <strong>{turn.answer}</strong>
                  <span>{turn.reply}</span>
                </div>
              ))}
            </div>
          </details>
        )}

        {step === 0 ? (
          <section className="onboarding-turn">
            <p className="onboarding-greeting">{greeting}</p>
            <h1>Kenalan dulu, yuk.</h1>
            <form
              className="onboarding-profile-form"
              onSubmit={(event) => void submitProfile(event)}
            >
              <label htmlFor="visitor-name">Siapa namamu?</label>
              <input
                id="visitor-name"
                autoComplete="given-name"
                value={profile.name}
                onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                maxLength={60}
                placeholder="Nama panggilanmu"
                required
              />
              <fieldset>
                <legend>Saat ini kamu sedang apa?</legend>
                <div className="onboarding-status-options">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={profile.status === option.value}
                      onClick={() => setProfile({ ...profile, status: option.value, place: '' })}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label htmlFor="visitor-place">{placePrompt(profile.status)}</label>
              <input
                id="visitor-place"
                value={profile.place}
                onChange={(event) => setProfile({ ...profile, place: event.target.value })}
                maxLength={100}
                placeholder="Nama tempat atau bidangmu"
                required
              />
              <button
                className="join-link"
                type="submit"
                disabled={
                  busy ||
                  profile.name.trim().length < 2 ||
                  !profile.status ||
                  profile.place.trim().length < 2
                }
              >
                {busy ? 'Menyiapkan percakapan...' : 'Lanjut'}
              </button>
            </form>
          </section>
        ) : (
          <section className="onboarding-turn" aria-live="polite">
            {latestTurn?.answer && <p className="onboarding-answer-bubble">{latestTurn.answer}</p>}
            {latestTurn?.reply && <p className="onboarding-greeting">{latestTurn.reply}</p>}
            {completed ? (
              <div className="onboarding-complete">
                <h1>Yuk lanjut, {answers.name?.label}.</h1>
                <Link className="join-link" to="/join">
                  Gabung waiting list
                </Link>
              </div>
            ) : busy ? (
              <p className="onboarding-thinking" role="status">
                Menyiapkan balasan untukmu...
              </p>
            ) : (
              <>
                <h1 key={key}>{currentQuestion}</h1>
                {options ? (
                  <div className="onboarding-options" role="group" aria-label={currentQuestion}>
                    {options.map((option, index) => (
                      <button key={option.value} type="button" onClick={() => void advance(option)}>
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
                      {currentQuestion}
                    </label>
                    <input
                      id="onboarding-answer"
                      autoComplete="address-level2"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      maxLength={80}
                      placeholder="Contoh: Bandung"
                      required
                    />
                    <button className="join-link" type="submit" disabled={draft.trim().length < 2}>
                      Lanjut
                    </button>
                  </form>
                )}
                <button className="onboarding-back" type="button" onClick={goBack}>
                  Kembali
                </button>
              </>
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
