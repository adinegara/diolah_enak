# Diolah Enak

Sistem Manajemen Transaksi untuk penjual produk dengan fitur pelacakan order, retur, dan kalkulasi keuangan.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwind-css)

## Fitur Utama

- **Autentikasi** - Login dengan Google OAuth via Supabase
- **Dashboard** - Ringkasan statistik dan aksi cepat
- **Manajemen Produk** - CRUD produk dengan harga
- **Manajemen Pelanggan** - CRUD pelanggan/zona pengiriman
- **Transaksi** - Catat order dan retur dengan kalkulasi otomatis
- **Filter & Laporan** - Filter transaksi berdasarkan pelanggan, bulan, tahun
- **Responsive Design** - Tampilan optimal di desktop dan mobile
- **Dark Mode** - Tema gelap sebagai default

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth) |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui |
| Form | React Hook Form + Zod |
| Icons | Lucide React |
| Notifications | Sonner |`

## Instalasi

### Prasyarat

- Node.js 18+
- npm atau pnpm
- Akun Supabase

### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/your-username/diolah_enak.git
   cd diolah_enak
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**

   Buat file `.env.local` di root project:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Setup database**

   Jalankan SQL schema di Supabase SQL Editor:
   ```sql
   -- Customer/Zone table
   CREATE TABLE public.customer (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     created_at timestamp DEFAULT now(),
     name text NOT NULL,
     description text,
     phone text,
     address text
   );

   -- Product table
   CREATE TABLE public.product (
     id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
     created_at timestamp DEFAULT now(),
     name text NOT NULL,
     description text,
     price bigint
   );

   -- Transaction table
   CREATE TABLE public.transaction (
     id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
     created_at timestamp DEFAULT now(),
     order_qty bigint,
     return_qty bigint,
     date date,
     zone_id uuid REFERENCES customer(id),
     product_id bigint REFERENCES product(id),
     status text
   );
   ```

5. **Setup Google OAuth di Supabase**
   - Buka Supabase Dashboard > Authentication > Providers
   - Enable Google provider
   - Masukkan Client ID dan Client Secret dari Google Cloud Console
   - Tambahkan callback URL: `https://your-project.supabase.co/auth/v1/callback`

6. **Jalankan development server**
   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000)

## Scripts

| Script | Deskripsi |
|--------|-----------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk production |
| `npm run start` | Jalankan production server |
| `npm run lint` | Jalankan ESLint |

## Database Schema

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  customer   │     │ transaction │     │   product   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (uuid)   │◄────│ zone_id     │     │ id (bigint) │
│ name        │     │ product_id  │────►│ name        │
│ phone       │     │ order_qty   │     │ price       │
│ address     │     │ return_qty  │     │ description │
│ description │     │ date        │     │ created_at  │
│ created_at  │     │ status      │     └─────────────┘
└─────────────┘     │ created_at  │
                    └─────────────┘
```

## Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Cloudflare Pages
```bash
npm run build
# Deploy via Cloudflare dashboard
```

## Contributing

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/fitur-baru`)
3. Commit perubahan (`git commit -m 'Tambah fitur baru'`)
4. Push ke branch (`git push origin feature/fitur-baru`)
5. Buat Pull Request

## License

MIT License

---

**Diolah Enak** - Sistem Manajemen Transaksi
