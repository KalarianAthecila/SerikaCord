-- TTS custom voices (admin-configured). Apply with `bunx drizzle-kit push`
-- or run this file directly against the DB.
CREATE TABLE IF NOT EXISTS "tts_voices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "provider" text NOT NULL,
  "reference_id" text NOT NULL,
  "description" text,
  "enabled" boolean DEFAULT true,
  "is_default" boolean DEFAULT false,
  "created_by" uuid,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "tts_voices_name_idx" ON "tts_voices" ("name");
