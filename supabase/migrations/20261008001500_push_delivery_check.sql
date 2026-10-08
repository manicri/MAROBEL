-- Allow a signed-in person to verify delivery to their own registered devices.
alter table public.app_notifications
  drop constraint app_notifications_event_type_check;
alter table public.app_notifications
  add constraint app_notifications_event_type_check
  check (event_type in ('new_reservation', 'status_accepted', 'status_rejected', 'push_test'));

create or replace function public.send_test_push()
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  recipient uuid := (select auth.uid());
  notice_id uuid;
begin
  if recipient is null then
    raise exception 'Debes iniciar sesion para probar los avisos';
  end if;
  if not exists (select 1 from public.push_subscriptions where user_id = recipient) then
    raise exception 'Activa los avisos en este dispositivo primero';
  end if;
  if exists (
    select 1 from public.app_notifications
    where recipient_id = recipient and event_type = 'push_test'
      and created_at > now() - interval '30 seconds'
  ) then
    raise exception 'Espera 30 segundos antes de enviar otra prueba';
  end if;

  insert into public.app_notifications
    (recipient_id, event_type, title, body, target_path)
  values (
    recipient, 'push_test', 'Prueba de avisos Marobel',
    'Este dispositivo ya puede recibir avisos de nuevas reservas.',
    case when public.is_admin() then '/admin' else '/mis-citas' end
  ) returning id into notice_id;
  return notice_id;
end;
$$;
revoke all on function public.send_test_push() from public, anon;
grant execute on function public.send_test_push() to authenticated;
