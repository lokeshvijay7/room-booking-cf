-- Add Location columns to rooms table
ALTER TABLE rooms 
ADD COLUMN latitude FLOAT DEFAULT 12.9716, -- Default to Bangalore
ADD COLUMN longitude FLOAT DEFAULT 77.5946;

-- Create Reviews table (Bonus, if needed later, but focusing on Map/QR)
-- For now just the map columns.
