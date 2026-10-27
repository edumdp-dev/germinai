import assert from "node:assert/strict"
import { test } from "node:test"
import { readFile, readdir } from "node:fs/promises"
import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto"
import { build } from "esbuild"
import { Miniflare } from "miniflare"
import { unstable_splitSqlQuery } from "wrangler"

const secret = "isolated-test-identity-secret-not-used-in-production"
const owner = "owner@example.com"
const origin = "https://germinai.test"
const { outputFiles } = await build({ entryPoints: ["worker/index.ts"], bundle: true, format: "esm", platform: "browser", write: false })
const migrationsDirectory = new URL("../migrations/", import.meta.url)
const migrations = await Promise.all((await readdir(migrationsDirectory)).filter(name => name.endsWith(".sql")).sort().map(name => readFile(new URL(name, migrationsDirectory), "utf8")))

async function fixture(t) {
  const mf = new Miniflare({ workers: [{ config: { name: "community-test", compatibilityDate: "2026-10-09", manifest: { mainModule: "worker.mjs", modules: { "worker.mjs": { type: "esm", contents: outputFiles[0].text } } }, env: { DB: { type: "d1", id: randomUUID() }, AUTH_SECRET: { type: "text", value: secret }, SUPERADMIN_EMAIL: { type: "text", value: owner } } } }] })
  t.after(() => mf.dispose())
  const db = await mf.getD1Database("DB")
  for (const migration of migrations) await db.batch(unstable_splitSqlQuery(migration).map(statement => db.prepare(statement)))
  const request = async (path, method = "GET", body, cookie = "", requestOrigin = origin) => {
    const headers = { Cookie: cookie }
    const multipart = body instanceof FormData
    if (method !== "GET" && method !== "HEAD") Object.assign(headers, { Origin: requestOrigin, ...(multipart ? {} : { "Content-Type": "application/json" }) })
    return mf.dispatchFetch(`${origin}/api${path}`, { method, headers, body: body === undefined ? undefined : multipart ? body : JSON.stringify(body) })
  }
  // Insert an already-issued challenge; delivery is external and is not mocked or claimed by these tests.
  const issue = async (email, overrides = {}) => {
    const id = randomUUID()
    const browser = randomBytes(32).toString("hex")
    const code = "314159"
    const digest = createHmac("sha256", secret).update(`${id}:${email}:${code}`).digest("hex")
    const browserHash = createHash("sha256").update(browser).digest("hex")
    await db.prepare("INSERT INTO auth_challenges (id,email,name,code_digest,browser_hash,expires_at,created_at) VALUES (?,?,?,?,?,?,?)").bind(id, email, "Student", digest, browserHash, overrides.expiresAt || Date.now() + 600000, Date.now()).run()
    return { id, code, cookie: `__Host-germinai-challenge=${browser}` }
  }
  const login = async email => {
    const challenge = await issue(email)
    const response = await request("/auth/verify-code", "POST", { challengeId: challenge.id, code: challenge.code }, challenge.cookie)
    assert.equal(response.status, 200)
    const { user } = await response.json()
    const cookie = response.headers.get("Set-Cookie").match(/__Host-germinai-session=[a-f0-9]{64}/)[0]
    return { user, cookie }
  }
  return { mf, db, request, issue, login }
}

const article = slug => ({ slug, locale: "pt", title: "Aprendendo com IA", excerpt: "Uma contribuição institucional revisada.", category: "Aprendizado", sections: [{ heading: "O que descobrimos", paragraphs: ["Experimente, confira o resultado e compartilhe seu aprendizado."] }] })

test("verified email selects exact-domain membership; only configured owner bootstraps superadmin", async t => {
  const { login, request } = await fixture(t)
  const institutional = await login("student@institutojef.org.br")
  const forged = await login("student@institutojef.org.br.attacker.com")
  const ownerAccount = await login(owner)
  assert.equal(institutional.user.role, "member")
  assert.equal(forged.user.role, "visitor")
  assert.equal(ownerAccount.user.role, "superadmin")
  assert.equal((await request("/admin/users", "GET", undefined, institutional.cookie)).status, 403)
  assert.equal((await request("/submissions", "POST", article("visitor-post"), forged.cookie)).status, 403)
})

