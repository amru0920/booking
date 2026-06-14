# Supabase — Sistem Tempahan Court (TVET MARA Lumut)

Folder ni mengandungi backend Supabase: schema database + Edge Function.

```
supabase/
├── functions/
│   └── booking/
│       ├── index.ts     ← Edge Function (API utama)
│       └── deno.json
└── migrations/
    └── 20260614120000_init.sql   ← Schema database
.vscode/
└── settings.json        ← Scope Deno ke folder function je (hilangkan merah)
```

---

## LANGKAH 1 — Schema database

**Cara A (dashboard, paling senang):**
Buka `migrations/20260614120000_init.sql` → copy semua → Supabase Dashboard → SQL Editor → Run.

**Cara B (CLI):**
```bash
supabase init        # kalau belum ada folder supabase/config.toml
supabase link --project-ref <PROJECT_REF>
supabase db push
```

---

## LANGKAH 2 — Deploy Edge Function

**Cara A (dashboard):**
Edge Functions → Create function → nama `booking` → copy isi `index.ts` → Deploy.

**Cara B (CLI):**
```bash
supabase functions deploy booking --no-verify-jwt
```
> `--no-verify-jwt` WAJIB sebab kita guna custom auth, bukan Supabase Auth.

---

## LANGKAH 3 — Set Secrets (WAJIB)

Dashboard → Edge Functions → Manage secrets:

```
ADMIN_USER = amru
ADMIN_PASS = <password kuat — JANGAN guna 12345>
```

`SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY` automatik ada, tak payah set.

---

## LANGKAH 4 — Import pelajar

Dari IT: dapatkan CSV pelajar (column: `email, nama, matric, ic, kursus`).
Table Editor → `students` → Import → upload CSV.
Biar `password_hash` kosong (sistem isi sendiri lepas student set password).

---

## URL Function

Lepas deploy:
```
https://<PROJECT_REF>.supabase.co/functions/v1/booking
```
Letak URL ni dalam `app.js` (ganti FIXED_API_URL).

---

## Hilangkan garisan merah di VS Code

1. Install extension **Deno** (`denoland.vscode-deno`)
2. File `.vscode/settings.json` dah ada — ia enable Deno untuk folder function je,
   supaya `app.js` (browser) tak terjejas.
3. Reload VS Code.
