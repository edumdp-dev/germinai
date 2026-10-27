import { useCallback, useEffect, useState } from "react"
import { ArrowLeft, RefreshCw, Shield } from "lucide-react"
import { Link, Navigate } from "react-router-dom"
import { useAuth } from "@/components/AuthProvider"
import { PageIntro } from "@germinai/design-system"
import { Button } from "@germinai/design-system"
import { api, errorMessage, roleLabels, type Role, type User } from "@/lib/api"
import { accountPath, type Locale } from "@/lib/i18n"

function UserAccess({ user, self, locale, onChanged }: { user: User; self: boolean; locale: Locale; onChanged: (user: User) => void }) {
  const en = locale === "en"
  const [role, setRole] = useState<Role>(user.role)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function save() {
    setBusy(true)
    setError(null)
    try { onChanged((await api<{ user: User }>(`/admin/users/${user.id}`, { method: "PATCH", body: { role } })).user) }
    catch (failure) { setError(errorMessage(failure)) }
    finally { setBusy(false) }
  }
  return <article className="user-access-row"><div><h3>{user.name}{self && <span className="self-label">{en ? "You" : "Você"}</span>}</h3><p>{user.email}</p>{error && <p className="form-message form-error" role="alert">{error}</p>}</div><div className="role-controls"><label className="sr-only" htmlFor={`role-${user.id}`}>{en ? `Role for ${user.name}` : `Permissão de ${user.name}`}</label><select id={`role-${user.id}`} value={role} disabled={self || busy} onChange={event => setRole(event.target.value as Role)}>{(["visitor", "member", "admin", "superadmin"] as const).map(value => <option key={value} value={value}>{roleLabels[locale][value]}</option>)}</select><Button variant="outline" disabled={self || busy || role === user.role} onClick={() => void save()}>{busy ? (en ? "Saving…" : "Salvando…") : (en ? "Save role" : "Salvar permissão")}</Button></div></article>
}

export default function AdminPage({ locale }: { locale: Locale }) {
  const en = locale === "en"
  const auth = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const loadUsers = useCallback(async () => {
    if (auth.user?.role !== "superadmin") { setLoading(false); return }
    setLoading(true)
    setError(null)
    try { setUsers((await api<{ users: User[] }>("/admin/users")).users) }
    catch (failure) { setError(errorMessage(failure)) }
    finally { setLoading(false) }
  }, [auth.user?.role])
  useEffect(() => { void loadUsers() }, [loadUsers])

  if (auth.loading) return <PageIntro title={en ? "Checking access…" : "Conferindo acesso…"} description={en ? "This area is exclusive to superadmins." : "Esta área é exclusiva de superadmins."} />
  if (auth.error) return <div className="account-shell container-shell"><p className="form-message form-error" role="alert">{auth.error}</p><Button onClick={() => void auth.refresh()}>{en ? "Try again" : "Tentar novamente"}</Button></div>
  if (!auth.user) return <Navigate to={accountPath(locale, "login")} replace />
  if (auth.user.role !== "superadmin") return <div className="account-shell container-shell"><h1>{en ? "Restricted area" : "Área restrita"}</h1><p className="form-description">{en ? "Only superadmins can manage account permissions." : "Somente superadmins podem gerenciar permissões das contas."}</p><Button asChild><Link to={accountPath(locale)}>{en ? "Back to account" : "Voltar à conta"}</Link></Button></div>

  return <section className="account-shell container-shell" aria-labelledby="admin-title"><Link className="text-link mb-8" to={accountPath(locale)}><ArrowLeft size={16} aria-hidden="true" />{en ? "My account" : "Minha conta"}</Link><header className="workspace-header"><div><p className="editorial-eyebrow"><Shield size={14} aria-hidden="true" />{en ? "Superadmins only" : "Somente superadmins"}</p><h1 id="admin-title">{en ? "People and permissions." : "Pessoas e permissões."}</h1><p>{en ? "Choose who reviews articles and who manages the community." : "Escolha quem revisa artigos e quem administra a comunidade."}</p></div><Button variant="ghost" disabled={loading} onClick={() => void loadUsers()}><RefreshCw aria-hidden="true" />{en ? "Refresh" : "Atualizar"}</Button></header><div className="permissions-note"><p>{en ? "Visitors read. Members with a verified institutional email propose articles. Admins review and publish only in the blog. Superadmins also manage permissions." : "Visitantes leem. Membros com e-mail institucional verificado propõem artigos. Admins revisam e publicam apenas no blog. Superadmins também gerenciam permissões."}</p><p>{en ? "Making an external email a member does not give it institutional publishing access. Your own superadmin access cannot be removed here." : "Dar a permissão de membro a um e-mail externo não concede acesso institucional para envio de artigos. Seu próprio acesso de superadmin não pode ser removido aqui."}</p></div>{message && <p className="form-message" role="status">{message}</p>}{error && <p className="form-message form-error" role="alert">{error}</p>}{loading ? <p className="loading-copy" role="status">{en ? "Loading people…" : "Carregando pessoas…"}</p> : <div className="user-access-list">{users.map(user => <UserAccess key={`${user.id}-${user.role}`} user={user} self={user.id === auth.user!.id} locale={locale} onChanged={updated => { setUsers(current => current.map(existing => existing.id === updated.id ? updated : existing)); setMessage(en ? `Role updated for ${updated.name}.` : `Permissão de ${updated.name} atualizada.`) }} />)}</div>}</section>
}
