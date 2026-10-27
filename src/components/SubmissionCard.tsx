import { useState } from "react"
import { Check, Pencil, X } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@germinai/design-system"
import { api, canReview, errorMessage, type BlogPost, type User } from "@/lib/api"
import { articlePath, type Locale } from "@/lib/i18n"

export default function SubmissionCard({ post, user, locale, onEdit, onReviewed }: { post: BlogPost; user: User; locale: Locale; onEdit: (post: BlogPost) => void; onReviewed: (post: BlogPost) => void }) {
  const en = locale === "en"
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const statuses = en ? { pending: "Awaiting review", published: "Published", rejected: "Changes requested" } : { pending: "Em revisão", published: "Publicado", rejected: "Ajustes solicitados" }
  const editable = (post.authorId === user.id && post.status !== "published") || (canReview(user) && post.status === "pending")

  async function review(decision: "approve" | "reject") {
    if (decision === "reject" && !note.trim()) {
      setError(en ? "Describe what needs to change before returning the article." : "Descreva o que precisa mudar antes de devolver o artigo.")
      return
    }
    setBusy(true)
    setError(null)
    try {
      const result = await api<{ post: BlogPost }>(`/submissions/${post.id}/review`, { method: "POST", body: { decision, note: note.trim() || undefined, revision: post.revision } })
      onReviewed(result.post)
    } catch (failure) { setError(errorMessage(failure)) }
    finally { setBusy(false) }
  }

  return <article className="submission-card">
    <div className="submission-heading"><span className={`status-label status-${post.status}`}>{statuses[post.status]}</span><span className="editorial-meta">{post.locale.toUpperCase()} · {post.category}</span></div>
    <h3>{post.title}</h3><p className="submission-excerpt">{post.excerpt}</p>
    <div className="submission-byline"><span>{post.authorName}</span><span>/{post.locale}/blog/{post.slug}</span></div>
    {post.reviewNote && <p className="review-note"><strong>{en ? "Review: " : "Revisão: "}</strong>{post.reviewNote}</p>}
    <details className="submission-preview"><summary>{en ? "Read complete article" : "Ler artigo completo"}</summary><div className="submission-body">{post.sections.map((section, index) => <section key={index}><h4>{section.heading}</h4>{section.paragraphs.map((paragraph, at) => <p key={at}>{paragraph}</p>)}</section>)}</div>
      {canReview(user) && post.status === "pending" && <div className="review-controls"><label htmlFor={`review-${post.id}`}>{en ? "Review note (required when returning an article)" : "Orientação da revisão (obrigatória ao devolver)"}</label><textarea id={`review-${post.id}`} rows={3} maxLength={2000} value={note} onChange={event => setNote(event.target.value)} />{error && <p className="form-message form-error" role="alert">{error}</p>}<div className="action-row"><Button disabled={busy} onClick={() => void review("approve")}><Check aria-hidden="true" />{en ? "Approve and publish" : "Aprovar e publicar"}</Button><Button variant="outline" disabled={busy} onClick={() => void review("reject")}><X aria-hidden="true" />{en ? "Request changes" : "Solicitar ajustes"}</Button></div></div>}
    </details>
    <div className="submission-actions">{editable && <Button variant="ghost" onClick={() => onEdit(post)}><Pencil aria-hidden="true" />{en ? "Edit article" : "Editar artigo"}</Button>}{post.status === "published" && <Button variant="ghost" asChild><Link to={articlePath(post.locale, post.slug)}>{en ? "Open article" : "Abrir artigo"}</Link></Button>}</div>
  </article>
}
