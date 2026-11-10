-- Esquema de la Iglesia Espíritu Santo (Neon Postgres)
-- Los usuarios viven en neon_auth."user" (Neon Auth / Better Auth).

create table if not exists mensajes_contacto (
  id          bigint generated always as identity primary key,
  tipo        text not null,
  nombre      text not null check (char_length(nombre) between 1 and 120),
  email       text not null check (char_length(email) between 3 and 200),
  mensaje     text not null check (char_length(mensaje) between 1 and 5000),
  leido       boolean not null default false,
  creado_en   timestamptz not null default now()
);

create table if not exists foro_categorias (
  id          smallint generated always as identity primary key,
  slug        text not null unique,
  nombre      text not null,
  descripcion text not null default '',
  icono       text not null default 'MessageCircle',
  orden       smallint not null default 0
);

create table if not exists foro_temas (
  id            bigint generated always as identity primary key,
  categoria_id  smallint not null references foro_categorias(id),
  autor_id      uuid not null references neon_auth."user"(id) on delete cascade,
  titulo        text not null check (char_length(titulo) between 3 and 160),
  contenido     text not null check (char_length(contenido) between 1 and 10000),
  creado_en     timestamptz not null default now(),
  actividad_en  timestamptz not null default now()
);
create index if not exists foro_temas_categoria_idx on foro_temas (categoria_id, actividad_en desc);
create index if not exists foro_temas_actividad_idx on foro_temas (actividad_en desc);

create table if not exists foro_respuestas (
  id          bigint generated always as identity primary key,
  tema_id     bigint not null references foro_temas(id) on delete cascade,
  autor_id    uuid not null references neon_auth."user"(id) on delete cascade,
  contenido   text not null check (char_length(contenido) between 1 and 10000),
  creado_en   timestamptz not null default now()
);
create index if not exists foro_respuestas_tema_idx on foro_respuestas (tema_id, creado_en);

insert into foro_categorias (slug, nombre, descripcion, icono, orden) values
  ('oracion',     'Peticiones de oración', 'Comparte tus motivos y oremos unos por otros.', 'HandHeart', 1),
  ('testimonios', 'Testimonios',           'Cuenta lo que Dios ha hecho en tu vida.',      'Sparkles',  2),
  ('biblia',      'Estudio bíblico',       'Preguntas y reflexiones sobre la Palabra.',    'BookOpen',  3),
  ('comunidad',   'Comunidad',             'Avisos, ideas y conversación general.',        'Users',     4)
on conflict (slug) do nothing;

-- ── Roles y moderación ─────────────────────────────────────────────
-- Niveles: 1 = miembro, 2 = moderador, 3 = admin, 4 = superadmin.
-- Un usuario sin fila en perfiles se considera miembro (nivel 1).
create table if not exists perfiles (
  user_id          uuid primary key references neon_auth."user"(id) on delete cascade,
  nivel            smallint not null default 1 check (nivel between 1 and 4),
  suspendido_hasta timestamptz,
  bloqueado        boolean not null default false,
  actualizado_en   timestamptz not null default now()
);

alter table foro_temas
  add column if not exists fijado  boolean not null default false,
  add column if not exists cerrado boolean not null default false,
  add column if not exists oculto  boolean not null default false;
alter table foro_respuestas add column if not exists oculto boolean not null default false;

create table if not exists bitacora_moderacion (
  id            bigint generated always as identity primary key,
  actor_id      uuid references neon_auth."user"(id) on delete set null,
  accion        text not null,
  objetivo_tipo text not null,
  objetivo_id   text not null,
  detalle       text not null default '',
  creado_en     timestamptz not null default now()
);
create index if not exists bitacora_creado_idx on bitacora_moderacion (creado_en desc);

-- Primer superadmin (ejecutar a mano después de registrarse):
-- insert into perfiles (user_id, nivel)
--   select id, 4 from neon_auth."user" where email = 'TU_CORREO'
--   on conflict (user_id) do update set nivel = 4;

-- ── Idiomas ─────────────────────────────────────────────────────────
-- tipo guarda una clave: visita | oracion | servir | otro. idioma: es | en | ko.
alter table mensajes_contacto add column if not exists idioma text not null default 'es';

-- ── Contenido editable de la landing ───────────────────────────────
-- Textos: clave = ruta en el diccionario ("hero.etiqueta"), idioma = es/en/ko.
-- Fotos:  clave = "foto.<nombre>" ("foto.portada"), idioma = '*', valor = URL de Cloudinary.
-- Si no hay fila, se usa el texto/foto por defecto del código.
create table if not exists contenido_pagina (
  clave           text not null check (char_length(clave) between 1 and 100),
  idioma          text not null check (idioma in ('es','en','ko','*')),
  valor           text not null check (char_length(valor) between 1 and 5000),
  actualizado_por uuid references neon_auth."user"(id) on delete set null,
  actualizado_en  timestamptz not null default now(),
  primary key (clave, idioma)
);

-- ── Eventos (calendario de la landing, se cargan desde el panel) ───
-- textos: { "es": { "titulo", "descripcion", "lugar" }, "en": {...}, "ko": {...} }
-- Solo "es.titulo" es obligatorio; los demás idiomas usan el español si están vacíos.
create table if not exists eventos (
  id             bigint generated always as identity primary key,
  fecha          date not null,
  hora           text check (hora ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  categoria      text not null default 'otro' check (categoria in ('adoracion','celebracion','jovenes','familia','otro')),
  textos         jsonb not null,
  creado_por     uuid references neon_auth."user"(id) on delete set null,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create index if not exists eventos_fecha_idx on eventos (fecha);
