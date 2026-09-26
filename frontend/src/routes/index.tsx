import { Link, createFileRoute } from '@tanstack/react-router'

import { landing } from '@/content/landing'

function JoinLink({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <Link className={`join-link ${className}`} to="/join">
      {children}
      <span aria-hidden="true">↗</span>
    </Link>
  )
}

function HomePage() {
  return (
    <div className="site-shell" id="top">
      <div className="announcement">{landing.announcement}</div>
      <header className="site-header page-width">
        <a className="wordmark" href="#top" aria-label="Semua Bisa AI, kembali ke atas">
          semua bisa<span>ai.</span>
        </a>
        <nav aria-label="Navigasi utama">
          <a href="#tentang">Tentang</a>
          <a href="#cara-belajar">Cara belajar</a>
        </nav>
        <JoinLink className="header-cta">Join the waiting list</JoinLink>
      </header>

      <main>
        <section className="hero page-width" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">{landing.heroEyebrow}</p>
            <h1 id="hero-title">{landing.heroTitle}</h1>
            <p className="hero-body">{landing.heroBody}</p>
            <JoinLink>Join the waiting list</JoinLink>
            <p className="hero-note">{landing.heroNote}</p>
          </div>
          <div
            className="hero-media"
            aria-label="Area visual utama untuk foto kegiatan Semua Bisa AI"
          >
            <div className="media-shape media-shape-one" />
            <div className="media-shape media-shape-two" />
            <div className="media-disc">
              semua
              <br />
              bisa<span>ai.</span>
            </div>
            <span className="media-caption">RUANG UNTUK FOTO KEGIATAN</span>
          </div>
        </section>

        <section className="intro" id="tentang" aria-labelledby="intro-title">
          <div className="page-width intro-grid">
            <p className="eyebrow">{landing.introEyebrow}</p>
            <div>
              <h2 id="intro-title">{landing.introTitle}</h2>
              <p>{landing.introBody}</p>
            </div>
          </div>
        </section>

        <section className="formats page-width" id="cara-belajar" aria-labelledby="formats-title">
          <div className="section-heading">
            <p className="eyebrow">{landing.formatEyebrow}</p>
            <h2 id="formats-title">{landing.formatTitle}</h2>
          </div>
          <div className="format-grid">
            {landing.formats.map((item) => (
              <article className={`format-card ${item.className}`} key={item.title}>
                <span className="format-label">{item.label}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
                <span className="format-arrow" aria-hidden="true">
                  ↗
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="closing" aria-labelledby="closing-title">
          <div className="page-width closing-inner">
            <div>
              <p className="eyebrow">{landing.closingEyebrow}</p>
              <h2 id="closing-title">{landing.closingTitle}</h2>
              <p>{landing.closingBody}</p>
            </div>
            <JoinLink className="join-link--light">Join the waiting list</JoinLink>
          </div>
        </section>
      </main>
      <footer className="site-footer page-width">
        <span className="wordmark">
          semua bisa<span>ai.</span>
        </span>
        <span>Gerakan belajar AI untuk semua orang.</span>
      </footer>
    </div>
  )
}

export const Route = createFileRoute('/')({ component: HomePage })
