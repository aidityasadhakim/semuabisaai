import { createFileRoute } from '@tanstack/react-router'

const outcomes = [
  {
    title: 'Paham kemampuan AI',
    description:
      'Kenali apa yang bisa dibantu AI, apa batasannya, dan kapan hasilnya perlu diperiksa lagi.',
  },
  {
    title: 'Punya alur kerja baru',
    description: 'Bawa pekerjaan sehari-hari, lalu cari bagian yang bisa dikerjakan bersama AI.',
  },
  {
    title: 'Menggunakan AI dengan bijak',
    description: 'Jaga data, pahami etika penggunaan, dan tetap pegang keputusan sebagai manusia.',
  },
]

function HomePage() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="#beranda" aria-label="Semua Bisa AI, kembali ke awal">
          semua<span>bisa</span>ai<span className="wordmark-dot">.</span>
        </a>
        <nav aria-label="Navigasi utama">
          <a href="#tentang">Tentang gerakan</a>
          <a href="#cara-belajar">Cara belajar</a>
        </nav>
      </header>
      <main id="beranda">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Gerakan belajar AI untuk semua orang</p>
            <h1 id="hero-title">
              AI bukan cuma untuk <span>orang teknis.</span>
            </h1>
            <p className="hero-description">
              Perkembangan AI itu nyata. Semua Bisa AI mengajak siapa pun mengenal, mencoba, dan
              menggunakan AI untuk memperkuat kemampuan dalam pekerjaan sehari-hari.
            </p>
            <a className="primary-link" href="#tentang">
              Kenali gerakannya <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-orbit art-orbit-outer" />
            <div className="art-orbit art-orbit-inner" />
            <div className="art-core">
              bisa<span>!</span>
            </div>
            <span className="art-label art-label-top">GURU</span>
            <span className="art-label art-label-right">AKUNTAN</span>
            <span className="art-label art-label-bottom">PROGRAMMER</span>
            <span className="art-label art-label-left">SIAPA SAJA</span>
          </div>
        </section>
        <section className="intro section-wrap" id="tentang" aria-labelledby="intro-title">
          <p className="section-tag">Kenapa gerakan ini ada?</p>
          <div>
            <h2 id="intro-title">Jarak pengetahuan AI perlu kita dekatkan bersama.</h2>
            <p>
              Perubahan AI berjalan cepat, sementara banyak orang belum sempat melihat apa yang
              sudah mungkin dilakukan hari ini. Kami percaya kecakapan AI bisa dipelajari siapa pun,
              apa pun profesinya. Tidak perlu menjadi ahli untuk mulai memanfaatkannya.
            </p>
          </div>
        </section>
        <section className="outcomes" id="cara-belajar" aria-labelledby="outcomes-title">
          <div className="section-wrap">
            <p className="section-tag">Belajar untuk menghasilkan sesuatu</p>
            <h2 id="outcomes-title">Pulang dengan cara kerja yang lebih baik.</h2>
            <p className="outcomes-lead">
              Melalui seminar offline gratis di berbagai kota dan bootcamp beberapa sesi, setiap
              peserta diajak mencoba AI pada kebutuhan yang nyata.
            </p>
            <div className="outcome-list">
              {outcomes.map((outcome, index) => (
                <article className="outcome" key={outcome.title}>
                  <span className="outcome-number">0{index + 1}</span>
                  <div>
                    <h3>{outcome.title}</h3>
                    <p>{outcome.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="closing section-wrap" aria-labelledby="closing-title">
          <p className="section-tag">Manusia tetap di pusatnya</p>
          <h2 id="closing-title">Belajar AI untuk memperluas kemungkinan.</h2>
          <p>
            Fokus kami adalah kecakapan praktis, bukan pelatihan mendalam membangun model AI,
            kumpulan prompt instan, atau menggantikan manusia dengan otomasi. Materi yang lebih
            spesifik untuk tiap profesi akan tumbuh dari kebutuhan pesertanya.
          </p>
        </section>
      </main>
      <footer className="site-footer">
        <span>semuabisaai.</span>
        <span>AI untuk semua. Mulai dari yang nyata.</span>
      </footer>
    </div>
  )
}

export const Route = createFileRoute('/')({ component: HomePage })