test("email challenge is browser-bound, expires, locks after five wrong attempts and can only be consumed once", async t => {
  const { issue, request, db } = await fixture(t)
  const challenge = await issue("student@institutojef.org.br")
  const verify = cookie => request("/auth/verify-code", "POST", { challengeId: challenge.id, code: challenge.code }, cookie)
  assert.equal((await verify("")).status, 400)
  const results = await Promise.all([verify(challenge.cookie), verify(challenge.cookie)])
  assert.deepEqual(results.map(response => response.status).sort(), [200, 400])
  assert.equal((await verify(challenge.cookie)).status, 400)
  assert.equal((await db.prepare("SELECT count(*) AS count FROM sessions").first()).count, 1)
  const locked = await issue("locked@institutojef.org.br")
  for (let i = 0; i < 5; i++) assert.equal((await request("/auth/verify-code", "POST", { challengeId: locked.id, code: "000000" }, locked.cookie)).status, 400)
  assert.equal((await request("/auth/verify-code", "POST", { challengeId: locked.id, code: locked.code }, locked.cookie)).status, 400)
  const expired = await issue("expired@institutojef.org.br", { expiresAt: Date.now() - 1000 })
  assert.equal((await request("/auth/verify-code", "POST", { challengeId: expired.id, code: expired.code }, expired.cookie)).status, 400)
})

test("unconfigured mail never pretends to send; cross-origin mutations cannot create an account", async t => {
  const { request, db } = await fixture(t)
  const unavailable = await request("/auth/request-code", "POST", { email: owner, locale: "pt" })
  assert.equal(unavailable.status, 503)
  assert.equal((await unavailable.json()).code, "AUTH_NOT_CONFIGURED")
  assert.equal((await db.prepare("SELECT count(*) AS count FROM auth_challenges").first()).count, 0)
  assert.equal((await request("/auth/request-code", "POST", { email: owner, locale: "pt" }, "", "https://attacker.test")).status, 403)
})

test("only an admin can publish; pending/rejected content stays private; approval requires the displayed revision", async t => {
  const { login, request } = await fixture(t)
  const member = await login("writer@institutojef.org.br")
  const reviewer = await login("reviewer@example.com")
  const superadmin = await login(owner)
  assert.equal((await request(`/admin/users/${reviewer.user.id}`, "PATCH", { role: "admin" }, superadmin.cookie)).status, 200)
  const created = await request("/submissions", "POST", article("reviewed-article"), member.cookie)
  assert.equal(created.status, 201)
  const { post } = await created.json()
  assert.equal(post.status, "pending")
  assert.equal((await request("/posts/reviewed-article?locale=pt")).status, 404)
  assert.equal((await request(`/submissions/${post.id}/review`, "POST", { decision: "approve", revision: post.revision }, member.cookie)).status, 403)
  const edited = await request(`/submissions/${post.id}`, "PATCH", { ...article("reviewed-article"), title: "Conteúdo revisado", revision: post.revision }, member.cookie)
  assert.equal(edited.status, 200)
  const current = (await edited.json()).post
  assert.equal((await request(`/submissions/${post.id}/review`, "POST", { decision: "approve", revision: post.revision }, reviewer.cookie)).status, 409)
  const decisions = await Promise.all([request(`/submissions/${post.id}/review`, "POST", { decision: "approve", note: "Revisão interna concluída.", revision: current.revision }, reviewer.cookie), request(`/submissions/${post.id}/review`, "POST", { decision: "approve", note: "Revisão interna concluída.", revision: current.revision }, reviewer.cookie)])
  assert.deepEqual(decisions.map(response => response.status).sort(), [200, 409])
  const winner = decisions.find(response => response.status === 200)
  const reviewed = (await winner.json()).post
  const publicResponse = await request("/posts/reviewed-article?locale=pt")
  assert.equal(publicResponse.status, 200)
  assert.equal(reviewed.status, "published")
  assert.equal(reviewed.reviewNote, "Revisão interna concluída.")
  const published = (await publicResponse.json()).post
  assert.equal(published.title, "Conteúdo revisado")
  assert.equal(published.slug, "reviewed-article")
  assert.equal(published.reviewNote, null)
  assert.equal((await request("/posts/reviewed-article?locale=en")).status, 404)
  assert.equal((await request(`/submissions/${post.id}`, "PATCH", { ...article("reviewed-article"), revision: reviewed.revision }, member.cookie)).status, 409)
})

