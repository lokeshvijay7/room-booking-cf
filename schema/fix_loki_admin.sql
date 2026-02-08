-- Run this EXACT script in the Supabase SQL Editor

-- 1. Force the user to be an admin in the public.profiles table
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'loki7cr@gmail.com'
);

-- 2. Verify the result (look at the 'role' column in the output)
SELECT * FROM public.profiles 
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'loki7cr@gmail.com'
);
