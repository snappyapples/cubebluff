-- Cube Bluff Database Schema
-- Run this in your Supabase SQL editor
-- NOTE: Uses cb_rooms table to avoid collision with Bank It's rooms table

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if it exists (for clean setup)
DROP TABLE IF EXISTS cb_rooms;

-- Cube Bluff Rooms table (single table approach - players embedded in game_state)
CREATE TABLE cb_rooms (
  code TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{"startingTokens": 5}',
  game_state JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update updated_at timestamp (reuse existing if present)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS cb_rooms_updated_at ON cb_rooms;
CREATE TRIGGER cb_rooms_updated_at
  BEFORE UPDATE ON cb_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE cb_rooms ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rooms (for joining)
DROP POLICY IF EXISTS "CB Rooms are viewable by everyone" ON cb_rooms;
CREATE POLICY "CB Rooms are viewable by everyone"
  ON cb_rooms FOR SELECT
  USING (true);

-- Allow anyone to insert rooms (for creating)
DROP POLICY IF EXISTS "Anyone can create CB rooms" ON cb_rooms;
CREATE POLICY "Anyone can create CB rooms"
  ON cb_rooms FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update rooms (game state changes)
DROP POLICY IF EXISTS "Anyone can update CB rooms" ON cb_rooms;
CREATE POLICY "Anyone can update CB rooms"
  ON cb_rooms FOR UPDATE
  USING (true);

-- Allow anyone to delete rooms
DROP POLICY IF EXISTS "Anyone can delete CB rooms" ON cb_rooms;
CREATE POLICY "Anyone can delete CB rooms"
  ON cb_rooms FOR DELETE
  USING (true);

-- Enable Realtime for cb_rooms table
ALTER PUBLICATION supabase_realtime ADD TABLE cb_rooms;

-- Optional: Function to clean up old rooms (run periodically)
-- DELETE FROM cb_rooms WHERE created_at < NOW() - INTERVAL '24 hours';
