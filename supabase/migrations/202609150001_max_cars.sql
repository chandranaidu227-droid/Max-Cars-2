begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  name text not null default 'Driver' check (char_length(name) between 1 and 100),
  phone text not null default '',
  city text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create function public.max_cars_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, name, phone, city)
  values (new.id, coalesce(new.email, ''), left(coalesce(nullif(new.raw_user_meta_data->>'name', ''), 'Driver'), 100), coalesce(new.raw_user_meta_data->>'phone', ''), coalesce(new.raw_user_meta_data->>'city', ''));
  return new;
end;
$$;
create trigger max_cars_create_profile after insert on auth.users for each row execute function public.max_cars_new_user();
-- Include accounts created before the application tables were installed.
insert into public.profiles (id, email, name)
select id, coalesce(email, ''), left(coalesce(nullif(raw_user_meta_data->>'name', ''), 'Driver'), 100) from auth.users
on conflict (id) do nothing;

create function public.max_cars_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;
revoke all on function public.max_cars_new_user() from public, anon, authenticated;
revoke all on function public.max_cars_is_admin() from public, anon;
grant execute on function public.max_cars_is_admin() to authenticated;

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  "catalogueId" text unique,
  slug text not null unique,
  brand text not null,
  model text not null,
  variant text not null default '',
  price numeric not null check (price >= 0),
  fuel text not null default '',
  body text not null default '',
  year integer,
  image text,
  active boolean not null default true,
  metadata jsonb not null default '{}',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create table public.favourites (
  id uuid primary key default gen_random_uuid(),
  "user" uuid not null default auth.uid() references auth.users(id) on delete cascade,
  "vehicleId" text not null check (char_length("vehicleId") > 0),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("user", "vehicleId")
);
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  "user" uuid not null default auth.uid() references auth.users(id) on delete cascade,
  "vehicleId" text not null,
  location text not null check (char_length(location) > 0),
  "appointmentAt" timestamptz not null,
  status text not null default 'requested' check (status in ('requested', 'confirmed', 'completed', 'cancelled')),
  notes text not null default '' check (char_length(notes) <= 1000),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  "user" uuid not null default auth.uid() references auth.users(id) on delete cascade,
  reference text not null unique default ('MAX-ORD-' || upper(replace(gen_random_uuid()::text, '-', ''))),
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) > 0),
  customer jsonb not null default '{}' check (jsonb_typeof(customer) = 'object'),
  fulfilment jsonb not null default '{}' check (jsonb_typeof(fulfilment) = 'object'),
  status text not null default 'dealer-verification-requested',
  payment jsonb not null default '{"mode":"test","collected":false,"amount":0}',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  "user" uuid not null default auth.uid() references auth.users(id) on delete cascade,
  registration text not null check (char_length(registration) > 0),
  brand text not null,
  model text not null,
  year integer,
  price numeric check (price >= 0),
  details jsonb not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'pending', 'verified', 'reserved', 'sold')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  "user" uuid not null default auth.uid() references auth.users(id) on delete cascade,
  reference text not null unique default ('MAX-SUP-' || upper(replace(gen_random_uuid()::text, '-', ''))),
  topic text not null check (char_length(topic) > 0),
  subject text not null check (char_length(subject) between 1 and 200),
  description text not null check (char_length(description) between 20 and 5000),
  "vehicleId" text,
  status text not null default 'open' check (status in ('open', 'in-progress', 'resolved', 'closed')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create function public.max_cars_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new."updatedAt" = now(); return new; end;
$$;
revoke all on function public.max_cars_updated_at() from public, anon, authenticated;

do $$ declare table_name text; begin
  foreach table_name in array array['profiles','vehicles','favourites','bookings','orders','listings','support_tickets'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from public, anon, authenticated', table_name);
    execute format('grant select on public.%I to authenticated', table_name);
    execute format('create trigger update_timestamp before update on public.%I for each row execute function public.max_cars_updated_at()', table_name);
  end loop;
  foreach table_name in array array['favourites','bookings','orders','listings','support_tickets'] loop
    execute format('create index on public.%I ("user")', table_name);
    execute format('create policy owner_read on public.%I for select to authenticated using ("user" = (select auth.uid()) or (select public.max_cars_is_admin()))', table_name);
    execute format('create policy owner_insert on public.%I for insert to authenticated with check ("user" = (select auth.uid()))', table_name);
  end loop;
end $$;

grant select on public.vehicles to anon;
grant insert, update on public.vehicles to authenticated;
create policy public_catalogue on public.vehicles for select to anon, authenticated using (active);
create policy admin_catalogue_read on public.vehicles for select to authenticated using ((select public.max_cars_is_admin()));
create policy admin_catalogue_insert on public.vehicles for insert to authenticated with check ((select public.max_cars_is_admin()));
create policy admin_catalogue_update on public.vehicles for update to authenticated using ((select public.max_cars_is_admin())) with check ((select public.max_cars_is_admin()));

create policy profile_read on public.profiles for select to authenticated using (id = (select auth.uid()) or (select public.max_cars_is_admin()));
create policy profile_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
grant update (name, phone, city) on public.profiles to authenticated;
-- role, user ownership, payment flags, and generated references cannot be written by customers.
grant insert ("user", "vehicleId") on public.favourites to authenticated;
grant delete on public.favourites to authenticated;
create policy favourite_delete on public.favourites for delete to authenticated using ("user" = (select auth.uid()));
grant insert ("user", "vehicleId", location, "appointmentAt", notes) on public.bookings to authenticated;
grant update (status, notes, "appointmentAt"), delete on public.bookings to authenticated;
create policy booking_update on public.bookings for update to authenticated using ("user" = (select auth.uid())) with check ("user" = (select auth.uid()) and status in ('requested', 'cancelled'));
create policy booking_delete on public.bookings for delete to authenticated using ("user" = (select auth.uid()));
grant insert ("user", items, customer, fulfilment) on public.orders to authenticated;
grant insert ("user", registration, brand, model, year, price, details) on public.listings to authenticated;
grant update (year, price, details, status), delete on public.listings to authenticated;
create policy listing_update on public.listings for update to authenticated using ("user" = (select auth.uid())) with check ("user" = (select auth.uid()) and status in ('draft', 'pending'));
create policy listing_delete on public.listings for delete to authenticated using ("user" = (select auth.uid()));
grant insert ("user", topic, subject, description, "vehicleId") on public.support_tickets to authenticated;

commit;
