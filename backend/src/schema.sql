-- AJA · esquema do banco (PostgreSQL)

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'morador' check (role in ('morador', 'voluntario', 'admin')),
  profession text,
  bio text,
  tags text[] not null default '{}',
  verified boolean not null default false,
  links jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null check (category in ('piso', 'obstaculo', 'travessia', 'sinalizacao', 'comunicacao', 'calcada', 'outro')),
  audiences text[] not null default '{}',
  address text not null,
  neighborhood text not null default 'Parque Doroteia',
  summary text not null default '',
  proposal text not null default '',
  photo_description text not null default '',
  stage int not null default 0 check (stage between 0 and 6),
  protocol_number text,
  protocol_org text,
  protocol_opened_at date,
  protocol_status text,
  next_step text,
  dossier_number text,
  dossier_at date,
  dossier_sent_at date,
  dossier_version int not null default 0,
  before_description text,
  after_description text,
  before_date text,
  after_date text,
  concept_author uuid references users(id),
  concept_description text,
  seed_supports int not null default 0,
  seed_passes int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete set null,
  user_id uuid references users(id) on delete set null,
  category text not null,
  format text not null check (format in ('texto', 'audio', 'foto', 'libras')),
  body text not null default '',
  caption text not null default '',
  media_key text,
  media_type text,
  address text not null default '',
  passes_by boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists supports (
  topic_id uuid not null references topics(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  passes_by boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (topic_id, user_id)
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  author_name text not null,
  author_badge text,
  parent_id uuid references comments(id) on delete cascade,
  kind text not null default 'texto' check (kind in ('texto', 'audio', 'libras')),
  body text not null default '',
  media_label text,
  seed_helpful int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists comment_helpful (
  comment_id uuid not null references comments(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  primary key (comment_id, user_id)
);

create table if not exists refs (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics(id) on delete cascade,
  kind text not null check (kind in ('dados', 'norma', 'lei', 'estudo')),
  title text not null,
  source text not null,
  url text,
  why text not null default '',
  checked_by text,
  status text not null default 'conferida' check (status in ('conferida', 'sugerida')),
  created_at timestamptz not null default now()
);

create table if not exists timeline (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics(id) on delete cascade,
  happened_on date not null,
  title text not null,
  body text not null default '',
  official_quote text,
  link text
);

create table if not exists pendencies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics(id) on delete cascade,
  body text not null,
  volunteers int not null default 0,
  open boolean not null default true
);

create table if not exists ratings (
  topic_id uuid not null references topics(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  created_at timestamptz not null default now()
);

create table if not exists verifications (
  topic_id uuid not null references topics(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  still_ok boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  topic_id uuid references topics(id) on delete set null,
  kind text not null,
  title text not null,
  body text not null default '',
  happened_on date not null default current_date
);

create table if not exists questions (
  id serial primary key,
  context text not null,
  question text not null,
  answer text not null,
  sort int not null default 0
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  topic_id uuid references topics(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create index if not exists reports_topic_idx on reports(topic_id);
create index if not exists comments_topic_idx on comments(topic_id);
create index if not exists supports_user_idx on supports(user_id);
