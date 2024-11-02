-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Itineraries table
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city TEXT NOT NULL,
  hotel TEXT NOT NULL,
  arrival_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  departure_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  total_activities_cost TEXT NOT NULL,
  total_travel_cost TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Days table
CREATE TABLE itinerary_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(itinerary_id, day_number)
);

-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_id UUID NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  cost TEXT NOT NULL,
  recommended_time TEXT,
  location_link TEXT NOT NULL,
  rating TEXT,
  category TEXT,
  must_try_food TEXT,
  travel_time TEXT NOT NULL,
  travel_cost TEXT NOT NULL,
  travel_link TEXT NOT NULL,
  activity_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(day_id, activity_order)
);

-- Enable Row Level Security (RLS)
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public itineraries are viewable by everyone" ON itineraries;
DROP POLICY IF EXISTS "Public days are viewable by everyone" ON itinerary_days;
DROP POLICY IF EXISTS "Public activities are viewable by everyone" ON activities;
DROP POLICY IF EXISTS "Anyone can insert itineraries" ON itineraries;
DROP POLICY IF EXISTS "Anyone can insert days" ON itinerary_days;
DROP POLICY IF EXISTS "Anyone can insert activities" ON activities;

-- Create updated policies
CREATE POLICY "Public itineraries are viewable by everyone" 
ON itineraries FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert itineraries" 
ON itineraries FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public days are viewable by everyone" 
ON itinerary_days FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert days" 
ON itinerary_days FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public activities are viewable by everyone" 
ON activities FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert activities" 
ON activities FOR INSERT 
WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_itineraries_city ON itineraries(city);
CREATE INDEX idx_itinerary_days_itinerary_id ON itinerary_days(itinerary_id);
CREATE INDEX idx_activities_day_id ON activities(day_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at
CREATE TRIGGER update_itineraries_updated_at
    BEFORE UPDATE ON itineraries
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();