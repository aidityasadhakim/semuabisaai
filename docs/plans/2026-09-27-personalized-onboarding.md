# Onboarding personal dan tanya jawab

Pengunjung, termasuk yang datang dari QR `/card?ref=aidityasadhakim`, menjawab pilihan berurutan dalam tampilan percakapan. Pilihan sebelumnya diringkas saat pertanyaan berikutnya muncul. Setelah empat jawaban, tampilkan umpan balik praktis sesuai profil dan undang ke waiting list. Tamu boleh mengisi tanpa akun. Pendaftaran memakai akun Clerk yang sudah ada.

Backend menyimpan pilihan, sumber referral, dan waktu pengisian untuk analitik. Keanggotaan waiting list dan jatah lima pertanyaan disimpan di SQLite, bukan hanya metadata browser. API tanya jawab harus memverifikasi akun, memastikan keanggotaan, dan membatasi total pertanyaan sebelum menghubungi OpenRouter `deepseek/deepseek-v4.1-flash`. Jawaban mengikuti `docs/brand-answer-guideline.md` dan berbahasa Indonesia.

Verifikasi: build/lint frontend, test/vet backend, uji endpoint publik dan batas lima pertanyaan secara terarah, serta tinjau alur mobile dan keyboard.
