# Semua Bisa AI

Landing page awal untuk gerakan belajar AI bagi masyarakat Indonesia. Struktur halaman dan teksnya ada di `frontend/src/routes/index.tsx` dan `frontend/src/content/landing.ts`; isi `landing.ts` untuk mengganti copy. Area visual utama masih berupa tempat untuk foto kegiatan.

## Menjalankan lokal

```bash
cd frontend
bun install
cd ..
make dev
```

Buka http://localhost:3000. Hentikan server dengan Ctrl+C pada terminal yang menjalankan `make dev`. Pemeriksaan: `cd frontend && bun run build && bun run lint`.

## Waiting list dengan Clerk

1. Buat aplikasi Clerk dan isi `VITE_CLERK_PUBLISHABLE_KEY` di `frontend/.env` (lihat `frontend/.env.example`).
2. Di Clerk Dashboard, aktifkan **email** dan **Google** sebagai cara sign in/sign up.
3. Buka `/join`, masuk dengan Google atau email, lalu pilih **Konfirmasi masuk daftar**.

Konfirmasi menyimpan `waitlistJoinedAt` di `unsafeMetadata` pengguna Clerk. Ini penanda minat awal yang bisa dilihat pada profil pengguna; belum menjadi sistem undangan, persetujuan, atau kontrol akses. Metadata ini dapat diubah oleh pengguna sendiri, sehingga jangan dipakai sebagai sumber otorisasi. Jika Clerk belum dikonfigurasi, halaman menampilkan petunjuk pengaturan dan tidak mengklaim pendaftaran berhasil.

## Anotasi UI

[Agentation](https://www.agentation.com/install) terpasang untuk mode pengembangan. Saat `bun run dev` aktif, buka halaman di browser desktop, klik toolbar di pojok, tandai elemen, dan salin hasil anotasinya untuk revisi. Toolbar tidak dimuat pada build produksi.

Backend Go/Echo dan konfigurasi Docker dari fondasi proyek tetap tersedia untuk pengembangan berikutnya.
