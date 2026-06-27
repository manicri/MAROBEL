-- Opcional: permite guardar bloqueos de dia completo con hora NULL.
-- El codigo actual ya usa 00:00 para evitar el error, pero este ajuste deja la tabla mas flexible.

alter table public.bloqueos
alter column hora drop not null;