test("slugs are unique and reserved seed URLs cannot be replaced; authors cannot overwrite another submission", async t => {
  const { login, request } = await fixture(t)
  const first = await login("first@institutojef.org.br")
  const second = await login("second@institutojef.org.br")
  const result = await request("/submissions", "POST", article("chosen-url"), first.cookie)
  const { post } = await result.json()
  assert.equal((await request("/submissions", "POST", article("chosen-url"), second.cookie)).status, 409)
  assert.equal((await request("/submissions", "POST", article("lancamento-ohmypi"), second.cookie)).status, 409)
  assert.equal((await request(`/submissions/${post.id}`, "PATCH", { ...article("stolen-url"), revision: post.revision }, second.cookie)).status, 409)
  const ownPosts = (await (await request("/submissions", "GET", undefined, second.cookie)).json()).posts
  assert.deepEqual(ownPosts, [])
})

test("roles are rechecked against the database; external members cannot submit; sessions expire and logout revokes access", async t => {
  const { login, request, db } = await fixture(t)
  const superadmin = await login(owner)
  const editor = await login("editor@example.com")
  const writer = await login("writer@institutojef.org.br")
  assert.equal((await request(`/admin/users/${editor.user.id}`, "PATCH", { role: "admin" }, superadmin.cookie)).status, 200)
  const { post } = await (await request("/submissions", "POST", article("role-revocation"), writer.cookie)).json()
  assert.equal((await request(`/admin/users/${editor.user.id}`, "PATCH", { role: "member" }, superadmin.cookie)).status, 200)
  assert.equal((await request(`/submissions/${post.id}/review`, "POST", { decision: "approve", revision: post.revision }, editor.cookie)).status, 403)
  assert.equal((await request("/submissions", "POST", article("external-member"), editor.cookie)).status, 403)
  assert.equal((await request(`/admin/users/${superadmin.user.id}`, "PATCH", { role: "visitor" }, superadmin.cookie)).status, 409)
  assert.equal((await request("/auth/logout", "POST", {}, writer.cookie)).status, 200)
  assert.equal((await request("/submissions", "GET", undefined, writer.cookie)).status, 401)
  await db.prepare("UPDATE sessions SET expires_at = 0 WHERE user_id = ?").bind(editor.user.id).run()
  assert.equal((await (await request("/auth/session", "GET", undefined, editor.cookie)).json()).user, null)
})

test("rejection needs a reason and only the author can resubmit the corrected private article", async t => {
  const { login, request } = await fixture(t)
  const member = await login("author@institutojef.org.br")
  const other = await login("other@institutojef.org.br")
  const reviewer = await login(owner)
  const { post } = await (await request("/submissions", "POST", article("correction-flow"), member.cookie)).json()
  assert.equal((await request(`/submissions/${post.id}/review`, "POST", { decision: "reject", revision: post.revision }, reviewer.cookie)).status, 400)
  const rejected = (await (await request(`/submissions/${post.id}/review`, "POST", { decision: "reject", revision: post.revision, note: "Explique como verificar o resultado." }, reviewer.cookie)).json()).post
  assert.equal(rejected.status, "rejected")
  assert.equal(rejected.reviewNote, "Explique como verificar o resultado.")
  assert.equal((await request("/posts/correction-flow?locale=pt")).status, 404)
  assert.equal((await request(`/submissions/${post.id}`, "PATCH", { ...article("correction-flow"), revision: rejected.revision }, other.cookie)).status, 409)
  const corrected = (await (await request(`/submissions/${post.id}`, "PATCH", { ...article("correction-flow"), revision: rejected.revision }, member.cookie)).json()).post
  assert.equal(corrected.status, "pending")
  assert.equal(corrected.reviewNote, null)
  assert.equal(corrected.revision, rejected.revision + 1)
  assert.equal((await request("/posts/correction-flow?locale=pt")).status, 404)
})

function withFiles(input, files = []) {
  const form = new FormData()
  form.set("article", JSON.stringify(input))
  for (const [name, bytes] of files) form.append("files", new Blob([bytes], { type: "application/octet-stream" }), name)
  return form
}

