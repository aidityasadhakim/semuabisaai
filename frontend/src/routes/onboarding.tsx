import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { apiFetch } from '@/lib/api'

type AnswerKey = 'profession' | 'familiarity' | 'goal' | 'city'
type Answer = { value: string; label: string }
type Answers = Partial<Record<AnswerKey, Answer>>

const questions: Array<{ key: AnswerKey; text: string; options: Array<Answer> }> = [
  {
    key: 'profession',
    text: 'Apa kegiatan utamamu?',
    options: [
      { value: 'guru', label: 'Mengajar' },
      { value: 'akuntan', label: 'Keuangan' },
      { value: 'programmer', label: 'Membuat software' },
      { value: 'pns', label: 'Pelayanan publik' },
      { value: 'wirausaha', label: 'Menjalankan usaha' },
      { value: 'swasta', label: 'Bekerja di perusahaan' },
      { value: 'lainnya', label: 'Lainnya' },
    ],
  },
  {
    key: 'familiarity',
    text: 'Sudah pernah pakai AI?',
    options: [
      { value: 'baru', label: 'Belum pernah' },
      { value: 'mencoba', label: 'Pernah mencoba' },
      { value: 'rutin', label: 'Sudah rutin' },
    ],
  },
  {
    key: 'goal',
    text: 'Ingin pakai AI untuk apa?',
    options: [
      { value: 'pekerjaan', label: 'Membantu pekerjaan' },
      { value: 'belajar', label: 'Belajar hal baru' },
      { value: 'usaha', label: 'Mengembangkan usaha' },
      { value: 'memahami', label: 'Memahami AI' },
    ],
  },
  {
    key: 'city',
    text: 'Kamu tinggal dekat kota mana?',
    options: [
      { value: 'jakarta', label: 'Jakarta' },
      { value: 'bandung', label: 'Bandung' },
      { value: 'surabaya', label: 'Surabaya' },
      { value: 'yogyakarta', label: 'Yogyakarta' },
      { value: 'medan', label: 'Medan' },
      { value: 'makassar', label: 'Makassar' },
      { value: 'lainnya', label: 'Kota lainnya' },
    ],
  },
]

const firstSteps: Record<string, string> = {
  guru: 'Coba minta AI menjelaskan satu topik dengan cara yang berbeda untuk muridmu.',
  akuntan: 'Coba minta AI merangkum dokumen yang tidak rahasia, lalu cek sumbernya.',
  programmer: 'Coba minta AI meninjau satu fungsi kecil, lalu uji sarannya.',
  pns: 'Coba minta AI menyusun draf informasi layanan dari sumber yang terbuka.',
  wirausaha: 'Coba minta AI membantu menjawab pertanyaan pelanggan yang sering muncul.',
  swasta: 'Coba pilih satu tugas berulang dan minta AI membantu menyusun langkahnya.',
  lainnya: 'Coba pilih satu tugas kecil dan minta AI memberi beberapa cara mengerjakannya.',
}

export function OnboardingPage() {
  const referral = new URLSearchParams(window.location.search).get('ref')?.trim().slice(0, 60) || ''
  const [answers, setAnswers] = useState<Answers>({})
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState('')

  const currentQuestion = questions[step]
  const selected = answers[currentQuestion.key]
  const greeting =
    referral.toLowerCase() === 'aidityasadhakim'
      ? 'Halo! Kamu datang lewat Aidityas Adhakim, ya?'
      : referral
        ? `Halo! Kamu datang lewat ${referral}, ya?`
        : 'Halo! Yuk mulai.'

  async function continueOnboarding() {
    if (!selected || saving) return
    setError('')
    if (step < questions.length - 1) {
      setStep(step + 1)
      return
    }

    setSaving(true)
    try {
      const result = await apiFetch<{ id: string }>('/api/onboarding', {
        method: 'POST',
        body: {
          referral,
          profession: answers.profession?.value,
          familiarity: answers.familiarity?.value,
          goal: answers.goal?.value,
          city: answers.city?.value,
        },
      })
      sessionStorage.setItem('sba_onboarding_id', result.id)
      setCompleted(true)
    } catch {
      setError('Belum tersimpan. Coba lagi.')
    } finally {
      setSaving(false)
    }
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
          <span>{completed ? 'Selesai' : `${step + 1} / ${questions.length}`}</span>
        </div>
        <div className="onboarding-progress-line" aria-hidden="true">
          <span
            style={{
              width: `${((completed ? questions.length : step + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <p className="onboarding-greeting">{greeting}</p>

        {completed ? (
          <div className="onboarding-complete">
            <h1>Coba ini dulu.</h1>
            <p className="onboarding-tip">{firstSteps[answers.profession?.value || 'lainnya']}</p>
            <Link className="join-link" to="/join">
              Gabung waiting list
            </Link>
          </div>
        ) : (
          <>
            {step > 0 && (
              <details className="onboarding-history">
                <summary>Jawaban sebelumnya ({step})</summary>
                <div>
                  {questions.slice(0, step).map((question) => (
                    <p key={question.key}>
                      <span>{question.text}</span>
                      <strong>{answers[question.key]?.label}</strong>
                    </p>
                  ))}
                </div>
              </details>
            )}
            <h1 key={currentQuestion.key}>{currentQuestion.text}</h1>
            <p className="onboarding-hint">Pilih satu yang paling cocok.</p>
            <div className="onboarding-options" role="group" aria-label={currentQuestion.text}>
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={selected?.value === option.value ? 'is-selected' : ''}
                  aria-pressed={selected?.value === option.value}
                  onClick={() => setAnswers({ ...answers, [currentQuestion.key]: option })}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="onboarding-actions">
              {step > 0 && (
                <button className="onboarding-back" type="button" onClick={() => setStep(step - 1)}>
                  Kembali
                </button>
              )}
              <button
                className="join-link"
                type="button"
                onClick={continueOnboarding}
                disabled={!selected || saving}
              >
                {saving ? 'Menyimpan...' : step === questions.length - 1 ? 'Lihat hasil' : 'Lanjut'}
              </button>
            </div>
            {error && (
              <p className="join-error" role="alert">
                {error}
              </p>
            )}
          </>
        )}
        {!completed && (
          <p className="onboarding-privacy">
            Pilihanmu membantu kami merancang kegiatan yang sesuai.
          </p>
        )}
      </main>
    </div>
  )
}

export const Route = createFileRoute('/onboarding')({ component: OnboardingPage })
