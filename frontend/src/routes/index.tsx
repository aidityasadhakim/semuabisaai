import { Link, createFileRoute } from '@tanstack/react-router'

import { landing } from '@/content/landing'

function HomePage() {
  return (
    <div className="site-shell">
      <header className="site-header page-width">
        <span className="wordmark">semua bisa ai.</span>
      </header>

      <main>
        <section className="hero page-width" aria-labelledby="hero-title">
          <div className="hero-content">
            <h1 id="hero-title">{landing.heroTitle}</h1>
            <p>{landing.heroBody}</p>
            <Link className="join-link" to="/join">
              Join the waiting list
            </Link>
          </div>
        </section>

        <section className="formats page-width" aria-labelledby="formats-title">
          <h2 id="formats-title">{landing.formatsTitle}</h2>
          <div className="format-list">
            {landing.formats.map((item) => (
              <div className="format-item" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer page-width">Semua Bisa AI</footer>
    </div>
  )
}

export const Route = createFileRoute('/')({ component: HomePage })