test("real D1 binary attachments stay private until approval; GET and HEAD use safe download headers", async t => {
  const { request, login, db } = await fixture(t)
  const writer = await login("files@institutojef.org.br")
  const stranger = await login("stranger@institutojef.org.br")
  const reviewer = await login(owner)
  const bytes = new Uint8Array([80, 75, 3, 4, 0, 255, 128, 1])
  const response = await request("/submissions", "POST", withFiles(article("binary-download"), [["código.zip", bytes]]), writer.cookie)
  assert.equal(response.status, 201)
  const { post } = await response.json()
  const file = post.attachments[0]
  assert.deepEqual(Object.keys(file).sort(), ["downloadUrl", "id", "mimeType", "name", "sha256", "size"])
  assert.equal(file.mimeType, "application/zip")
  assert.equal(file.size, bytes.length)
  assert.equal(file.sha256, createHash("sha256").update(bytes).digest("hex"))
  const stored = await db.prepare("SELECT typeof(bytes) AS type, length(bytes) AS size FROM attachments WHERE id = ?").bind(file.id).first()
  assert.deepEqual(stored, { type: "blob", size: bytes.length })
  for (const cookie of ["", stranger.cookie]) {
    for (const method of ["GET", "HEAD"]) assert.equal((await request(`/attachments/${file.id}`, method, undefined, cookie)).status, 404)
  }
  for (const cookie of [writer.cookie, reviewer.cookie]) {
    const privateFile = await request(`/attachments/${file.id}`, "GET", undefined, cookie)
    assert.equal(privateFile.status, 200)
    assert.equal(privateFile.headers.get("Cache-Control"), "private, no-store")
    assert.deepEqual(new Uint8Array(await privateFile.arrayBuffer()), bytes)
  }
  assert.equal((await request(`/submissions/${post.id}/review`, "POST", { decision: "approve", revision: post.revision }, reviewer.cookie)).status, 200)
  const publicPost = (await (await request("/posts/binary-download?locale=pt")).json()).post
  assert.deepEqual(publicPost.attachments, post.attachments)
  for (const method of ["GET", "HEAD"]) {
    const downloaded = await request(`/attachments/${file.id}`, method)
    assert.equal(downloaded.status, 200)
    assert.equal(downloaded.headers.get("X-Content-Type-Options"), "nosniff")
    assert.equal(downloaded.headers.get("Content-Security-Policy"), "default-src 'none'; sandbox")
    assert.match(downloaded.headers.get("Content-Disposition"), /^attachment;.*filename\*=UTF-8''c%C3%B3digo.zip/)
    assert.equal(downloaded.headers.get("Cache-Control"), "public, max-age=31536000, immutable")
    assert.equal(downloaded.headers.get("Content-Length"), String(bytes.length))
    assert.deepEqual(new Uint8Array(await downloaded.arrayBuffer()), method === "HEAD" ? new Uint8Array() : bytes)
  }
  assert.equal((await request(`/submissions/${post.id}`, "PATCH", withFiles({ ...article("binary-download"), revision: 2 }, [["new.txt", "not allowed"]]), writer.cookie)).status, 409)
  assert.equal((await db.prepare("SELECT count(*) AS count FROM attachments").first()).count, 1)
})

test("attachment validation bounds sizes, types, filenames, duplicate names and the actual multipart body", async t => {
  const { request, login, db, mf } = await fixture(t)
  const writer = await login("validation@institutojef.org.br")
  const invalid = [
    ["executable.js", "alert(1)", 400], ["fake.zip", "not a ZIP", 400], ["fake.pdf", "not a PDF", 400],
    ["broken.json", "{", 400], ["binary.txt", new Uint8Array([0xff, 0xfe]), 400],
    ["control.md", new Uint8Array([0]), 400], ["empty.txt", "", 413],
    ["large.txt", new Uint8Array(1048577).fill(65), 413], ["bad\u202ename.txt", "text", 400],
    ["..txt", "text", 400], ["unsafe\\name.txt", "text", 400],
  ]
  for (const [name, bytes, status] of invalid) {
    const result = await request("/submissions", "POST", withFiles(article("invalid-file"), [[name, bytes]]), writer.cookie)
    assert.equal(result.status, status, name)
  }
  assert.equal((await request("/submissions", "POST", withFiles(article("duplicate-files"), [["A.txt", "a"], ["a.txt", "b"]]), writer.cookie)).status, 400)
  assert.equal((await request("/submissions", "POST", withFiles(article("too-many-files"), Array.from({ length: 5 }, (_, i) => [`${i}.txt`, "a"])), writer.cookie)).status, 400)
  const oversized = await mf.dispatchFetch(`${origin}/api/submissions`, { method: "POST", headers: { Origin: origin, Cookie: writer.cookie, "Content-Type": "multipart/form-data; boundary=x" }, body: new Uint8Array(5 * 1048576 + 1) })
  assert.equal(oversized.status, 413)
  assert.equal((await db.prepare("SELECT count(*) AS count FROM posts").first()).count, 0)
  assert.equal((await db.prepare("SELECT count(*) AS count FROM attachments").first()).count, 0)
  const valid = await request("/submissions", "POST", withFiles(article("valid-files"), [["full.txt", new Uint8Array(1048576).fill(65)], ["notes.md", "# Markdown\nOlá"], ["config.json", '{"valid":true}'], ["document.pdf", "%PDF-1.7\n%%EOF"]]), writer.cookie)
  assert.equal(valid.status, 201)
  assert.equal((await valid.json()).post.attachments.length, 4)
})

