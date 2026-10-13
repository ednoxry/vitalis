-- Clínica Vitalis — schema inicial (Supabase / Postgres)
-- Aplicar via `supabase db push` ou colando no SQL Editor.

create extension if not exists pgcrypto;

-- Tipos --------------------------------------------------------------------
do $$ begin
  create type lead_status as enum ('novo', 'em_contato', 'qualificado', 'convertido', 'descartado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type appointment_status as enum ('solicitado', 'confirmado', 'remarcado', 'cancelado', 'concluido');
exception when duplicate_object then null; end $$;

-- Perfis (extensão de auth.users) ------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'paciente' check (role in ('paciente', 'equipe', 'admin')),
  created_at timestamptz not null default now()
);

-- Marcas / preferências de disponibilidade ---------------------------------
create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_minutes smallint not null default 30 check (slot_minutes between 5 and 240),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

-- Leads --------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null,
  telefone text not null,
  email text not null,
  assunto text,
  mensagem text,
  canal text not null default 'contato' check (canal in ('contato', 'agendamento', 'whatsapp')),
  origem text,
  utm jsonb not null default '{}'::jsonb,
  status lead_status not null default 'novo'
);

-- Agendamentos -------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  nome text not null,
  telefone text not null,
  email text not null,
  procedimento text not null,
  data date not null,
  horario time not null,
  unidade text not null,
  obs text,
  protocol text not null unique,
  status appointment_status not null default 'solicitado',
  duration_minutes smallint not null default 30,
  consent boolean not null default false,
  source text
);

-- Lista de espera (quando não há horário) ----------------------------------
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null,
  telefone text not null,
  email text,
  preferencia text
);

-- Índices ------------------------------------------------------------------
create index if not exists appointments_data_idx on public.appointments (data);
create index if not exists appointments_status_idx on public.appointments (status);
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

-- updated_at automático ----------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- Perfil automático ao criar usuário ---------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security -------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.availability_rules enable row level security;
alter table public.leads enable row level security;
alter table public.appointments enable row level security;
alter table public.waitlist enable row level security;

-- profiles: usuário lê/edita o próprio registro; admin vê tudo.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_staff());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- availability_rules: leitura pública (site mostra horários).
drop policy if exists "availability_public_read" on public.availability_rules;
create policy "availability_public_read" on public.availability_rules
  for select using (is_active or public.is_staff());

drop policy if exists "availability_staff_write" on public.availability_rules;
create policy "availability_staff_write" on public.availability_rules
  for all using (public.is_staff()) with check (public.is_staff());

-- appointments: paciente autenticado vê os próprios (por e-mail); equipe vê tudo.
drop policy if exists "appointments_select_own" on public.appointments;
create policy "appointments_select_own" on public.appointments
  for select using (
    public.is_staff()
    or email = coalesce(auth.jwt() ->> 'email', '')
  );

drop policy if exists "appointments_staff_write" on public.appointments;
create policy "appointments_staff_write" on public.appointments
  for all using (public.is_staff()) with check (public.is_staff());

-- leads: apenas equipe.
drop policy if exists "leads_staff_all" on public.leads;
create policy "leads_staff_all" on public.leads
  for all using (public.is_staff()) with check (public.is_staff());

-- waitlist: apenas equipe.
drop policy if exists "waitlist_staff_all" on public.waitlist;
create policy "waitlist_staff_all" on public.waitlist
  for all using (public.is_staff()) with check (public.is_staff());

-- Helper: membro da equipe/admin -------------------------------------------
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('equipe', 'admin')
  );
$$;

-- Seed de disponibilidade padrão (seg–sex 08–19h, sáb 08–13h) ---------------
insert into public.availability_rules (weekday, start_time, end_time, slot_minutes, is_active)
select weekday, '08:00'::time, '19:00'::time, 30, true
from generate_series(1, 5) as weekday
where not exists (select 1 from public.availability_rules);

insert into public.availability_rules (weekday, start_time, end_time, slot_minutes, is_active)
select 6, '08:00'::time, '13:00'::time, 30, true
where not exists (select 1 from public.availability_rules where weekday = 6);
