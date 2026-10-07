-- Private appointment notifications and per-device Web Push subscriptions.
create extension if not exists pg_net with schema extensions;
create schema if not exists private;

-- Only administrators decide the outcome of a reservation. Customers can read
-- their own appointments; public availability is exposed separately below.
drop policy if exists "Enable read access for all users" on public.citas;
drop policy if exists "Permitir actualizar estado de citas" on public.citas;
drop policy if exists "Permitir cancelar citas." on public.citas;
drop policy if exists "Enable insert for authenticated users only" on public.citas;
drop policy if exists "Admins consultar citas" on public.citas;
drop policy if exists "Admins actualizar citas" on public.citas;
drop policy if exists "Admins eliminar citas" on public.citas;
create policy "Admins consultar citas" on public.citas
  for select to authenticated using (public.is_admin());
create policy "Admins actualizar citas" on public.citas
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Admins eliminar citas" on public.citas
  for delete to authenticated using (public.is_admin());
create policy "Clientes consultar citas propias" on public.citas
  for select to authenticated using ((select auth.uid()) = "Usuario_id");
create policy "Clientes solicitar citas propias" on public.citas
  for insert to authenticated
  with check ((select auth.uid()) = "Usuario_id" and "Estado" = 'pendiente');

create or replace function public.get_booked_hours(p_date date)
returns table (hora time without time zone)
language sql stable security definer set search_path = ''
as $$
  select distinct c.hora from public.citas c
  where c.fecha = p_date and c."Estado" = 'aceptada' and c.hora is not null;
$$;
revoke all on function public.get_booked_hours(date) from public;
grant execute on function public.get_booked_hours(date) to anon, authenticated;

create table if not exists public.app_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  cita_id bigint references public.citas(cita) on delete set null,
  event_type text not null check (event_type in ('new_reservation', 'status_accepted', 'status_rejected')),
  title text not null,
  body text not null,
  target_path text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists app_notifications_recipient_created_idx
  on public.app_notifications (recipient_id, created_at desc);
create index if not exists app_notifications_cita_idx
  on public.app_notifications (cita_id);
alter table public.app_notifications enable row level security;
revoke all on public.app_notifications from anon, authenticated;
grant select, update (read_at) on public.app_notifications to authenticated;
create policy "Leer avisos propios" on public.app_notifications
  for select to authenticated using ((select auth.uid()) = recipient_id);
create policy "Marcar avisos propios" on public.app_notifications
  for update to authenticated
  using ((select auth.uid()) = recipient_id)
  with check ((select auth.uid()) = recipient_id);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon, authenticated;
grant select, insert, update, delete on public.push_subscriptions to authenticated;
create policy "Administrar dispositivos propios" on public.push_subscriptions
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function private.create_appointment_notifications()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new."Usuario_id" is not null and coalesce(new."Nombre_cliente", '') <> 'BLOQUEO ADMINISTRATIVO' then
      insert into public.app_notifications
        (recipient_id, cita_id, event_type, title, body, target_path)
      select admin_users.user_id, new.cita, 'new_reservation', 'Nueva reserva',
        concat(coalesce(new."Nombre_cliente", 'Cliente'), ' solicita ',
               coalesce(new."Servicio", 'un servicio'), ' para el ',
               coalesce(new.fecha::text, 'día pendiente'), ' a las ',
               coalesce(new.hora::text, 'hora pendiente'), '.'), '/admin'
      from (
        select user_id from public.admins
        union
        select id from auth.users where lower(email) = 'crisdelrobbys@gmail.com'
      ) as admin_users;
    end if;
  elsif new."Estado" is distinct from old."Estado" then
    update public.app_notifications
      set read_at = now()
      where cita_id = new.cita and event_type = 'new_reservation' and read_at is null;
    if new."Estado" in ('aceptada', 'rechazada') and new."Usuario_id" is not null then
      insert into public.app_notifications
        (recipient_id, cita_id, event_type, title, body, target_path)
      values (
        new."Usuario_id", new.cita,
        case when new."Estado" = 'aceptada' then 'status_accepted' else 'status_rejected' end,
        case when new."Estado" = 'aceptada' then 'Tu cita fue aceptada' else 'Tu cita fue rechazada' end,
        concat('Tu reserva de ', coalesce(new."Servicio", 'servicios'), ' para el ',
               coalesce(new.fecha::text, 'día pendiente'), ' a las ',
               coalesce(new.hora::text, 'hora pendiente'), ' fue ', new."Estado", '.'),
        '/mis-citas'
      );
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.create_appointment_notifications() from public;
drop trigger if exists appointment_notifications on public.citas;
create trigger appointment_notifications
  after insert or update of "Estado" on public.citas
  for each row execute function private.create_appointment_notifications();

-- The Edge Function reads these Vault values through a service-role-only RPC.
create or replace function public.get_web_push_config()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'public_key', (select decrypted_secret from vault.decrypted_secrets where name = 'marobel_vapid_public' limit 1),
    'private_key', (select decrypted_secret from vault.decrypted_secrets where name = 'marobel_vapid_private' limit 1),
    'webhook_secret', (select decrypted_secret from vault.decrypted_secrets where name = 'marobel_push_webhook_secret' limit 1)
  );
$$;
revoke all on function public.get_web_push_config() from public, anon, authenticated;
grant execute on function public.get_web_push_config() to service_role;

create or replace function private.queue_web_push()
returns trigger language plpgsql security definer set search_path = '' as $$
declare webhook_secret text;
begin
  select decrypted_secret into webhook_secret
    from vault.decrypted_secrets where name = 'marobel_push_webhook_secret' limit 1;
  if webhook_secret is null then return new; end if;
  begin
    perform net.http_post(
      url => 'https://urrbofvaftsfeiasrceo.supabase.co/functions/v1/send-web-push',
      headers => jsonb_build_object('Content-Type', 'application/json',
                                    'x-webhook-secret', webhook_secret),
      body => jsonb_build_object('notification_id', new.id),
      timeout_milliseconds => 5000
    );
  exception when others then
    raise warning 'Could not queue web push for notification %: %', new.id, sqlerrm;
  end;
  return new;
end;
$$;
revoke all on function private.queue_web_push() from public;
drop trigger if exists queue_web_push on public.app_notifications;
create trigger queue_web_push
  after insert on public.app_notifications
  for each row execute function private.queue_web_push();

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public'
      and tablename = 'app_notifications'
  ) then
    alter publication supabase_realtime add table public.app_notifications;
  end if;
end $$;
