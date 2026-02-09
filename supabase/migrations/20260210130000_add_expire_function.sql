-- Function: Cancel unpaid bookings older than 15 minutes (Matched user request)
CREATE OR REPLACE FUNCTION expire_unpaid_bookings()
RETURNS void AS $$
BEGIN
  -- Cancel bookings that are 'confirmed' but 'pending' payment after 15 minutes
  UPDATE bookings
  SET status = 'cancelled'
  WHERE payment_status = 'pending'
  AND status = 'confirmed'
  AND created_at < NOW() - INTERVAL '15 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
