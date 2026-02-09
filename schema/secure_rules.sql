-- REALWORLD SECURITY & LOGIC ENFORCEMENT

-- 1. PAYMENT SECURITY
-- Goal: Validated Payment Status. 
-- Users should NEVER be able to update 'payment_status' directly.
-- Only the Edge Function (Service Role) can do this.

-- Revoke general UPDATE access
REVOKE UPDATE ON bookings FROM authenticated;
REVOKE UPDATE ON bookings FROM public;

-- Grant UPDATE only on non-critical columns
GRANT UPDATE (status, start_time, end_time) ON bookings TO authenticated;

-- Ensure users can still VIEW their own bookings
DROP POLICY IF EXISTS "User view own bookings" ON bookings;
CREATE POLICY "User view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);

-- Ensure users can UPDATE their own bookings (restricted columns only via GRANT)
DROP POLICY IF EXISTS "User update own bookings" ON bookings;
CREATE POLICY "User update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- 2. INSERT SECURITY
-- Goal: Prevent unauthorized inputs.
REVOKE INSERT ON bookings FROM authenticated;
-- Allow everything EXCEPT 'payment_status' (defaults to 'pending')
GRANT INSERT (room_id, user_id, start_time, end_time, total_price, status) ON bookings TO authenticated;


-- 3. LOGIC SECURITY: Availability Check
-- Goal: Prevent Double Bookings.
-- Issue: Start RLS hides other users' bookings, so `check_availability` sees "no conflicts".
-- Fix: SECURITY DEFINER (Runs as Admin/Owner to see all rows).

CREATE OR REPLACE FUNCTION check_availability(
  p_room_id UUID,
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE
) RETURNS BOOLEAN AS $$
DECLARE
  overlap_count INTEGER;
BEGIN
  -- We need to check ALL bookings, not just the user's.
  SELECT COUNT(*)
  INTO overlap_count
  FROM bookings
  WHERE room_id = p_room_id
    AND status = 'confirmed'
    AND (
      (start_time BETWEEN p_start_time AND p_end_time)
      OR (end_time BETWEEN p_start_time AND p_end_time)
      OR (p_start_time BETWEEN start_time AND end_time)
    )
    AND NOT (start_time >= p_end_time OR end_time <= p_start_time);
  
  RETURN overlap_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. LOGIC SECURITY: Double Booking Trigger
-- Goal: Absolute Prevention.
-- Fix: SECURITY DEFINER.

CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
DECLARE
  conflict BOOLEAN;
BEGIN
  -- Check for overlap excluding the current booking (for updates)
  SELECT EXISTS (
    SELECT 1 FROM bookings
    WHERE room_id = NEW.room_id
      AND status = 'confirmed'
      AND id != NEW.id
      AND tstzrange(start_time, end_time) && tstzrange(NEW.start_time, NEW.end_time)
  ) INTO conflict;

  IF conflict THEN
    RAISE EXCEPTION 'Double booking detected for room % at this time.', NEW.room_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
