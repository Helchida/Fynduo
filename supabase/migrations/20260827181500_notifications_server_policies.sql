-- Firebase users never hold a Supabase database role. Only the verified Edge
-- Functions use the service-role key; all browser roles remain denied by RLS.
create policy "notifications_server_only"
on public.notifications
for all
to service_role
using (true)
with check (true);

create policy "push_subscriptions_server_only"
on public.push_subscriptions
for all
to service_role
using (true)
with check (true);

