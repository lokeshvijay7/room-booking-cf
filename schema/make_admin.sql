-- 1. Sign up a new user in the app first.
-- 2. Replace 'YOUR_EMAIL_HERE' with the email you signed up with.
-- 3. Run this script in the Supabase SQL Editor.

UPDATE profiles
SET role = 'admin'
FROM auth.users
WHERE profiles.id = auth.users.id
AND auth.users.email = 'YOUR_EMAIL_HERE';

-- Verify the change
SELECT * FROM profiles 
JOIN auth.users ON profiles.id = auth.users.id
WHERE auth.users.email = 'YOUR_EMAIL_HERE';
