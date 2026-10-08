-- The owner account alone may upload or replace catalog photos. Other full
-- administrators may continue managing service names, prices and descriptions.
create or replace function private.is_service_image_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users as account
    where account.id = (select auth.uid())
      and lower(account.email) = 'crisdelrobbys@gmail.com'
      and public.can_manage_services()
  );
$$;

revoke all on function private.is_service_image_owner() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_service_image_owner() to authenticated;

create or replace function private.restrict_service_image_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('postgres', 'service_role') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.imagen_url is not null and not private.is_service_image_owner() then
      raise exception 'Solo la cuenta propietaria puede cambiar imagenes de servicios';
    end if;
  elsif new.imagen_url is distinct from old.imagen_url
    and not private.is_service_image_owner() then
    raise exception 'Solo la cuenta propietaria puede cambiar imagenes de servicios';
  end if;

  return new;
end;
$$;

drop trigger if exists restrict_service_image_changes on public.servicios;
create trigger restrict_service_image_changes
before insert or update of imagen_url on public.servicios
for each row execute function private.restrict_service_image_changes();

drop policy if exists "Admin Insert" on storage.objects;
create policy "Admin Insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'servicios-images' and (select private.is_service_image_owner()));

drop policy if exists "Admin Update" on storage.objects;
create policy "Admin Update" on storage.objects
for update to authenticated
using (bucket_id = 'servicios-images' and (select private.is_service_image_owner()))
with check (bucket_id = 'servicios-images' and (select private.is_service_image_owner()));

drop policy if exists "Admin Delete" on storage.objects;
create policy "Admin Delete" on storage.objects
for delete to authenticated
using (bucket_id = 'servicios-images' and (select private.is_service_image_owner()));
