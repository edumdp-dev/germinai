PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'member', 'visitor')),
  created_at TEXT NOT NULL,
  CHECK (email = lower(email))
);

CREATE TRIGGER users_keep_last_superadmin BEFORE UPDATE OF role ON users
WHEN OLD.role = 'superadmin' AND NEW.role <> 'superadmin'
  AND (SELECT count(*) FROM users WHERE role = 'superadmin') <= 1
BEGIN SELECT RAISE(ABORT, 'last_superadmin'); END;

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE INDEX sessions_user ON sessions(user_id);

CREATE TABLE auth_challenges (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  code_digest TEXT NOT NULL,
  browser_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
  consumption_token TEXT UNIQUE,
  created_at INTEGER NOT NULL
);
CREATE INDEX auth_challenges_expiry ON auth_challenges(expires_at);
CREATE INDEX auth_challenges_email ON auth_challenges(email);

CREATE TABLE auth_cooldowns (
  email_hash TEXT PRIMARY KEY,
  requested_at INTEGER NOT NULL
);
CREATE INDEX auth_cooldowns_age ON auth_cooldowns(requested_at);
CREATE TABLE auth_quotas (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL CHECK (count > 0),
  expires_at INTEGER NOT NULL
);
CREATE INDEX auth_quotas_expiry ON auth_quotas(expires_at);

CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE COLLATE NOCASE CHECK (
    length(slug) BETWEEN 1 AND 100 AND slug = lower(slug)
    AND slug NOT GLOB '*[^a-z0-9-]*' AND slug NOT LIKE '-%' AND slug NOT LIKE '%-'
    AND slug NOT LIKE '%--%'
    AND slug NOT IN ('lancamento-ohmypi', 'lancamento-biblioteca-alexandria')
  ),
  locale TEXT NOT NULL CHECK (locale IN ('pt', 'en')),
  author_id TEXT NOT NULL REFERENCES users(id),
  author_name TEXT NOT NULL,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 180),
  excerpt TEXT NOT NULL CHECK (length(excerpt) BETWEEN 1 AND 500),
  category TEXT NOT NULL CHECK (length(category) BETWEEN 1 AND 60),
  sections TEXT NOT NULL CHECK (json_valid(sections) AND json_type(sections) = 'array'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
  review_note TEXT,
  reviewer_id TEXT REFERENCES users(id),
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision > 0),
  CHECK ((status = 'published' AND published_at IS NOT NULL) OR (status <> 'published' AND published_at IS NULL)),
  CHECK (status <> 'rejected' OR length(review_note) BETWEEN 1 AND 2000)
);
CREATE INDEX posts_public ON posts(locale, status, published_at DESC);
CREATE INDEX posts_author ON posts(author_id, created_at DESC);
CREATE INDEX posts_review ON posts(status, created_at DESC);
