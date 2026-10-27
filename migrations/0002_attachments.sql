-- Small downloadable attachments are stored in D1, never extracted or virus-scanned.
-- The mutation nonce gates every file operation to the successful post CAS in one batch.
ALTER TABLE posts ADD COLUMN attachment_mutation_token TEXT;
CREATE TABLE attachments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 180 AND instr(name, '/') = 0 AND instr(name, char(92)) = 0),
  name_key TEXT NOT NULL,
  size INTEGER NOT NULL CHECK (size BETWEEN 1 AND 1048576),
  mime_type TEXT NOT NULL CHECK (mime_type IN ('application/zip', 'application/pdf', 'text/markdown; charset=utf-8', 'text/plain; charset=utf-8', 'application/json; charset=utf-8')),
  sha256 TEXT NOT NULL CHECK (length(sha256) = 64 AND sha256 NOT GLOB '*[^a-f0-9]*'),
  bytes BLOB NOT NULL CHECK (typeof(bytes) = 'blob' AND length(bytes) = size),
  UNIQUE (post_id, name_key)
);
CREATE INDEX attachments_post ON attachments(post_id, id);
CREATE TRIGGER attachments_insert_guard BEFORE INSERT ON attachments
BEGIN
  SELECT CASE WHEN (SELECT status FROM posts WHERE id = NEW.post_id) <> 'pending' THEN RAISE(ABORT, 'attachment_immutable') END;
  SELECT CASE WHEN (SELECT count(*) FROM attachments WHERE post_id = NEW.post_id) >= 4 THEN RAISE(ABORT, 'attachment_limit') END;
END;
CREATE TRIGGER attachments_update_guard BEFORE UPDATE ON attachments
BEGIN SELECT RAISE(ABORT, 'attachment_immutable'); END;
CREATE TRIGGER attachments_delete_guard BEFORE DELETE ON attachments
WHEN (SELECT status FROM posts WHERE id = OLD.post_id) = 'published'
BEGIN SELECT RAISE(ABORT, 'attachment_immutable'); END;
