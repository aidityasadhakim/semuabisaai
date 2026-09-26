# Semua Bisa AI

Semua Bisa AI adalah gerakan untuk membantu masyarakat Indonesia membangun kecakapan AI. Fokusnya adalah memahami kemampuan dan batas AI, memakai AI dalam alur kerja sehari-hari, dan menggunakannya secara aman serta etis.

Tahap awal repositori ini berisi halaman pengantar gerakan. Rencana kegiatan meliputi seminar offline gratis di berbagai kota dan bootcamp beberapa sesi dengan hasil nyata bagi peserta. Materi khusus profesi, jadwal, dan pendaftaran belum tersedia.

## Menjalankan aplikasi

Frontend memakai React, TypeScript, Vite, dan Bun. Backend Go/Echo dari fondasi awal tetap tersedia untuk pengembangan berikutnya; halaman pengantar saat ini tidak memerlukan backend.

```bash
cd frontend
bun install
bun run dev
```

Buka http://localhost:3000. Untuk memeriksa build: `bun run build`.

Konfigurasi backend dan Docker tersedia di `.env.example`, `Makefile`, dan berkas Compose. Autentikasi Clerk masih opsional dan belum dipakai oleh halaman pengantar.
