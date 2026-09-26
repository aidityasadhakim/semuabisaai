# Semua Bisa AI

Landing page awal untuk gerakan belajar AI bagi masyarakat Indonesia. Struktur halaman ada di `frontend/src/routes/index.tsx`. Teks publiknya dikumpulkan di `frontend/src/content/landing.ts` agar mudah diganti.

## Menjalankan lokal

Jika belum ada `.env` di root proyek, salin `.env.example` ke `.env` lalu isi `VITE_CLERK_PUBLISHABLE_KEY`.

```bash
cd frontend
bun install
cd ..
make dev
```

Buka http://localhost:3000. Hentikan server dengan Ctrl+C pada terminal yang menjalankan `make dev`. Pemeriksaan: `cd frontend && bun run build && bun run lint`.

## Waiting list dengan Clerk

1. Isi `VITE_CLERK_PUBLISHABLE_KEY` dari Clerk Dashboard di `.env` pada root proyek. File yang sama dipakai oleh `make dev`, `make dev-docker`, dan `make prod-up`.
2. Di Clerk Dashboard, aktifkan **email** dan **Google** sebagai cara sign in/sign up.
3. Buka `/join`, masuk dengan Google atau email, lalu pilih **Konfirmasi masuk daftar**.

Jika menjalankan backend Go, isi `CLERK_SECRET_KEY` di file yang sama. Hanya variabel berawalan `VITE_` yang masuk ke browser; secret key tetap di backend. `VITE_API_URL` dapat dibiarkan kosong agar `/api` memakai origin yang sama. Saat dev, Vite meneruskan `/api` ke backend lokal atau container Docker.

Untuk produksi Docker, isi juga `DOMAIN_NAME` dan `SSL_EMAIL`, lalu jalankan `make prod-up`. Compose membangun frontend dan Caddy dari `.env` root, sehingga tidak perlu membuat `frontend/.env` atau membangun `frontend/dist` secara terpisah.

Konfirmasi menyimpan `waitlistJoinedAt` di `unsafeMetadata` pengguna Clerk. Ini penanda minat awal yang bisa dilihat pada profil pengguna; belum menjadi sistem undangan, persetujuan, atau kontrol akses. Metadata ini dapat diubah oleh pengguna sendiri, sehingga jangan dipakai sebagai sumber otorisasi. Jika Clerk belum dikonfigurasi, halaman menampilkan petunjuk pengaturan dan tidak mengklaim pendaftaran berhasil.

## Anotasi UI

[Agentation](https://www.agentation.com/install) terpasang untuk mode pengembangan. Saat `bun run dev` aktif, buka halaman di browser desktop, klik toolbar di pojok, tandai elemen, dan salin hasil anotasinya untuk revisi. Toolbar tidak dimuat pada build produksi.

Backend Go/Echo dan konfigurasi Docker dari fondasi proyek tetap tersedia untuk pengembangan berikutnya.
