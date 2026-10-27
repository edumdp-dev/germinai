import { useState, type ChangeEvent, type FormEvent } from "react"
import { Button, Field, Input, PostComposer, type ComposerValue } from "@germinai/design-system"
import { api, errorMessage, type BlogPost, type SubmissionInput } from "@/lib/api"
import type { Locale } from "@/lib/i18n"


export default function PostEditor({ locale, post, onSaved, onCancel }: { locale: Locale; post?: BlogPost; onSaved: (post: BlogPost) => void; onCancel: () => void }) {
  const en = locale === "en"
  const [draft, setDraft] = useState<ComposerValue>({
    title: post?.title || "", excerpt: post?.excerpt || "", slug: post?.slug || "",
    locale: post?.locale || locale, category: post?.category || "",
    sections: post?.sections.map(section => ({ heading: section.heading, text: section.paragraphs.join("\n\n") })) || [{ heading: "", text: "" }],
  })
  const [customSlug, setCustomSlug] = useState(!!post)
  const [files, setFiles] = useState<File[]>([])
  const [removeIds, setRemoveIds] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const existingFiles = post?.attachments || []
  const kept = existingFiles.filter(file => !removeIds.includes(file.id))

  function change(next: ComposerValue) {
    if (next.slug !== draft.slug) setCustomSlug(true)
    if (next.title !== draft.title && !customSlug) next = { ...next, slug: next.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100) }
    setDraft(next)
  }

  function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || [])
    const names = new Set(kept.map(file => file.name.toLowerCase()))
    let problem: string | null = null
    if (kept.length + selected.length > 4) problem = en ? "An article can have at most four files." : "Um artigo pode ter no máximo quatro arquivos."
    for (const file of selected) {
      const name = file.name.normalize("NFC").toLowerCase()
      if (!/\.(zip|md|txt|json|pdf)$/i.test(name) || file.size < 1 || file.size > 1024 * 1024) problem = en ? "Choose valid ZIP, Markdown, TXT, JSON or PDF files, from 1 byte to 1 MiB each." : "Escolha ZIP, Markdown, TXT, JSON ou PDF válidos, de 1 byte a 1 MiB por arquivo."
      if (names.has(name)) problem = en ? "File names must be distinct. Remove the existing file before replacing it." : "Os nomes precisam ser diferentes. Remova o anexo atual antes de substituí-lo."
      names.add(name)
    }
    setError(problem)
    if (problem) event.target.value = ""
    else setFiles(selected)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const input: SubmissionInput = { title: draft.title, excerpt: draft.excerpt, slug: draft.slug, locale: draft.locale, category: draft.category, sections: draft.sections.map(section => ({ heading: section.heading.trim(), paragraphs: section.text.split(/\n\s*\n/).map(text => text.trim()).filter(Boolean) })) }
    const article = { ...input, ...(post ? { revision: post.revision } : {}), ...(removeIds.length ? { removeAttachmentIds: removeIds } : {}) }
    let body: typeof article | FormData = article
    if (files.length) {
      const form = new FormData()
      form.set("article", JSON.stringify(article))
      for (const file of files) form.append("files", file, file.name)
      body = form
    }
    try {
      const result = await api<{ post: BlogPost }>(post ? `/submissions/${post.id}` : "/submissions", { method: post ? "PATCH" : "POST", body })
      onSaved(result.post)
    } catch (failure) { setError(errorMessage(failure)) }
    finally { setBusy(false) }
  }

  return <PostComposer value={draft} onChange={change} onSubmit={submit} onCancel={onCancel} uiLocale={locale}
    heading={post ? (en ? "Edit article" : "Editar artigo") : (en ? "Propose an article" : "Propor um artigo")}
    description={en ? "The article and its files stay private until an admin approves this revision. Only the blog can be edited here." : "O artigo e seus arquivos ficam privados até um admin aprovar esta revisão. Aqui você contribui apenas com o blog."}
    busy={busy} error={error} fileControl={<div className="attachment-editor">
      <Field id="article-files" label={en ? "Files for download" : "Arquivos para download"} hint={en ? "Optional: up to four ZIP, Markdown, TXT, JSON or PDF files, 1 MiB each. Files are not virus-scanned; review them before opening." : "Opcional: até quatro ZIP, Markdown, TXT, JSON ou PDF, com 1 MiB cada. Não há varredura antivírus; revise antes de abrir."}>
        <Input type="file" multiple accept=".zip,.md,.txt,.json,.pdf" onChange={chooseFiles} />
      </Field>
      <p className="g-help" role="status">{en ? `${kept.length + files.length} of 4 files selected` : `${kept.length + files.length} de 4 arquivos selecionados`}</p>
      {(existingFiles.length > 0 || files.length > 0) && <ul className="attachment-edit-list">
        {existingFiles.map(file => {
          const removed = removeIds.includes(file.id)
          return <li key={file.id} className={removed ? "attachment-is-removed" : undefined}><span><a href={file.downloadUrl} download={file.name}>{file.name}</a><small>{(file.size / 1024).toFixed(1)} KiB</small></span><Button type="button" variant="ghost" disabled={removed && kept.length + files.length >= 4} onClick={() => setRemoveIds(current => removed ? current.filter(id => id !== file.id) : [...current, file.id])} aria-label={`${removed ? (en ? "Restore" : "Restaurar") : (en ? "Remove" : "Remover")} ${file.name}`}>{removed ? (en ? "Restore" : "Restaurar") : (en ? "Remove" : "Remover")}</Button></li>
        })}
        {files.map((file, index) => <li key={`${file.name}-${index}`}><span>{file.name}<small>{(file.size / 1024).toFixed(1)} KiB · {en ? "new" : "novo"}</small></span><Button type="button" variant="ghost" onClick={() => setFiles(current => current.filter((_, at) => at !== index))} aria-label={`${en ? "Remove" : "Remover"} ${file.name}`}>{en ? "Remove" : "Remover"}</Button></li>)}
      </ul>}
    </div>} />
}
