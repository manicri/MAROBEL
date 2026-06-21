-- Ejecuta este archivo en Supabase SQL Editor si ya tienes los servicios cargados.
-- Sincroniza los cambios nuevos de manicura/pedicura sin borrar tus citas ni reservas.

alter table public.servicios add column if not exists precio_desde boolean not null default false;
alter table public.servicios add column if not exists orden integer;
alter table public.servicios add column if not exists subcategoria text;

create unique index if not exists servicios_nombre_categoria_unique
on public.servicios (nombre, categoria);

update public.servicios
set
  nombre = 'Manicura en acrílico',
  descripcion = 'Extensión en acrílico; el valor final depende del tamaño.',
  precio = 25,
  precio_desde = true,
  categoria = 'Manicura y pedicura',
  subcategoria = 'Manicura'
where nombre in ('Manicura técnica en acrílico', 'Manicura en acrílico');

update public.servicios
set
  nombre = 'Pedicura básica',
  descripcion = 'Limpieza técnica profunda de uñas y cutículas.',
  precio = 10,
  precio_desde = false,
  categoria = 'Manicura y pedicura',
  subcategoria = 'Pedicura'
where nombre in ('Pedicura rusa, solo limpieza', 'Pedicura básica');

insert into public.servicios (
  nombre,
  descripcion,
  precio,
  precio_desde,
  duracion,
  categoria,
  subcategoria,
  orden
)
values (
  'Pedicura Spa + Semipermanente',
  'Pedicura spa con esmaltado semipermanente.',
  25,
  false,
  null,
  'Manicura y pedicura',
  'Pedicura',
  12
)
on conflict (nombre, categoria) do update
set
  descripcion = excluded.descripcion,
  precio = excluded.precio,
  precio_desde = excluded.precio_desde,
  duracion = excluded.duracion,
  subcategoria = excluded.subcategoria,
  orden = excluded.orden;

-- Mantiene el orden correcto dentro del grupo de pedicura.
update public.servicios set orden = 8 where nombre = 'Pedicura spa' and categoria = 'Manicura y pedicura';
update public.servicios set orden = 9 where nombre = 'Pedicura básica' and categoria = 'Manicura y pedicura';
update public.servicios set orden = 10 where nombre = 'Pedicura tradicional' and categoria = 'Manicura y pedicura';
update public.servicios set orden = 11 where nombre = 'Pedicura semipermanente' and categoria = 'Manicura y pedicura';
update public.servicios set orden = 12 where nombre = 'Pedicura Spa + Semipermanente' and categoria = 'Manicura y pedicura';
update public.servicios set orden = 13 where nombre = 'Pedicura con Rubber Base' and categoria = 'Manicura y pedicura';
update public.servicios set orden = 14 where nombre = 'Pedicura con gel de construcción' and categoria = 'Manicura y pedicura';
