-- Run this in Supabase SQL Editor to add the payment processing function

CREATE OR REPLACE FUNCTION process_payment(p_booking_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE bookings
  SET payment_status = 'paid'
  WHERE id = p_booking_id
  AND auth.uid() = user_id; -- Ensure user owns the booking
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
