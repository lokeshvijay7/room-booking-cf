-- Function: Cancel unpaid bookings older than 10 minutes
CREATE OR REPLACE FUNCTION expire_unpaid_bookings()
RETURNS void AS $$
BEGIN
  UPDATE bookings
  SET status = 'cancelled'
  WHERE payment_status = 'pending'
  AND status = 'confirmed' -- technically 'confirmed' but waiting for payment
  AND created_at < NOW() - INTERVAL '10 minutes';
END;
$$ LANGUAGE plpgsql;
