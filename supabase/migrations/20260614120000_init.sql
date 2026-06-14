-- ============================================================
--  SISTEM TEMPAHAN COURT — TVET MARA LUMUT
--  Supabase Schema (PostgreSQL)
--  Cara guna: Supabase Dashboard → SQL Editor → tampal → Run
-- ============================================================

-- ------------------------------------------------------------
-- 1. STUDENTS  (allowlist pelajar + auth)
--    IT import senarai pelajar ke sini (CSV).
--    password_hash NULL = belum set password
--      (first login / selepas admin reset).
-- ------------------------------------------------------------
create table public.students (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  nama          text not null,
  matric        text,
  ic            text not null,         -- guna 4 digit terakhir untuk verify first login
  kursus        text,
  password_hash text,                  -- NULL = perlu set password
  created_at    timestamptz default now()
);

-- ------------------------------------------------------------
-- 2. COURTS  (4 court fizikal + sukan yang disokong)
-- ------------------------------------------------------------
create table public.courts (
  id               int primary key,
  name             text not null,
  position         int  not null,      -- susunan paparan
  supported_sports text[] not null,    -- 'futsal','netball','handball','volleyball'
  active           boolean default true
);

insert into public.courts (id, name, position, supported_sports) values
  (1, 'Court 1', 1, array['futsal','netball','handball']),
  (2, 'Court 2', 2, array['futsal']),
  (3, 'Court 3', 3, array['volleyball']),
  (4, 'Court 4', 4, array['volleyball']);

-- ------------------------------------------------------------
-- 3. SLOTS  (slot masa tetap — data, bukan hardcode dalam JS)
-- ------------------------------------------------------------
create table public.slots (
  id         int primary key,
  code       text unique not null,
  label_ms   text not null,
  start_time time not null,
  end_time   time not null,
  sort_order int  not null
);

insert into public.slots (id, code, label_ms, start_time, end_time, sort_order) values
  (1, 'petang', 'Petang (5:00–7:00pm)',        '17:00', '19:00', 1),
  (2, 'malam1', 'Malam Sesi 1 (8:00–9:30pm)',  '20:00', '21:30', 2),
  (3, 'malam2', 'Malam Sesi 2 (9:30–11:00pm)', '21:30', '23:00', 3);

-- ------------------------------------------------------------
-- 4. BOOKINGS
-- ------------------------------------------------------------
create table public.bookings (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students(id) on delete cascade,
  court_id     int  not null references public.courts(id),
  slot_id      int  not null references public.slots(id),
  sport        text not null,         -- key sukan: futsal/netball/handball/volleyball
  booking_date date not null,
  status       text not null default 'active' check (status in ('active','cancelled')),
  created_at   timestamptz default now()
);

-- 🔴 CONFLICT RULE (paling penting):
--    Satu court fizikal TAK BOLEH double-book untuk
--    date + slot yang sama, walau apa pun sukannya.
--    Booking yang dah 'cancelled' tak mengira (boleh book semula).
create unique index uniq_active_booking
  on public.bookings (court_id, booking_date, slot_id)
  where status = 'active';

-- index tambahan untuk query laju
create index idx_bookings_date     on public.bookings (booking_date);
create index idx_bookings_student  on public.bookings (student_id);

-- ------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS)
--    Kunci students & bookings — hanya Edge Function
--    (service role) boleh sentuh. courts & slots boleh
--    dibaca terus oleh frontend (data tak sensitif).
-- ------------------------------------------------------------
alter table public.students enable row level security;
alter table public.courts   enable row level security;
alter table public.slots    enable row level security;
alter table public.bookings enable row level security;

-- courts & slots: read-only untuk semua
create policy "read courts" on public.courts for select using (true);
create policy "read slots"  on public.slots  for select using (true);

-- students & bookings: TIADA policy untuk anon
--   → anon key tak boleh baca/tulis langsung.
--   → Edge Function guna SERVICE ROLE KEY (bypass RLS) untuk semua operasi.
