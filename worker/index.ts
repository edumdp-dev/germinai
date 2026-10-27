// Minimal structural Workers interfaces keep the browser and worker type environments separate.
interface D1Result<T = Record<string, unknown>> { results: T[]; meta: { changes: number }; success: boolean }
interface Statement {
  bind(...values: unknown[]): Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}
interface Database { prepare(sql: string): Statement; batch<T = Record<string, unknown>>(statements: Statement[]): Promise<D1Result<T>[]> }
interface Env {
  DB?: Database;
  ASSETS: { fetch(request: Request): Promise<Response> };
  AUTH_SECRET?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  SUPERADMIN_EMAIL?: string;
}
type Role = 'superadmin' | 'admin' | 'member' | 'visitor';
interface UserRow { id: string; email: string; name: string; role: Role; created_at: string }
interface PostRow {
  id: string; slug: string; locale: 'pt' | 'en'; title: string; excerpt: string; category: string;
  author_id: string; author_name: string; published_at: string | null; sections: string;
  status: 'pending' | 'published' | 'rejected'; review_note: string | null;
  created_at: string; updated_at: string; revision: number;
}
interface AttachmentRow { id: string; post_id: string; name: string; size: number; mime_type: string; sha256: string; bytes?: ArrayBuffer | number[] }
interface Upload { id: string; name: string; key: string; size: number; mime: string; digest: string; bytes: ArrayBuffer }
const FILE_LIMIT = 1024 * 1024;
const MULTIPART_LIMIT = 5 * FILE_LIMIT;
interface Challenge { id: string; email: string; name: string; code_digest: string; browser_hash: string; expires_at: number; attempts: number; consumption_token: string | null }
class ApiError extends Error {
  constructor(readonly status: number, message: string, readonly code: string) { super(message); }
}
const SESSION_COOKIE = '__Host-germinai-session';
const CHALLENGE_COOKIE = '__Host-germinai-challenge';
const TEN_MINUTES = 600_000;
const WEEK = 7 * 24 * 60 * 60 * 1000;
const encoder = new TextEncoder();
const privilegedSql = "role IN ('admin','superadmin')";
const eligibleSql = "(role IN ('admin','superadmin') OR (role = 'member' AND substr(email, instr(email, '@') + 1) = 'institutojef.org.br'))";
const privileged = (u: UserRow) => u.role === 'admin' || u.role === 'superadmin';
const eligible = (u: UserRow) => privileged(u) || (u.role === 'member' && u.email.split('@')[1] === 'institutojef.org.br');
function fail(status: number, message: string, code: string): never { throw new ApiError(status, message, code); }
function json(data: unknown, status = 200, extra?: HeadersInit) {
  const headers = new Headers(extra);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'same-origin');
  return new Response(JSON.stringify(data), { status, headers });
}
function cookie(name: string, value: string, seconds: number) {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${seconds}`;
}
function readCookie(request: Request, name: string) {
  const item = (request.headers.get('Cookie') || '').split(';').map(v => v.trim()).find(v => v.startsWith(`${name}=`));
  return item?.slice(name.length + 1) || '';
}
function randomToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
}
function hex(bytes: ArrayBuffer) { return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join(''); }
async function sha(value: string) { return hex(await crypto.subtle.digest('SHA-256', encoder.encode(value))); }
async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}
function equalDigest(a: string, b: string) {
  let difference = a.length ^ b.length;
  for (let i = 0; i < 64; i++) difference |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return difference === 0;
}
function otp() {
  const values = new Uint32Array(1);
  do { crypto.getRandomValues(values); } while (values[0] >= 4_294_000_000);
  return String(values[0] % 1_000_000).padStart(6, '0');
}
function userOutput(u: UserRow) { return { id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.created_at }; }
async function postOutput(db: Database, p: PostRow, publicView = false) {
  const files = await db.prepare('SELECT id, post_id, name, size, mime_type, sha256 FROM attachments WHERE post_id = ? ORDER BY id').bind(p.id).all<AttachmentRow>();
  return { id: p.id, slug: p.slug, locale: p.locale, title: p.title, excerpt: p.excerpt, category: p.category,
    authorId: p.author_id, authorName: p.author_name, publishedAt: p.published_at, projectId: null, sections: JSON.parse(p.sections) as unknown,
    status: p.status, reviewNote: publicView ? null : p.review_note, createdAt: p.created_at, updatedAt: p.updated_at, revision: p.revision,
    attachments: files.results.map(f => ({ id: f.id, name: f.name, size: f.size, mimeType: f.mime_type, sha256: f.sha256, downloadUrl: `/api/attachments/${f.id}` })) };
}
function locale(value: unknown): 'pt' | 'en' {
  if (value !== 'pt' && value !== 'en') fail(400, 'Specify locale pt or en.', 'INVALID_LOCALE');
  return value;
}
function text(value: unknown, name: string, max: number, allowEmpty = false) {
  if (typeof value !== 'string') fail(400, `${name} must be plain text.`, 'INVALID_INPUT');
  const clean = value.trim();
  if ((!allowEmpty && !clean) || clean.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(clean) || /<\/?[a-z!][^>]*>/i.test(clean)) {
    fail(400, `${name} must be plain text, at most ${max} characters, without HTML.`, 'INVALID_INPUT');
  }
  return clean;
}
function email(value: unknown) {
  if (typeof value !== 'string') fail(400, 'Enter a valid email address.', 'INVALID_EMAIL');
  const normalized = value.trim().toLowerCase();
  if (normalized.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(normalized)
    || normalized.split('@')[0].startsWith('.') || normalized.split('@')[0].endsWith('.') || normalized.includes('..')) {
    fail(400, 'Enter a valid email address.', 'INVALID_EMAIL');
  }
  return normalized;
}
async function body(request: Request): Promise<Record<string, unknown>> {
  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > 400_000) fail(413, 'Request is too large.', 'BODY_TOO_LARGE');
  // Bound the stream itself; Content-Length is not trusted.
  const reader = request.body?.getReader();
  if (!reader) fail(400, 'A JSON object is required.', 'INVALID_JSON');
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > 400_000) { await reader.cancel(); fail(413, 'Request is too large.', 'BODY_TOO_LARGE'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) fail(400, 'A JSON object is required.', 'INVALID_JSON');
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    fail(400, 'A valid JSON object is required.', 'INVALID_JSON');
  }
}
// Bound actual bytes before invoking the multipart parser, including chunked requests.
async function submissionBody(request: Request): Promise<{ input: Record<string, unknown>; files: Upload[]; removals: string[] }> {
  let input: Record<string, unknown>;
  const files: Upload[] = [];
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() === 'application/json') {
    input = await body(request);
  } else {
    if (Number(request.headers.get('Content-Length') || 0) > MULTIPART_LIMIT) fail(413, 'Request is too large.', 'BODY_TOO_LARGE');
    const reader = request.body?.getReader();
    if (!reader) fail(400, 'Provide article and files.', 'INVALID_MULTIPART');
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MULTIPART_LIMIT) { await reader.cancel(); fail(413, 'Request is too large.', 'BODY_TOO_LARGE'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    let form: FormData;
    try { form = await new Response(bytes, { headers: { 'Content-Type': request.headers.get('Content-Type')! } }).formData(); }
    catch { fail(400, 'Malformed multipart request.', 'INVALID_MULTIPART'); }
    const articles = form.getAll('article');
    if (articles.length !== 1 || typeof articles[0] !== 'string' || encoder.encode(articles[0]).length > 400_000) fail(400, 'Provide one JSON article field.', 'INVALID_MULTIPART');
    try {
      const value: unknown = JSON.parse(articles[0]);
      if (!value || typeof value !== 'object' || Array.isArray(value)) fail(400, 'Article must be a JSON object.', 'INVALID_JSON');
      input = value as Record<string, unknown>;
    } catch { fail(400, 'Article must be a JSON object.', 'INVALID_JSON'); }
    for (const key of form.keys()) if (key !== 'article' && key !== 'files') fail(400, 'Unknown multipart field.', 'INVALID_MULTIPART');
    const entries = form.getAll('files');
    if (entries.length > 4) fail(400, 'At most four attachments are allowed.', 'ATTACHMENT_LIMIT');
    for (const entry of entries) {
      if (typeof entry === 'string') fail(400, 'Files must be uploaded as file parts.', 'INVALID_ATTACHMENT');
      files.push(await upload(entry));
    }
    if (new Set(files.map(f => f.key)).size !== files.length) fail(400, 'Attachment names must be unique.', 'DUPLICATE_ATTACHMENT');
  }
  const raw = input.removeAttachmentIds ?? [];
  if (!Array.isArray(raw) || raw.length > 4 || raw.some(id => typeof id !== 'string' || !/^[a-f0-9-]{36}$/.test(id)) || new Set(raw).size !== raw.length) fail(400, 'Provide distinct attachment IDs to remove.', 'INVALID_REMOVALS');
  return { input, files, removals: raw as string[] };
}
async function upload(file: File): Promise<Upload> {
  const name = file.name.normalize('NFC');
  if (name !== name.trim() || name.length > 180 || encoder.encode(name).length > 240 || !name || name.startsWith('.') || name.endsWith('.') || /[\/\\<>:"|?*\u0000-\u001f\u007f-\u009f\u061c\u200e\u200f\u2028-\u202e\u2066-\u2069]/.test(name) || name.includes('..') || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])\./i.test(name)) fail(400, 'Use a safe filename without paths or control characters.', 'INVALID_FILENAME');
  const extension = /\.([a-z]+)$/i.exec(name)?.[1].toLowerCase();
  const types: Record<string, string> = { zip: 'application/zip', pdf: 'application/pdf', md: 'text/markdown; charset=utf-8', txt: 'text/plain; charset=utf-8', json: 'application/json; charset=utf-8' };
  if (!extension || !Object.hasOwn(types, extension)) fail(400, 'Only ZIP, PDF, Markdown, text and JSON files are allowed.', 'INVALID_FILE_TYPE');
  if (file.size < 1 || file.size > FILE_LIMIT) fail(413, 'Each attachment must contain 1 byte to 1 MiB.', 'FILE_TOO_LARGE');
  const bytes = await file.arrayBuffer();
  const view = new Uint8Array(bytes);
  if (extension === 'zip') {
    if (view.length < 4 || view[0] !== 0x50 || view[1] !== 0x4b || !((view[2] === 3 && view[3] === 4) || (view[2] === 5 && view[3] === 6))) fail(400, 'ZIP signature is invalid.', 'INVALID_FILE_TYPE');
  } else if (extension === 'pdf') {
    if (!/^%PDF-1\.[0-9]|^%PDF-2\.0/.test(new TextDecoder().decode(view.subarray(0, 8)))) fail(400, 'PDF signature is invalid.', 'INVALID_FILE_TYPE');
  } else {
    let decoded: string;
    try { decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
    catch { fail(400, 'Text files must use valid UTF-8.', 'INVALID_FILE_TYPE'); }
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(decoded)) fail(400, 'Text files cannot contain binary control bytes.', 'INVALID_FILE_TYPE');
    if (extension === 'json') {
      try { JSON.parse(decoded); } catch { fail(400, 'JSON attachment is invalid.', 'INVALID_FILE_TYPE'); }
    }
  }
  return { id: crypto.randomUUID(), name, key: name.toLowerCase(), size: file.size, mime: types[extension], digest: hex(await crypto.subtle.digest('SHA-256', bytes)), bytes };
}
function attachmentInserts(db: Database, id: string, token: string, files: Upload[]) {
  return files.map(f => db.prepare('INSERT INTO attachments (id, post_id, name, name_key, size, mime_type, sha256, bytes) SELECT ?, id, ?, ?, ?, ?, ?, ? FROM posts WHERE id = ? AND attachment_mutation_token = ? AND status = ?')
    .bind(f.id, f.name, f.key, f.size, f.mime, f.digest, f.bytes, id, token, 'pending'));
}
function revision(value: unknown) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) fail(400, 'Send the revision of the displayed post.', 'INVALID_REVISION');
  return value;
}
function postInput(input: Record<string, unknown>) {
  const slug = text(input.slug, 'Slug', 100).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail(400, 'Slug must contain lowercase letters, digits and single hyphens.', 'INVALID_SLUG');
  if (['lancamento-ohmypi', 'lancamento-biblioteca-alexandria'].includes(slug)) fail(409, 'This slug belongs to an existing article.', 'SLUG_TAKEN');
  const title = text(input.title, 'Title', 180);
  const excerpt = text(input.excerpt, 'Excerpt', 500);
  const category = text(input.category, 'Category', 60);
  if (!Array.isArray(input.sections) || input.sections.length < 1 || input.sections.length > 30) fail(400, 'Provide between 1 and 30 sections.', 'INVALID_SECTIONS');
  let size = 0;
  const sections = input.sections.map((section: unknown) => {
    if (!section || typeof section !== 'object' || Array.isArray(section)) fail(400, 'Invalid section.', 'INVALID_SECTIONS');
    const item = section as Record<string, unknown>;
    const heading = text(item.heading, 'Section heading', 180, true);
    if (!Array.isArray(item.paragraphs) || item.paragraphs.length < 1 || item.paragraphs.length > 40) fail(400, 'Each section needs between 1 and 40 paragraphs.', 'INVALID_SECTIONS');
    const paragraphs = item.paragraphs.map(p => text(p, 'Paragraph', 80_000));
    size += heading.length + paragraphs.reduce((sum, p) => sum + p.length, 0);
    return { heading, paragraphs };
  });
  if (size > 80_000) fail(400, 'Article body must not exceed 80,000 characters.', 'BODY_TOO_LARGE');
  return { slug, locale: locale(input.locale), title, excerpt, category, sections: JSON.stringify(sections) };
}
async function sessionUser(request: Request, db: Database) {
  const token = readCookie(request, SESSION_COOKIE);
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  return db.prepare('SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?').bind(await sha(token), Date.now()).first<UserRow>();
}
async function requireUser(request: Request, db: Database) {
  const user = await sessionUser(request, db);
  if (!user) fail(401, 'Sign in to continue.', 'UNAUTHENTICATED');
  return user;
}
function identityConfig(env: Env) {
  if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 32 || !env.SUPERADMIN_EMAIL) {
    fail(503, 'Email sign-in is not configured. Set AUTH_SECRET (at least 32 characters) and SUPERADMIN_EMAIL in Cloudflare.', 'AUTH_NOT_CONFIGURED');
  }
  let bootstrap: string;
  try { bootstrap = email(env.SUPERADMIN_EMAIL); } catch { fail(503, 'Configure SUPERADMIN_EMAIL as a valid email address.', 'AUTH_NOT_CONFIGURED'); }
  return { secret: env.AUTH_SECRET, bootstrap };
}
async function quota(db: Database, key: string, maximum: number, window: number, now: number) {
  const bucket = Math.floor(now / window);
  const row = await db.prepare('INSERT INTO auth_quotas (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count')
    .bind(`${key}:${bucket}`, (bucket + 1) * window).first<{ count: number }>();
  if (!row || row.count > maximum) fail(429, 'Too many sign-in attempts. Please try again later.', 'RATE_LIMITED');
}
async function requestCode(request: Request, env: Env, db: Database, input: Record<string, unknown>) {
  const identity = identityConfig(env);
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    fail(503, 'Email delivery is not configured. Set RESEND_API_KEY and a verified EMAIL_FROM sender in Cloudflare.', 'AUTH_NOT_CONFIGURED');
  }
  const config = { ...identity, apiKey: env.RESEND_API_KEY, from: env.EMAIL_FROM };
  const address = email(input.email);
  const language = locale(input.locale);
  const name = input.name === undefined || input.name === '' ? address.split('@')[0].slice(0, 100) : text(input.name, 'Name', 100);
  const now = Date.now();
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const [ipHash, emailHash] = await Promise.all([hmac(config.secret, `ip:${ip}`), hmac(config.secret, `email:${address}`)]);
  await quota(db, `request-ip:${ipHash}`, 20, 3_600_000, now);
  await quota(db, `request-email:${emailHash}`, 5, 3_600_000, now);
  const cooldown = await db.prepare('INSERT INTO auth_cooldowns (email_hash, requested_at) VALUES (?, ?) ON CONFLICT(email_hash) DO UPDATE SET requested_at = excluded.requested_at WHERE requested_at <= ? RETURNING requested_at')
    .bind(emailHash, now, now - 60_000).first();
  if (!cooldown) fail(429, 'Wait 60 seconds before requesting another code.', 'RESEND_COOLDOWN');
  const id = crypto.randomUUID();
  const code = otp();
  const browser = randomToken();
  const expires = now + TEN_MINUTES;
  await db.batch([
    db.prepare('DELETE FROM auth_challenges WHERE expires_at <= ? OR email = ?').bind(now, address),
    db.prepare('DELETE FROM auth_quotas WHERE expires_at <= ?').bind(now),
    db.prepare('DELETE FROM auth_cooldowns WHERE requested_at < ?').bind(now - 86_400_000),
    db.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(now),
    db.prepare('INSERT INTO auth_challenges (id, email, name, code_digest, browser_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, address, name, await hmac(config.secret, `${id}:${address}:${code}`), await sha(browser), expires, now),
  ]);
  let sent = false;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': id },
      body: JSON.stringify({ from: config.from, to: [address], subject: language === 'pt' ? 'Seu código de acesso GerminAI' : 'Your GerminAI sign-in code',
        text: language === 'pt' ? `Seu código GerminAI é ${code}. Expira em 10 minutos. Digite-o somente no navegador onde você solicitou o acesso. Não compartilhe este código. Se não solicitou, ignore esta mensagem.` : `Your GerminAI code is ${code}. It expires in 10 minutes. Enter it only in the browser where you requested sign-in. Never share this code. If you did not request it, ignore this message.` }),
      signal: AbortSignal.timeout(15_000),
    });
    if (response.ok) {
      const receipt: unknown = await response.json();
      sent = !!receipt && typeof receipt === 'object' && 'id' in receipt && typeof receipt.id === 'string';
    }
  } catch { /* Provider errors must never disclose credentials or the code. */ }
  if (!sent) {
    await db.prepare('DELETE FROM auth_challenges WHERE id = ?').bind(id).run();
    fail(503, 'Unable to send the sign-in email. Check the Resend API key and verified EMAIL_FROM sender, then try again after 60 seconds.', 'EMAIL_SEND_FAILED');
  }
  return json({ challengeId: id, expiresAt: new Date(expires).toISOString(), resendAt: new Date(now + 60_000).toISOString() }, 200,
    { 'Set-Cookie': cookie(CHALLENGE_COOKIE, browser, 600) });
}
async function verifyCode(request: Request, env: Env, db: Database, input: Record<string, unknown>) {
  const config = identityConfig(env);
  const now = Date.now();
  await quota(db, `verify-ip:${await hmac(config.secret, request.headers.get('CF-Connecting-IP') || 'unknown')}`, 60, 3_600_000, now);
  if (typeof input.challengeId !== 'string' || !/^[a-f0-9-]{36}$/.test(input.challengeId) || typeof input.code !== 'string' || !/^\d{6}$/.test(input.code)) {
    fail(400, 'Enter the six-digit email code.', 'INVALID_CODE');
  }
  const browser = readCookie(request, CHALLENGE_COOKIE);
  const challenge = await db.prepare('SELECT * FROM auth_challenges WHERE id = ?').bind(input.challengeId).first<Challenge>();
  if (!challenge || challenge.consumption_token || challenge.expires_at <= now || challenge.attempts >= 5 || !/^[a-f0-9]{64}$/.test(browser)
    || !equalDigest(await sha(browser), challenge.browser_hash)) {
    fail(400, 'Code expired or unavailable in this browser. Request a new code here.', 'INVALID_CHALLENGE');
  }
  // Increment in SQL before comparison; racing requests cannot bypass the attempt limit.
  const attempt = await db.prepare('UPDATE auth_challenges SET attempts = attempts + 1 WHERE id = ? AND consumption_token IS NULL AND expires_at > ? AND attempts < 5 RETURNING attempts')
    .bind(challenge.id, now).first<{ attempts: number }>();
  if (!attempt || !equalDigest(await hmac(config.secret, `${challenge.id}:${challenge.email}:${input.code}`), challenge.code_digest)) {
    fail(400, 'Incorrect or expired code. Request a new code after five attempts.', 'INVALID_CODE');
  }
  const consumption = randomToken();
  const token = randomToken();
  const role: Role = challenge.email === config.bootstrap ? 'superadmin' : challenge.email.split('@')[1] === 'institutojef.org.br' ? 'member' : 'visitor';
  const results = await db.batch([
    db.prepare('UPDATE auth_challenges SET consumption_token = ? WHERE id = ? AND consumption_token IS NULL AND expires_at > ? AND attempts <= 5 AND browser_hash = ? RETURNING id')
      .bind(consumption, challenge.id, Date.now(), challenge.browser_hash),
    db.prepare('INSERT INTO users (id, email, name, role, created_at) SELECT ?, email, name, ?, ? FROM auth_challenges WHERE id = ? AND consumption_token = ? ON CONFLICT(email) DO NOTHING')
      .bind(crypto.randomUUID(), role, new Date(now).toISOString(), challenge.id, consumption),
    db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at, created_at) SELECT ?, u.id, ?, ? FROM users u JOIN auth_challenges c ON c.email = u.email WHERE c.id = ? AND c.consumption_token = ?')
      .bind(await sha(token), now + WEEK, now, challenge.id, consumption),
  ]);
  if (!results[0].results.length || results[2].meta.changes !== 1) fail(400, 'Code already used or expired. Request a new code.', 'INVALID_CHALLENGE');
  const user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(challenge.email).first<UserRow>();
  if (!user) fail(503, 'Sign-in could not be completed. Please try again.', 'AUTH_UNAVAILABLE');
  const headers = new Headers();
  headers.append('Set-Cookie', cookie(SESSION_COOKIE, token, WEEK / 1000));
  headers.append('Set-Cookie', cookie(CHALLENGE_COOKIE, '', 0));
  // Replace any prior browser session rather than leaving an unused token valid.
  const old = readCookie(request, SESSION_COOKIE);
  if (/^[a-f0-9]{64}$/.test(old)) await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha(old)).run();
  return json({ user: userOutput(user) }, 200, headers);
}
async function route(request: Request, env: Env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/') && url.pathname !== '/api') return env.ASSETS.fetch(request);
  if (!env.DB) fail(503, 'The database is not configured. Bind the migrated D1 database as DB.', 'DATABASE_NOT_CONFIGURED');
  const db = env.DB;
  const method = request.method;
  const path = url.pathname;
  if (method !== 'GET' && method !== 'HEAD') {
    if (request.headers.get('Origin') !== url.origin || request.headers.get('Sec-Fetch-Site') === 'cross-site') fail(403, 'Use this API from the GerminAI site.', 'ORIGIN_REJECTED');
    const type = request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase();
    const acceptsFiles = (path === '/api/submissions' && method === 'POST') || (/^\/api\/submissions\/[a-f0-9-]{36}$/.test(path) && method === 'PATCH');
    if (type !== 'application/json' && !(acceptsFiles && type === 'multipart/form-data')) fail(415, acceptsFiles ? 'Send JSON or multipart/form-data.' : 'Send application/json.', 'JSON_REQUIRED');
  }
  const download = /^\/api\/attachments\/([a-f0-9-]{36})$/.exec(path);
  if (download && (method === 'GET' || method === 'HEAD')) {
    const user = await sessionUser(request, db);
    // Authorization and byte selection happen in the same query using live roles.
    const file = await db.prepare(`SELECT a.*, p.status FROM attachments a JOIN posts p ON p.id = a.post_id WHERE a.id = ? AND (p.status = 'published' OR p.author_id = ? OR EXISTS (SELECT 1 FROM users WHERE id = ? AND ${privilegedSql}))`)
      .bind(download[1], user?.id ?? '', user?.id ?? '').first<AttachmentRow & { status: string }>();
    if (!file) fail(404, 'Attachment not found.', 'NOT_FOUND');
    const ascii = file.name.replace(/[^\x20-\x7e]|["\\]/g, '_');
    const encoded = encodeURIComponent(file.name).replace(/['()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
    const headers = { 'Content-Type': file.mime_type, 'Content-Length': String(file.size),
      'Content-Disposition': `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`,
      'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox",
      'Cross-Origin-Resource-Policy': 'same-origin', 'Referrer-Policy': 'no-referrer',
      'Cache-Control': file.status === 'published' ? 'public, max-age=31536000, immutable' : 'private, no-store',
      'Vary': 'Cookie', 'ETag': `"${file.sha256}"` };
    const bytes = Array.isArray(file.bytes) ? new Uint8Array(file.bytes) : file.bytes;
    return new Response(method === 'HEAD' ? null : bytes, { headers });
  }
  if (path === '/api/auth/session' && method === 'GET') {
    const user = await sessionUser(request, db);
    return json({ user: user ? userOutput(user) : null });
  }
  if (path === '/api/auth/request-code' && method === 'POST') return requestCode(request, env, db, await body(request));
  if (path === '/api/auth/verify-code' && method === 'POST') return verifyCode(request, env, db, await body(request));
  if (path === '/api/auth/logout' && method === 'POST') {
    await body(request);
    const token = readCookie(request, SESSION_COOKIE);
    if (/^[a-f0-9]{64}$/.test(token)) await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha(token)).run();
    const headers = new Headers();
    headers.append('Set-Cookie', cookie(SESSION_COOKIE, '', 0));
    headers.append('Set-Cookie', cookie(CHALLENGE_COOKIE, '', 0));
    return json({ ok: true }, 200, headers);
  }
  if (path === '/api/posts' && method === 'GET') {
    const posts = await db.prepare("SELECT * FROM posts WHERE status = 'published' AND locale = ? ORDER BY published_at DESC, id DESC").bind(locale(url.searchParams.get('locale'))).all<PostRow>();
    return json({ posts: await Promise.all(posts.results.map(post => postOutput(db, post, true))) });
  }
  const article = /^\/api\/posts\/([a-z0-9-]+)$/.exec(path);
  if (article && method === 'GET') {
    const post = await db.prepare("SELECT * FROM posts WHERE slug = ? AND locale = ? AND status = 'published'").bind(article[1], locale(url.searchParams.get('locale'))).first<PostRow>();
    if (!post) fail(404, 'Article not found.', 'NOT_FOUND');
    return json({ post: await postOutput(db, post, true) });
  }
  if (path === '/api/submissions') {
    const user = await requireUser(request, db);
    if (!eligible(user)) fail(403, 'Only institutional members and editors can submit articles.', 'SUBMISSION_FORBIDDEN');
    if (method === 'GET') {
      const posts = await db.prepare(`SELECT * FROM posts ${privileged(user) ? '' : 'WHERE author_id = ?'} ORDER BY created_at DESC, id DESC`)
        .bind(...(privileged(user) ? [] : [user.id])).all<PostRow>();
      return json({ posts: await Promise.all(posts.results.map(post => postOutput(db, post))) });
    }
    if (method === 'POST') {
      const { input, files, removals } = await submissionBody(request);
      if (removals.length) fail(400, 'New articles have no attachments to remove.', 'INVALID_REMOVALS');
      const p = postInput(input);
      const id = crypto.randomUUID();
      const token = crypto.randomUUID();
      const stamp = new Date().toISOString();
      const results = await db.batch<PostRow>([
        db.prepare(`INSERT INTO posts (id, slug, locale, author_id, author_name, title, excerpt, category, sections, created_at, updated_at, attachment_mutation_token) SELECT ?, ?, ?, id, name, ?, ?, ?, ?, ?, ?, ? FROM users WHERE id = ? AND ${eligibleSql} RETURNING *`)
          .bind(id, p.slug, p.locale, p.title, p.excerpt, p.category, p.sections, stamp, stamp, token, user.id),
        ...attachmentInserts(db, id, token, files),
      ]);
      const post = results[0].results[0];
      if (!post) fail(403, 'Your submission permission has changed.', 'SUBMISSION_FORBIDDEN');
      return json({ post: await postOutput(db, post) }, 201);
    }
  }
  const submission = /^\/api\/submissions\/([a-f0-9-]{36})(\/review)?$/.exec(path);
  if (submission) {
    const user = await requireUser(request, db);
    const id = submission[1];
    if (submission[2] && method === 'POST') {
      if (!privileged(user)) fail(403, 'Only editors can review articles.', 'REVIEW_FORBIDDEN');
      const input = await body(request);
      const version = revision(input.revision);
      if (input.decision !== 'approve' && input.decision !== 'reject') fail(400, 'Choose approve or reject.', 'INVALID_DECISION');
      const note = input.note === undefined ? '' : text(input.note, 'Review note', 2000, true);
      if (input.decision === 'reject' && !note) fail(400, 'Explain why the article was rejected.', 'REVIEW_NOTE_REQUIRED');
      const stamp = new Date().toISOString();
      const post = await db.prepare(`UPDATE posts SET status = ?, review_note = ?, reviewer_id = ?, published_at = ?, updated_at = ?, revision = revision + 1 WHERE id = ? AND status = 'pending' AND revision = ? AND EXISTS (SELECT 1 FROM users WHERE id = ? AND ${privilegedSql}) RETURNING *`)
        .bind(input.decision === 'approve' ? 'published' : 'rejected', note || null, user.id, input.decision === 'approve' ? stamp : null, stamp, id, version, user.id).first<PostRow>();
      if (!post) fail(409, 'The article changed, was already reviewed, or your review permission changed. Reload before reviewing.', 'REVIEW_CONFLICT');
      return json({ post: await postOutput(db, post) });
    }
    if (!submission[2] && method === 'PATCH') {
      if (!eligible(user)) fail(403, 'Your account cannot edit submissions.', 'SUBMISSION_FORBIDDEN');
      const { input, files, removals } = await submissionBody(request);
      const version = revision(input.revision);
      const p = postInput(input);
      const token = crypto.randomUUID();
      // D1 batches are transactions. Every file mutation is gated by this unique
      // nonce, not just revision+1 (which a competing successful edit could share).
      // Validate ownership of every removal within the same live CAS predicate.
      const update = db.prepare(`UPDATE posts SET slug = ?, locale = ?, title = ?, excerpt = ?, category = ?, sections = ?, status = 'pending', review_note = NULL, reviewer_id = NULL, updated_at = ?, revision = revision + 1, attachment_mutation_token = ? WHERE id = ? AND revision = ? AND ((author_id = ? AND status IN ('pending','rejected')) OR (status = 'pending' AND EXISTS (SELECT 1 FROM users WHERE id = ? AND ${privilegedSql}))) AND EXISTS (SELECT 1 FROM users WHERE id = ? AND ${eligibleSql}) AND (SELECT count(*) FROM attachments WHERE post_id = posts.id AND id IN (SELECT value FROM json_each(?))) = ? RETURNING *`)
        .bind(p.slug, p.locale, p.title, p.excerpt, p.category, p.sections, new Date().toISOString(), token, id, version, user.id, user.id, user.id, JSON.stringify(removals), removals.length);
      const remove = db.prepare('DELETE FROM attachments WHERE post_id = ? AND id IN (SELECT value FROM json_each(?)) AND EXISTS (SELECT 1 FROM posts WHERE id = ? AND attachment_mutation_token = ? AND status = ?)')
        .bind(id, JSON.stringify(removals), id, token, 'pending');
      const results = await db.batch<PostRow>([update, remove, ...attachmentInserts(db, id, token, files)]);
      const post = results[0].results[0];
      if (!post) fail(409, 'The article changed, is not editable, belongs to another author, or a removal is invalid. Reload before editing.', 'EDIT_CONFLICT');
      return json({ post: await postOutput(db, post) });
    }
  }
  if (path === '/api/admin/users' && method === 'GET') {
    const user = await requireUser(request, db);
    if (user.role !== 'superadmin') fail(403, 'Only a superadmin can manage roles.', 'ROLE_FORBIDDEN');
    const users = await db.prepare('SELECT * FROM users ORDER BY created_at DESC, id DESC').all<UserRow>();
    return json({ users: users.results.map(userOutput) });
  }
  const target = /^\/api\/admin\/users\/([a-f0-9-]{36})$/.exec(path);
  if (target && method === 'PATCH') {
    const actor = await requireUser(request, db);
    if (actor.role !== 'superadmin') fail(403, 'Only a superadmin can manage roles.', 'ROLE_FORBIDDEN');
    const input = await body(request);
    if (!['superadmin', 'admin', 'member', 'visitor'].includes(String(input.role))) fail(400, 'Choose a valid role.', 'INVALID_ROLE');
    const role = input.role as Role;
    if (target[1] === actor.id && role !== 'superadmin') fail(409, 'A superadmin cannot demote their own account.', 'SELF_DEMOTION');
    const existing = await db.prepare('SELECT * FROM users WHERE id = ?').bind(target[1]).first<UserRow>();
    if (!existing) fail(404, 'User not found.', 'NOT_FOUND');
    const user = await db.prepare("UPDATE users SET role = ? WHERE id = ? AND EXISTS (SELECT 1 FROM users WHERE id = ? AND role = 'superadmin') AND (id <> ? OR ? = 'superadmin') AND (role <> 'superadmin' OR ? = 'superadmin' OR (SELECT count(*) FROM users WHERE role = 'superadmin') > 1) RETURNING *")
      .bind(role, target[1], actor.id, actor.id, role, role).first<UserRow>();
    if (!user) fail(409, 'Role change refused: preserve the last superadmin and reload your permissions.', 'ROLE_CONFLICT');
    return json({ user: userOutput(user) });
  }
  fail(404, 'API endpoint not found.', 'NOT_FOUND');
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try { return await route(request, env); }
    catch (error) {
      if (error instanceof ApiError) return json({ error: error.message, code: error.code }, error.status);
      // Never send raw provider, SQL, credential or challenge details to clients or logs.
      if (error instanceof Error && /UNIQUE constraint failed: posts\.slug/i.test(error.message)) return json({ error: 'This slug is already used. Choose another slug.', code: 'SLUG_TAKEN' }, 409);
      if (error instanceof Error && error.message.includes('last_superadmin')) return json({ error: 'The last superadmin cannot be demoted.', code: 'LAST_SUPERADMIN' }, 409);
      if (error instanceof Error && error.message.includes('attachment_limit')) return json({ error: 'At most four attachments are allowed per article.', code: 'ATTACHMENT_LIMIT' }, 400);
      if (error instanceof Error && /UNIQUE constraint failed: attachments\.post_id/i.test(error.message)) return json({ error: 'Attachment names must be unique.', code: 'DUPLICATE_ATTACHMENT' }, 400);
      if (error instanceof Error && error.message.includes('attachment_immutable')) return json({ error: 'Published attachments are immutable.', code: 'EDIT_CONFLICT' }, 409);
      return json({ error: 'The service is temporarily unavailable. Check the D1 binding and applied migrations, then retry.', code: 'SERVICE_UNAVAILABLE' }, 503);
    }
  },
};
