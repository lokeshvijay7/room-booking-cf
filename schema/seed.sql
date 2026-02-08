-- Insert Sample Rooms
-- Run 'DELETE FROM rooms;' before running this to clear old data.

INSERT INTO rooms (name, description, capacity, price_per_hour, image_url)
VALUES 
(
  'Boardroom A', 
  'Large meeting room with a big table and comfortable chairs. Includes a projector and screen.', 
  12, 
  1500.00, 
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200'
),
(
  'Creative Room', 
  'Bright room with whiteboards, perfect for brainstorming and team discussions.', 
  8, 
  800.00, 
  'https://images.unsplash.com/photo-1571624436279-b272aff752b5?auto=format&fit=crop&q=80&w=1200'
),
(
  'Private Cabin', 
  'Small soundproof room for one person. Good for calls or focused work.', 
  1, 
  300.00, 
  'https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&q=80&w=1200'
),
(
  'Conference Hall', 
  'Spacious hall for seminars and workshops. Seats up to 50 people.', 
  50, 
  5000.00, 
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1200'
),
(
  'Meeting Area', 
  'Casual space with sofas for informal meetings and coffee breaks.', 
  5, 
  600.00, 
  'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&q=80&w=1200'
),
(
  'Glass Meeting Room', 
  'Modern glass-walled room with a nice view and good lighting.', 
  6, 
  900.00, 
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1200'
);
