import { useAuth } from '@clerk/react'
import { Link, createFileRoute } from '@tanstack/react-router'

import { landing } from '@/content/landing'
import { isClerkConfigured } from '@/lib/clerk'

function SignedInAwareCta() {
  const { isSignedIn } = useAuth()
  return (
    <Link className="join-link" to={isSignedIn ? '/join' : '/onboarding'}>
      {isSignedIn ? 'Kamu Sudah Tergabung' : 'Mulai dari ceritamu'}
    </Link>
  )
}

function LandingCta() {
  return isClerkConfigured() ? (
    <SignedInAwareCta />
  ) : (
    <Link className="join-link" to="/onboarding">
      Mulai dari ceritamu
    </Link>
  )
}

function HomePage() {
  return (
    <div className="site-shell">
      <header className="site-header page-width">
        <span className="wordmark">semuabisaai.id</span>
      </header>

      <main>
        <section className="hero page-width" aria-labelledby="hero-title">
          <h1 id="hero-title">{landing.heroTitle}</h1>
          <p className="hero-body">{landing.heroBody}</p>
          <LandingCta />
        </section>

        <section className="vision" aria-labelledby="vision-title">
          <div className="section-inner page-width">
            <p className="section-label">{landing.visionLabel}</p>
            <h2 id="vision-title">{landing.visionTitle}</h2>
            <p>{landing.visionBody}</p>
          </div>
        </section>

        <section className="goals section-inner page-width" aria-labelledby="goals-title">
          <p className="section-label">{landing.goalsLabel}</p>
          <h2 id="goals-title">{landing.goalsTitle}</h2>
          <div className="goal-grid">
            {landing.goals.map((goal) => (
              <article className="goal" key={goal.title}>
                <h3>{goal.title}</h3>
                <p>{goal.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="formats" aria-labelledby="formats-title">
          <div className="section-inner page-width">
            <p className="section-label">{landing.formatsLabel}</p>
            <h2 id="formats-title">{landing.formatsTitle}</h2>
            <div className="format-grid">
              {landing.formats.map((item) => (
                <article className="format-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="closing section-inner page-width" aria-labelledby="closing-title">
          <h2 id="closing-title">{landing.closingTitle}</h2>
          <p>{landing.closingBody}</p>
          <LandingCta />
        </section>
      </main>

    </div>
  )
}

export const Route = createFileRoute('/')({ component: HomePage })
