-- Fix 400 Error: Bookings table needs to reference public.profiles to allow joining data
-- This script changes the foreign key from auth.users to public.profiles

BEGIN;

-- 1. Drop the existing constraint (name might vary, so we drop by column or try standard name)
-- Note: Standard naming is often bookings_user_id_fkey
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;

-- 2. Add the new constraint referencing profiles
ALTER TABLE bookings
ADD CONSTRAINT bookings_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

COMMIT;

-- Verification
-- Try to select with the join (this is what the app tries to do)
SELECT bookings.id, profiles.full_name
FROM bookings
JOIN profiles ON bookings.user_id = profiles.id
LIMIT 5;
