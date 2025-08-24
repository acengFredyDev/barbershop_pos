# Barbershop POS System

Aplikasi Point of Sale (POS) untuk barbershop dengan fitur multi-user (owner, kasir, capster), manajemen pelanggan, transaksi, dan laporan.

## Fitur Utama

### Untuk Owner
- Dashboard dengan laporan penjualan dan performa
- Melihat omzet harian dan bulanan
- Melihat performa kasir dan capster
- Manajemen layanan dan harga

### Untuk Kasir
- Sistem POS untuk transaksi
- Tambah pelanggan baru
- Pilih layanan dan proses pembayaran
- Cetak struk

### Untuk Capster (Barber)
- Sistem absensi (check-in/check-out)
- Melihat daftar pelanggan
- Membuat catatan untuk pelanggan
- Melihat jadwal dan tip

## Teknologi

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **Deployment**: Vercel

## Struktur Database

### Tables
- `profiles`: Data pengguna (owner, kasir, capster)
- `customers`: Data pelanggan
- `services`: Layanan yang tersedia
- `transactions`: Transaksi penjualan
- `transaction_services`: Detail layanan dalam transaksi
- `attendances`: Absensi capster
- `customer_notes`: Catatan untuk pelanggan

## Cara Menjalankan Aplikasi

### Prasyarat

- Node.js (versi 18 atau lebih baru)
- NPM atau Yarn
- Akun Supabase

### Langkah-langkah

1. Clone repository
   ```bash
   git clone https://github.com/username/barbershop-pos.git
   cd barbershop-pos
   ```

2. Install dependencies
   ```bash
   npm install
   # atau
   yarn install
   ```

3. Konfigurasi environment variables
   - Buat file `.env.local` di root project
   - Tambahkan Supabase URL dan Anon Key:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Jalankan aplikasi dalam mode development
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

5. Buka browser dan akses `http://localhost:3000`

## Deployment ke Vercel

1. Buat akun di [Vercel](https://vercel.com) jika belum memiliki
2. Install Vercel CLI
   ```bash
   npm install -g vercel
   ```
3. Login ke Vercel
   ```bash
   vercel login
   ```
4. Deploy aplikasi
   ```bash
   vercel
   ```
5. Tambahkan environment variables di dashboard Vercel

## Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Buat tabel-tabel yang diperlukan menggunakan SQL Editor atau interface Supabase
3. Aktifkan autentikasi email/password di Authentication > Providers
4. Salin URL dan Anon Key dari Settings > API untuk digunakan di environment variables

## Struktur Project

```
├── public/             # Static files
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── dashboard/  # Owner dashboard
│   │   ├── pos/        # Cashier POS
│   │   ├── barber/     # Barber app
│   │   └── login/      # Authentication
│   ├── components/     # React components
│   │   ├── ui/         # UI components
│   │   └── layout/     # Layout components
│   └── lib/            # Utilities and types
├── .env.local          # Environment variables
└── package.json        # Dependencies
```

## Kontribusi

Kontribusi selalu diterima! Silakan buat pull request atau buka issue untuk diskusi.

## Lisensi

MIT