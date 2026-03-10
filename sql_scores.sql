-- Table scores pour le classement
-- Colle ce code dans Supabase > SQL Editor > Run

CREATE TABLE IF NOT EXISTS scores (
  id         SERIAL PRIMARY KEY,
  pseudo     TEXT NOT NULL UNIQUE,
  score      INTEGER NOT NULL DEFAULT 0,
  niveau     INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_score ON scores(score DESC);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Lecture publique du classement
CREATE POLICY "lecture classement" ON scores
  FOR SELECT USING (true);

-- Écriture pour tous (les joueurs peuvent sauvegarder leur score)
CREATE POLICY "ecriture score" ON scores
  FOR INSERT WITH CHECK (true);

CREATE POLICY "maj score" ON scores
  FOR UPDATE USING (true);
