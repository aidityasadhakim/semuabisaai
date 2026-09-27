// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'

import { OnboardingPage } from './onboarding'
import { apiFetch } from '@/lib/api'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  createFileRoute: () => () => ({}),
}))
vi.mock('@/lib/api', () => ({ apiFetch: vi.fn() }))

beforeEach(() => {
  vi.mocked(apiFetch).mockReset()
  vi.mocked(apiFetch).mockImplementation((endpoint, options) => {
    if (endpoint === '/api/onboarding') return Promise.resolve({ id: 'saved-session' })
    if (endpoint !== '/api/onboarding/turn') throw new Error(`Unexpected request: ${endpoint}`)
    const lastStep = (options?.body as { lastStep: string }).lastStep
    const turns: Record<string, { reply: string; question: string }> = {
      profile: {
        reply: 'Alya, belajar di ITB memberi banyak kesempatan untuk mencoba AI.',
        question: 'Alya, di kota mana kamu tinggal selama kuliah di ITB?',
      },
      city: {
        reply: 'Bandung terdengar dekat dengan keseharian kuliahmu di ITB.',
        question: 'Saat kuliah di ITB, kegiatan apa yang paling sering kamu lakukan?',
      },
      profession: {
        reply: 'Tugas kuliahmu bisa jadi tempat yang baik untuk mencoba AI.',
        question: 'Sudah pernah memakai AI untuk membantu tugas kuliah?',
      },
      familiarity: {
        reply: 'Belum pernah mencoba AI itu tidak masalah, Alya.',
        question: 'Apa yang paling ingin kamu pelajari dengan AI?',
      },
      goal: {
        reply: 'Belajar hal baru adalah tujuan yang bagus untuk langkah pertamamu.',
        question: '',
      },
    }
    return Promise.resolve(turns[lastStep])
  })
})

test('shows three profile questions together, then the model reply and question after each answer', async () => {
  render(<OnboardingPage />)

  expect(screen.getByText('Siapa namamu?')).toBeTruthy()
  expect(screen.getByText('Saat ini kamu sedang apa?')).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Siapa namamu?'), { target: { value: 'Alya' } })
  fireEvent.click(screen.getByRole('button', { name: 'Mahasiswa' }))
  expect(screen.getByText('Kamu kuliah di mana?')).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Kamu kuliah di mana?'), { target: { value: 'ITB' } })
  fireEvent.click(screen.getByRole('button', { name: 'Lanjut' }))

  expect(
    await screen.findByText('Alya, belajar di ITB memberi banyak kesempatan untuk mencoba AI.'),
  ).toBeTruthy()
  expect(
    screen.getByRole('heading', { name: 'Alya, di kota mana kamu tinggal selama kuliah di ITB?' }),
  ).toBeTruthy()

  fireEvent.change(screen.getByLabelText('Alya, di kota mana kamu tinggal selama kuliah di ITB?'), {
    target: { value: 'Bandung' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Lanjut' }))

  await waitFor(() =>
    expect(
      screen.getByText('Bandung terdengar dekat dengan keseharian kuliahmu di ITB.'),
    ).toBeTruthy(),
  )
  expect(
    screen.getByRole('heading', {
      name: 'Saat kuliah di ITB, kegiatan apa yang paling sering kamu lakukan?',
    }),
  ).toBeTruthy()
  expect(screen.getByRole('button', { name: /Belajar dan mengerjakan tugas/ })).toBeTruthy()
  expect(screen.getByText('Percakapan sebelumnya (1)')).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: /Belajar dan mengerjakan tugas/ }))
  expect(
    await screen.findByText('Tugas kuliahmu bisa jadi tempat yang baik untuk mencoba AI.'),
  ).toBeTruthy()
  expect(
    screen.getByRole('heading', { name: 'Sudah pernah memakai AI untuk membantu tugas kuliah?' }),
  ).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: 'Belum pernah' }))
  expect(await screen.findByText('Belum pernah mencoba AI itu tidak masalah, Alya.')).toBeTruthy()
  expect(
    screen.getByRole('heading', { name: 'Apa yang paling ingin kamu pelajari dengan AI?' }),
  ).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: 'Belajar hal baru' }))
  expect(
    await screen.findByText('Belajar hal baru adalah tujuan yang bagus untuk langkah pertamamu.'),
  ).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Gabung waiting list' })).toBeTruthy()
  expect(
    vi.mocked(apiFetch).mock.calls.filter(([endpoint]) => endpoint === '/api/onboarding/turn'),
  ).toHaveLength(5)
})
