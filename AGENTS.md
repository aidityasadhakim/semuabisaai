# Semua Bisa AI — panduan repositori

Proyek ini memperkenalkan kecakapan AI kepada masyarakat Indonesia dari berbagai profesi. Konten harus mudah dipahami pembaca nonteknis, berpusat pada kemampuan manusia, dan tidak menjanjikan jadwal atau fasilitas yang belum tersedia.

## Struktur

- `frontend/`: React, TypeScript, Vite, TanStack Router, Tailwind CSS.
- `backend/`: Go, Echo, SQLite. Saat ini hanya fondasi untuk pengembangan berikutnya.
- `docker-compose*.yml`: konfigurasi pengembangan dan produksi.

## Verifikasi

- Frontend: `cd frontend && bun run build && bun run lint`
- Backend: `cd backend && go test ./... && go vet ./...`

Gunakan format TypeScript yang ada: tanpa semikolon, kutip tunggal, dan trailing comma. Pertahankan dukungan layar kecil dan navigasi keyboard.
