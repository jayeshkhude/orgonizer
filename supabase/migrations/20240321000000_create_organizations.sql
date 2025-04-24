-- Create organizations table
create table if not exists public.organizations (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  files jsonb not null,
  summary text not null
);

-- Enable Row Level Security
alter table public.organizations enable row level security;

-- Create policy to allow users to only see their own organizations
create policy "Users can view their own organizations"
  on public.organizations for select
  using (auth.uid() = user_id);

-- Create policy to allow users to insert their own organizations
create policy "Users can insert their own organizations"
  on public.organizations for insert
  with check (auth.uid() = user_id);

-- Create policy to allow users to delete their own organizations
create policy "Users can delete their own organizations"
  on public.organizations for delete
  using (auth.uid() = user_id);

-- Grant necessary permissions
grant select, insert, delete on public.organizations to authenticated; 