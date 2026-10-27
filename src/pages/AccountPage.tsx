import { useCallback, useEffect, useState } from "react"
import { ArrowRight, LogOut, Plus, RefreshCw, Shield } from "lucide-react"
import { Link, Navigate } from "react-router-dom"
import { useAuth } from "@/components/AuthProvider"
import { PageIntro } from "@germinai/design-system"
import PostEditor from "@/components/PostEditor"
import SubmissionCard from "@/components/SubmissionCard"
import { Button } from "@germinai/design-system"
import { api, canReview, canSubmit, errorMessage, roleLabels, type BlogPost } from "@/lib/api"
import { accountPath, pagePath, type Locale } from "@/lib/i18n"

export default function AccountPage({ locale }: { locale: Locale }) {
  const en = locale === "en"
  const auth = useAuth()
  const { user } = auth
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [view, setView] = useState<"mine" | "review">("mine")
  const [editing, setEditing] = useState<BlogPost | null | undefined>(undefined)
  const allowed = canSubmit(user) || canReview(user)

  const loadPosts = useCallback(async () => {
    if (!user || !allowed) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try { setPosts((await api<{ posts: BlogPost[] }>("/submissions")).posts) }
    catch (failure) { setError(errorMessage(failure)) }
    finally { setLoading(false) }
  }, [user?.id, user?.role, allowed])
  useEffect(() => { void loadPosts() }, [loadPosts])

  if (auth.loading) return <PageIntro title={en ? "Opening your account…" : "Abrindo sua conta…"} description={en ? "Checking your session." : "Conferindo sua sessão."} />
  if (auth.error) return <div className="account-shell container-shell"><h1>{en ? "Could not open your account" : "Não foi possível abrir sua conta"}</h1><p className="form-message form-error" role="alert">{auth.error}</p><Button onClick={() => void auth.refresh()}>{en ? "Try again" : "Tentar novamente"}</Button></div>
  if (!user) return <Navigate to={accountPath(locale, "login")} replace />
  const visiblePosts = posts.filter(post => view === "review" ? post.status === "pending" : post.authorId === user.id)

  async function signOut() {
    try { await auth.signOut() }
    catch (failure) { setError(errorMessage(failure)) }
  }

  return <div className="account-shell container-shell">
    <header className="workspace-header"><div><p className="editorial-eyebrow">{roleLabels[locale][user.role]}</p><h1>{en ? `Hello, ${user.name}.` : `Olá, ${user.name}.`}</h1><p>{user.email}</p></div><div className="action-row">{user.role === "superadmin" && <Button asChild variant="outline"><Link to={accountPath(locale, "admin")}><Shield aria-hidden="true" />{en ? "Administration" : "Administração"}</Link></Button>}<Button variant="ghost" onClick={() => void signOut()}><LogOut aria-hidden="true" />{en ? "Sign out" : "Sair"}</Button></div></header>
    {!allowed ? <section className="empty-state"><h2>{en ? "Welcome to the community." : "Bem-vindo à comunidade."}</h2><p>{en ? "You can read every published article. To propose a post, sign in with your verified @institutojef.org.br email. Visitor accounts cannot submit or approve articles." : "Você pode ler todos os artigos publicados. Para propor um post, entre com seu e-mail verificado @institutojef.org.br. Contas de visitantes não podem enviar nem aprovar artigos."}</p><Button asChild><Link to={pagePath(locale, "blog")}>{en ? "Explore the blog" : "Explorar o blog"}<ArrowRight aria-hidden="true" /></Link></Button></section> : <>
      <div className="workspace-toolbar"><div><h2>{en ? "Your contributions" : "Suas contribuições"}</h2><p>{en ? "From first draft to a published article." : "Da primeira ideia ao artigo publicado."}</p></div>{canSubmit(user) && <Button onClick={() => { setEditing(null); setMessage(null) }}><Plus aria-hidden="true" />{en ? "Propose article" : "Propor artigo"}</Button>}</div>
      {editing !== undefined && <PostEditor key={editing?.id || "new"} locale={locale} post={editing || undefined} onCancel={() => setEditing(undefined)} onSaved={post => { setEditing(undefined); setPosts(current => [post, ...current.filter(item => item.id !== post.id)]); setView("mine"); setMessage(en ? "Article sent for review. It is not public yet." : "Artigo enviado para revisão. Ele ainda não está público.") }} />}
      <div className="workspace-tabs"><div className="action-row"><Button variant={view === "mine" ? "secondary" : "ghost"} aria-pressed={view === "mine"} onClick={() => setView("mine")}>{en ? "My articles" : "Meus artigos"}</Button>{canReview(user) && <Button variant={view === "review" ? "secondary" : "ghost"} aria-pressed={view === "review"} onClick={() => setView("review")}>{en ? "Review queue" : "Fila de revisão"}</Button>}</div><Button variant="ghost" disabled={loading} onClick={() => void loadPosts()}><RefreshCw aria-hidden="true" />{en ? "Refresh" : "Atualizar"}</Button></div>
      {message && <p className="form-message" role="status">{message}</p>}
      {error && <p className="form-message form-error" role="alert">{error}</p>}
      {loading ? <p className="loading-copy" role="status">{en ? "Loading articles…" : "Carregando artigos…"}</p> : visiblePosts.length ? <div className="submissions-list">{visiblePosts.map(post => <SubmissionCard key={`${post.id}-${post.revision}-${post.status}`} post={post} user={user} locale={locale} onEdit={item => { setEditing(item); window.scrollTo({ top: 0, behavior: "smooth" }) }} onReviewed={item => { setPosts(current => current.map(existing => existing.id === item.id ? item : existing)); setMessage(item.status === "published" ? (en ? "Article published in the blog." : "Artigo publicado no blog.") : (en ? "Article returned with review notes." : "Artigo devolvido com orientações da revisão.")) }} />)}</div> : !error && <div className="empty-state"><h3>{view === "review" ? (en ? "No articles awaiting review." : "Nenhum artigo aguardando revisão.") : (en ? "What have you learned lately?" : "O que você aprendeu por aí?")}</h3><p>{view === "review" ? (en ? "New submissions will appear here." : "Novas solicitações aparecerão aqui.") : (en ? "Share a project, a tool or a lesson in your first article." : "Compartilhe um projeto, uma ferramenta ou um aprendizado no seu primeiro artigo.")}</p></div>}
    </>}
  </div>
}