test("attachment removal, preservation and replacement share the post CAS and rollback on SQL constraints", async t => {
  const { request, login, db } = await fixture(t)
  const writer = await login("edit-files@institutojef.org.br")
  const other = await login("other-files@institutojef.org.br")
  const created = await request("/submissions", "POST", withFiles(article("file-edits"), [["one.txt", "one"], ["two.txt", "two"], ["three.txt", "three"], ["four.txt", "four"]]), writer.cookie)
  let post = (await created.json()).post
  const original = post.attachments
  assert.equal((await request(`/submissions/${post.id}`, "PATCH", withFiles({ ...article("file-edits"), revision: post.revision }, [["stolen.txt", "no"]]), other.cookie)).status, 409)
  post = (await (await request(`/submissions/${post.id}`, "PATCH", { ...article("file-edits"), revision: post.revision }, writer.cookie)).json()).post
  assert.deepEqual(post.attachments, original)
  const overflow = await request(`/submissions/${post.id}`, "PATCH", withFiles({ ...article("file-edits"), revision: post.revision, title: "Must rollback" }, [["five.txt", "five"]]), writer.cookie)
  assert.equal(overflow.status, 400)
  const current = (await (await request("/submissions", "GET", undefined, writer.cookie)).json()).posts[0]
  assert.equal(current.revision, post.revision)
  assert.equal(current.title, article("file-edits").title)
  const duplicate = await request(`/submissions/${post.id}`, "PATCH", withFiles({ ...article("file-edits"), revision: post.revision, removeAttachmentIds: [original[0].id] }, [[original[1].name.toUpperCase(), "duplicate"]]), writer.cookie)
  assert.equal(duplicate.status, 400)
  assert.equal((await request(`/attachments/${original[0].id}`, "GET", undefined, writer.cookie)).status, 200)
  const foreign = (await (await request("/submissions", "POST", withFiles(article("foreign-file"), [["foreign.txt", "foreign"]]), other.cookie)).json()).post.attachments[0]
  assert.equal((await request(`/submissions/${post.id}`, "PATCH", { ...article("file-edits"), revision: post.revision, removeAttachmentIds: [foreign.id] }, writer.cookie)).status, 409)
  const replaced = await request(`/submissions/${post.id}`, "PATCH", withFiles({ ...article("file-edits"), revision: post.revision, removeAttachmentIds: [original[0].id] }, [[original[0].name, "replacement"]]), writer.cookie)
  assert.equal(replaced.status, 200)
  const next = (await replaced.json()).post
  assert.equal(next.revision, post.revision + 1)
  assert.equal(next.attachments.length, 4)
  assert.equal((await request(`/attachments/${original[0].id}`, "GET", undefined, writer.cookie)).status, 404)
  assert.equal((await request(`/submissions/${post.id}`, "PATCH", withFiles({ ...article("file-edits"), revision: post.revision, removeAttachmentIds: [next.attachments[0].id] }, [["stale.txt", "stale"]]), writer.cookie)).status, 409)
  assert.equal((await db.prepare("SELECT count(*) AS count FROM attachments WHERE post_id = ?").bind(post.id).first()).count, 4)
  assert.equal((await db.prepare("SELECT count(*) AS count FROM attachments WHERE name IN ('stolen.txt','stale.txt','five.txt')").first()).count, 0)
})

