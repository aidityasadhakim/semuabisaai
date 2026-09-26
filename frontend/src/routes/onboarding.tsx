import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { apiFetch } from '@/lib/api'

type AnswerKey = 'profession' | 'familiarity' | 'goal' | 'city'
type Answer = { value: string; label: string }
type Answers = Partial<Record<AnswerKey, Answer>>

const questions: Array<{ key: AnswerKey; text: string; options: Array<Answer> }> = [
  {
    key: 'profession',
    text: 'Saat ini, kegiatan utamamu apa?',
    options: [
      { value: 'guru', label: 'Mengajar' },
      { value: 'akuntan', label: 'Akuntansi atau keuangan' },
      { value: 'programmer', label: 'Membuat perangkat lunak' },
      { value: 'pns', label: 'Pelayanan publik' },
      { value: 'wirausaha', label: 'Menjalankan usaha' },
      { value: 'swasta', label: 'Bekerja di perusahaan' },
      { value: 'lainnya', label: 'Lainnya' },
    ],
  },
  {
    key: 'familiarity',
    text: 'Sejauh mana kamu sudah menggunakan AI?',
    options: [
      { value: 'baru', label: 'Belum pernah atau baru ingin mencoba' },
      { value: 'mencoba', label: 'Pernah mencoba beberapa kali' },
      { value: 'rutin', label: 'Sudah cukup rutin' },
    ],
  },
  {
    key: 'goal',
    text: 'Apa yang paling ingin kamu capai dengan AI?',
    options: [
      { value: 'pekerjaan', label: 'Membantu pekerjaan sehari-hari' },
      { value: 'belajar', label: 'Belajar hal baru' },
      { value: 'usaha', label: 'Mengembangkan usaha atau ide' },
      { value: 'memahami', label: 'Memahami peluang dan risikonya' },
    ],
  },
  {
    key: 'city',
    text: 'Kota mana yang paling dekat denganmu?',
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
  guru: 'Coba minta AI membuat tiga cara menjelaskan satu topik kepada murid dengan tingkat pemahaman berbeda. Periksa kembali ketepatan materinya.',
  akuntan:
    'Coba gunakan AI untuk merangkum aturan atau laporan yang tidak rahasia, lalu cocokkan setiap poin penting dengan sumber aslinya.',
  programmer:
    'Coba minta AI meninjau satu fungsi kecil dan menjelaskan asumsi serta kemungkinan kesalahannya. Tetap jalankan pengujian sendiri.',
  pns: 'Coba gunakan AI untuk menyusun draf penjelasan layanan publik dari informasi yang sudah terbuka. Periksa aturan resmi sebelum membagikannya.',
  wirausaha:
    'Coba gunakan AI untuk memetakan tiga pertanyaan pelanggan yang paling sering muncul, lalu tulis jawaban dengan suara usahamu sendiri.',
  swasta:
    'Coba pilih satu tugas berulang yang tidak memuat data sensitif dan minta AI membantu menyusun langkah kerjanya.',
  lainnya:
    'Coba pilih satu tugas kecil dalam kegiatanmu, lalu minta AI memberi beberapa pendekatan. Periksa hasilnya sebelum digunakan.',
}

const goalFocus: Record<string, string> = {
  pekerjaan: 'Fokuskan percobaanmu pada satu alur kerja yang sering kamu ulang.',
  belajar: 'Catat apa yang kamu pahami dan bagian yang masih perlu diperiksa dari sumber lain.',
  usaha: 'Mulailah dari kebutuhan pelanggan yang paling sering kamu dengar.',
  memahami: 'Bandingkan contoh hasil AI yang berguna dan yang keliru agar kamu mengenali batasnya.',
}

function feedbackFor(answers: Answers) {
  const familiarity = answers.familiarity?.value
  const opening =
    familiarity === 'baru'
      ? 'Kamu tidak perlu menjadi ahli untuk mulai. Mulailah dari satu tugas yang kamu kenal.'
      : familiarity === 'rutin'
        ? 'Kamu sudah punya kebiasaan memakai AI. Langkah berikutnya adalah membuat alur kerja yang lebih sadar dan terukur.'
        : 'Kamu sudah mencoba AI. Sekarang saatnya mengubah percobaan itu menjadi kebiasaan yang benar-benar membantu.'
  return `${opening} ${firstSteps[answers.profession?.value || 'lainnya']} ${goalFocus[answers.goal?.value || 'memahami']} Ingat: jangan masukkan data pribadi atau rahasia tanpa izin, dan selalu periksa hasil AI.`
}

export function OnboardingPage() {
  const referral = new URLSearchParams(window.location.search).get('ref')?.trim().slice(0, 60) || ''
  const [answers, setAnswers] = useState<Answers>({})
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (step === 0 && !completed) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    endRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'end' })
  }, [step, completed])
  const fromAidityas = referral.toLowerCase() === 'aidityasadhakim'
  const greeting = fromAidityas
    ? 'Halo, sepertinya kamu datang melalui Aidityas Adhakim. Selamat datang di Semua Bisa AI.'
    : referral
      ? `Halo, sepertinya kamu datang melalui ${referral}. Selamat datang di Semua Bisa AI.`
      : 'Halo, selamat datang di Semua Bisa AI.'

  async function choose(option: Answer) {
    const next = { ...answers, [questions[step].key]: option }
    setAnswers(next)
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
          profession: next.profession?.value,
          familiarity: next.familiarity?.value,
          goal: next.goal?.value,
          city: next.city?.value,
        },
      })
      sessionStorage.setItem('sba_onboarding_id', result.id)
      setCompleted(true)
    } catch {
      setError('Jawaban belum berhasil disimpan. Pilih jawaban sekali lagi untuk mencoba.')
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
      <main className="conversation page-width">
        <p className="section-label">Kenalan sebentar</p>
        <h1>Mulai dari ceritamu.</h1>
        <p className="conversation-intro">
          Empat pilihan singkat untuk menemukan langkah awal yang cocok buatmu.
        </p>
        <p className="conversation-privacy">
          Jawabanmu disimpan untuk memahami kebutuhan peserta dan merancang kegiatan. Jangan
          masukkan informasi pribadi atau rahasia.
        </p>
        <div className="conversation-thread" aria-live="polite">
          <p className="chat-bubble chat-guide">{greeting}</p>
          {questions.map((question, index) => {
            const answer = answers[question.key]
            if (index > step || (completed && !answer)) return null
            return (
              <div className="chat-exchange" key={question.key}>
                <p className="chat-bubble chat-guide">{question.text}</p>
                {answer && <p className="chat-bubble chat-answer">{answer.label}</p>}
                {index === step && !completed && !answer && (
                  <div className="chat-options" aria-label="Pilihan jawaban">
                    {question.options.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => choose(option)}
                        disabled={saving}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
                {index === step && !completed && answer && error && (
                  <div className="chat-options">
                    {question.options.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => choose(option)}
                        disabled={saving}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {saving && <p className="chat-status">Menyimpan jawabanmu...</p>}
          {error && (
            <p className="join-error" role="alert">
              {error}
            </p>
          )}
          {completed && (
            <div className="onboarding-result">
              <p className="section-label">Langkah awalmu</p>
              <h2>AI bisa dimulai dari hal yang dekat.</h2>
              <p>{feedbackFor(answers)}</p>
              <p>
                Ingin mendapat kabar saat kegiatan Semua Bisa AI tersedia? Masuk waiting list, lalu
                kamu bisa mengajukan sampai lima pertanyaan tentang gerakan ini.
              </p>
              <Link className="join-link" to="/join">
                Masuk waiting list
              </Link>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </main>
    </div>
  )
}

export const Route = createFileRoute('/onboarding')({ component: OnboardingPage })
