-- TTS sound triggers (admin-configured). Apply with `bunx drizzle-kit push`
-- (which diffs the schema automatically) or run this file directly against the DB.
CREATE TABLE IF NOT EXISTS "tts_sounds" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "trigger_word" text NOT NULL,
  "path" text NOT NULL,
  "label" text,
  "enabled" boolean DEFAULT true,
  "created_by" uuid,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "tts_sounds_trigger_word_idx" ON "tts_sounds" ("trigger_word");

-- Seed the existing /public/tts-sounds meow files as a "meow" trigger group.
INSERT INTO "tts_sounds" ("trigger_word", "path", "label") VALUES
  ('meow', '/tts-sounds/meow1.mp3', 'Meow #1'),
  ('meow', '/tts-sounds/meow2.mp3', 'Meow #2'),
  ('meow', '/tts-sounds/meow3.mp3', 'Meow #3')
ON CONFLICT DO NOTHING;
