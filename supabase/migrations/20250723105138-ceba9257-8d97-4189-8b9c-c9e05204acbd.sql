-- Create the admin user if it doesn't exist and set admin role
-- First, let's insert/update the profile with admin role
INSERT INTO public.profiles (id, username, full_name, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'bigwinner986', 'Admin User', 'admin')
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  username = COALESCE(EXCLUDED.username, profiles.username),
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  updated_at = now();