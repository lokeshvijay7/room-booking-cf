-- Create tables
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL DEFAULT 1,
  price_per_hour NUMERIC NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT ValidBookingTime CHECK (end_time > start_time)
);

-- RLS Policies
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Rooms: Public view, Admin modify
CREATE POLICY "Public rooms view" ON rooms FOR SELECT USING (true);
CREATE POLICY "Admin rooms modify" ON rooms FOR ALL USING (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Profiles: Public view (or auth only), User modify own
CREATE POLICY "Public profiles view" ON profiles FOR SELECT USING (true);
CREATE POLICY "User modify own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Bookings: User view own, Admin view all
CREATE POLICY "User view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin view all bookings" ON bookings FOR SELECT USING (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
CREATE POLICY "User create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RPC Function: Check Availability
CREATE OR REPLACE FUNCTION check_availability(
  p_room_id UUID,
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE
) RETURNS BOOLEAN AS $$
DECLARE
  overlap_count INTEGER;
BEGIN
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
$$ LANGUAGE plpgsql;

-- Trigger: Prevent Double Booking
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_booking_insert
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION prevent_double_booking();

-- Trigger: Handle New User
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
-- Insert Sample Rooms
INSERT INTO rooms (name, description, capacity, price_per_hour, image_url)
VALUES 
(
  'The Executive Suite', 
  'A premium conference room equipped with state-of-the-art video conferencing tools, leather seating, and a panoramic city view. Perfect for board meetings and high-stakes presentations.', 
  12, 
  150.00, 
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000'
),
(
  'Creative Brainstorm Lab', 
  'A vibrant, open space designed to foster creativity. Features whiteboard walls, bean bags, standing desks, and ample natural light.', 
  8, 
  80.00, 
  'https://images.unsplash.com/photo-1517502884422-41e157d258b5?auto=format&fit=crop&q=80&w=1000'
),
(
  'Quiet Focus Pod', 
  'A soundproof pod for individuals or small teams needing absolute concentration. High-speed private wifi and ergonomic furniture included.', 
  2, 
  40.00, 
  'https://images.unsplash.com/photo-1587216465219-021b1e2a8cc3?auto=format&fit=crop&q=80&w=1000'
),
(
  'The Grand Hall', 
  'Spacious venue for workshops and seminars. Includes a projector, stage, and flexible seating arrangements for up to 50 people.', 
  50, 
  300.00, 
  'https://images.unsplash.com/photo-1544991185-13e3c0041e56?auto=format&fit=crop&q=80&w=1000'
),
(
  'Tech Huddle Room', 
  'Compact room optimized for sprint reviews and daily standups. Dual monitors and a dedicated scrum board available.', 
  5, 
  60.00, 
  'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=1000'
),
(
  'Garden Meeting Spot', 
  'An semi-outdoor space surrounded by greenery. Fresh air and a relaxed atmosphere for casual meetings or interviews.', 
  4, 
  55.00, 
  'https://images.unsplash.com/photo-1664575602554-2087b04935a5?auto=format&fit=crop&q=80&w=1000'
);

-- Note: User creation handles profiles automatically via trigger.
-- To make a user an admin, run this after they sign up:
-- UPDATE profiles SET role = 'admin' WHERE id = 'USER_UUID_HERE';