test("approval versus attachment edit has exactly one winner and never publishes an unreviewed revision", async t => {
  const { request, login, db } = await fixture(t)
  const writer = await login("race-files@institutojef.org.br")
  const reviewer = await login(owner)
  const { post } = await (await request("/submissions", "POST", withFiles(article("file-race"), [["old.txt", "old"]]), writer.cookie)).json()
  const results = await Promise.all([
    request(`/submissions/${post.id}/review`, "POST", { decision: "approve", revision: post.revision }, reviewer.cookie),
    request(`/submissions/${post.id}`, "PATCH", withFiles({ ...article("file-race"), revision: post.revision, removeAttachmentIds: [post.attachments[0].id] }, [["new.txt", "new"]]), writer.cookie),
  ])
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409])
  const current = (await (await request("/submissions", "GET", undefined, writer.cookie)).json()).posts[0]
  assert.equal(current.attachments.length, 1)
  assert.equal(current.revision, 2)
  if (results[0].status === 200) {
    assert.equal(current.status, "published")
    assert.equal(current.attachments[0].name, "old.txt")
    assert.equal((await request(`/attachments/${current.attachments[0].id}`)).status, 200)
  } else {
    assert.equal(current.status, "pending")
    assert.equal(current.attachments[0].name, "new.txt")
    assert.equal((await request(`/attachments/${current.attachments[0].id}`)).status, 404)
    assert.equal((await request(`/submissions/${post.id}/review`, "POST", { decision: "approve", revision: 1 }, reviewer.cookie)).status, 409)
    assert.equal((await request(`/submissions/${post.id}/review`, "POST", { decision: "approve", revision: 2 }, reviewer.cookie)).status, 200)
    assert.equal((await request(`/attachments/${current.attachments[0].id}`)).status, 200)
  }
  assert.equal((await db.prepare("SELECT count(*) AS count FROM attachments WHERE post_id = ?").bind(post.id).first()).count, 1)
})

test("live role revocation prevents file writes and private editor reads without creating blobs", async t => {
  const { request, login, db } = await fixture(t)
  const writer = await login("revoked-files@institutojef.org.br")
  const editor = await login("file-editor@example.com")
  const ownerAccount = await login(owner)
  assert.equal((await request(`/admin/users/${editor.user.id}`, "PATCH", { role: "admin" }, ownerAccount.cookie)).status, 200)
  const { post } = await (await request("/submissions", "POST", withFiles(article("revoked-files"), [["private.txt", "private"]]), writer.cookie)).json()
  assert.equal((await request(`/attachments/${post.attachments[0].id}`, "GET", undefined, editor.cookie)).status, 200)
  assert.equal((await request(`/admin/users/${editor.user.id}`, "PATCH", { role: "visitor" }, ownerAccount.cookie)).status, 200)
  assert.equal((await request(`/attachments/${post.attachments[0].id}`, "GET", undefined, editor.cookie)).status, 404)
  assert.equal((await request(`/admin/users/${writer.user.id}`, "PATCH", { role: "visitor" }, ownerAccount.cookie)).status, 200)
  assert.equal((await request(`/submissions/${post.id}`, "PATCH", withFiles({ ...article("revoked-files"), revision: post.revision }, [["denied.txt", "denied"]]), writer.cookie)).status, 403)
  assert.equal((await request("/submissions", "POST", withFiles(article("denied-create"), [["denied.txt", "denied"]]), writer.cookie)).status, 403)
  assert.equal((await db.prepare("SELECT count(*) AS count FROM attachments").first()).count, 1)
})

test("competing attachment edits cannot adopt a different operation's revision or leave orphan blobs", async t => {
  const { request, login, db } = await fixture(t)
  const writer = await login("competing-files@institutojef.org.br")
  const { post } = await (await request("/submissions", "POST", article("competing-files"), writer.cookie)).json()
  const responses = await Promise.all(["first.txt", "second.txt"].map(name => request(`/submissions/${post.id}`, "PATCH", withFiles({ ...article("competing-files"), revision: post.revision }, [[name, name]]), writer.cookie)))
  assert.deepEqual(responses.map(response => response.status).sort(), [200, 409])
  const winner = (await responses.find(response => response.status === 200).json()).post
  const files = await db.prepare("SELECT id, name, post_id FROM attachments").all()
  assert.equal(files.results.length, 1)
  assert.equal(files.results[0].id, winner.attachments[0].id)
  assert.equal(files.results[0].post_id, post.id)
  assert.equal(winner.revision, 2)
})

test("canonical Unicode attachment names reject duplicates and inherited lookup keys are not file types", async t => {
  const { request, login, db } = await fixture(t)
  const writer = await login("unicode-files@institutojef.org.br")
  assert.equal((await request("/submissions", "POST", withFiles(article("unicode-files"), [["café.md", "one"], ["cafe\u0301.md", "two"]]), writer.cookie)).status, 400)
  assert.equal((await request("/submissions", "POST", withFiles(article("inherited-type"), [["unsafe.constructor", "text"]]), writer.cookie)).status, 400)
  assert.equal((await request("/submissions", "POST", withFiles(article("bidi-name"), [["bad\u200fname.txt", "text"]]), writer.cookie)).status, 400)
  assert.equal((await db.prepare("SELECT count(*) AS count FROM attachments").first()).count, 0)
})
