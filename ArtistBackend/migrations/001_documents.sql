-- Documents table for artist media (associate-style path storage)
CREATE TABLE IF NOT EXISTS documents (
  document_id   SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  artist_id     INTEGER REFERENCES artists(artist_id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  file_path     TEXT NOT NULL,
  mime_type     VARCHAR(100),
  file_size     INTEGER DEFAULT 0,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_documents_artist_id ON documents(artist_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
