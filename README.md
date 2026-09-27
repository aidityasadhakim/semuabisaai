# Semua Bisa AI

Situs gerakan kecakapan AI untuk masyarakat Indonesia. Pengunjung dapat mengikuti onboarding percakapan sebagai tamu, lalu masuk **waiting list**. Anggota waiting list dapat bertanya hingga lima kali tentang Semua Bisa AI.

## Menjalankan lokal

Salin `.env.example` menjadi `.env` di root proyek. Isi `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, dan `OPENROUTER_API_KEY`. Kunci OpenRouter hanya dibaca backend; jangan beri awalan `VITE_`.

Jalankan seluruh aplikasi dengan Docker Compose:

```bash
make dev
```

Perintah ini membangun dan menjalankan backend serta frontend bersama. Buka `http://localhost:3000`. Tekan Ctrl+C untuk menghentikannya. Untuk frontend saja tanpa Docker, gunakan `make dev-frontend`; perintah itu memasang dependensi dari lockfile sebelum memulai Vite.

Buka `/onboarding` untuk alur umum atau `/card?ref=aidityasadhakim` untuk alur QR kartu Aidityas Adhakim. Beranda juga mengarah ke onboarding. Backend membuat tabel onboarding, waiting list, dan tanya jawab saat mulai; migrasi Goose yang setara tersedia di `backend/sql/migrations/002_onboarding.sql`.

## Alur dan data

- Tiga pertanyaan profil (nama, status, dan tempat kerja/kuliah/usaha) ditampilkan bersama. Setelah itu, model memberi balasan dan menyusun redaksi pertanyaan berikutnya untuk domisili, kegiatan, pengalaman AI, dan tujuan. Topik dan pilihan jawaban tetap ditentukan aplikasi; balasan dan pertanyaan cadangan tersedia jika model gagal.
- Jawaban lengkap disimpan bersama kode referral dan waktu pengisian untuk analitik. Onboarding tidak memerlukan akun. Pendaftaran waiting list memakai akun Clerk dan tersimpan di SQLite.
- Setelah bergabung, anggota dapat mengajukan maksimal lima pertanyaan. Setiap permintaan yang dikirim ke OpenRouter memakai satu jatah, termasuk bila penyedia gagal menjawab. Backend membatasi panjang pertanyaan dan keluaran model.
- Model yang dipakai: `deepseek/deepseek-v4.1-flash:nitro` melalui OpenRouter. Panduan isi dan nada jawaban ada di `docs/brand-answer-guideline.md`.

Untuk melihat minat berdasarkan referral, profesi, dan kota, data tersedia di tabel `onboarding_sessions`; nama, status, dan tempat kegiatan ada di `onboarding_profiles`. Hubungan dengan anggota yang mendaftar tersedia melalui `waitlist_members.onboarding_id`. Riwayat tanya jawab tersimpan di `visitor_questions`. Belum ada dashboard analitik.

## Produksi

Isi variabel yang sama di `.env` root beserta `DOMAIN_NAME`, lalu jalankan `make prod-up`. Kedua berkas Docker Compose meneruskan `OPENROUTER_API_KEY` hanya ke backend. `VITE_API_URL` boleh kosong agar frontend memakai `/api` pada origin yang sama.

## Pemeriksaan

Frontend: `cd frontend && bun run build && bun run lint`. Backend: `cd backend && go test ./... && go vet ./...`.
