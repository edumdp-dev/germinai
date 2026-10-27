import type { Locale } from "@/lib/i18n"

export type Role = "superadmin" | "admin" | "member" | "visitor"
export type User = { id: string; email: string; name: string; role: Role; createdAt: string }
export type PostSection = { heading: string; paragraphs: string[] }
export type Attachment = { id: string; name: string; size: number; mimeType: string; sha256: string; downloadUrl: string }
export type BlogPost = {
  id: string
  slug: string
  locale: Locale
  title: string
  excerpt: string
  category: string
  authorName: string
  publishedAt: string | null
  projectId: string | null
  sections: PostSection[]
  authorId: string
  status: "pending" | "published" | "rejected"
  reviewNote: string | null
  createdAt: string
  updatedAt: string
  revision: number
  attachments: Attachment[]
}
export type SubmissionInput = Pick<BlogPost, "slug" | "locale" | "title" | "excerpt" | "category" | "sections">

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message)
    this.name = "ApiError"
  }
}

const portugueseErrors: Record<string, string> = {
  AUTH_NOT_CONFIGURED: "O acesso por e-mail ainda não foi ativado pela equipe. Falta configurar o serviço de envio.",
  EMAIL_SEND_FAILED: "Não foi possível enviar seu código. Aguarde um minuto e tente novamente. Se continuar, avise a equipe do GerminAI.",
  INVALID_EMAIL: "Informe um e-mail válido.",
  INVALID_CODE: "Código incorreto ou expirado. Confira os seis dígitos; após cinco tentativas, solicite um novo código.",
  INVALID_CHALLENGE: "O código expirou, já foi usado ou pertence a outro navegador. Solicite um novo código aqui.",
  RATE_LIMITED: "Muitas tentativas de acesso. Aguarde e tente novamente mais tarde.",
  RESEND_COOLDOWN: "Aguarde um minuto antes de pedir outro código.",
  UNAUTHENTICATED: "Entre na sua conta para continuar.",
  ORIGIN_REJECTED: "Use esta ação pelo próprio site do GerminAI.",
  SUBMISSION_FORBIDDEN: "Somente membros com e-mail institucional verificado e editores podem enviar artigos.",
  REVIEW_FORBIDDEN: "Somente admins e superadmins podem revisar artigos.",
  ROLE_FORBIDDEN: "Somente superadmins podem gerenciar permissões.",
  SLUG_TAKEN: "Esta URL já está em uso. Escolha outro endereço para o artigo.",
  INVALID_SLUG: "Use letras minúsculas, números e hífens simples na URL do artigo.",
  EDIT_CONFLICT: "O artigo mudou, já foi publicado ou não pode ser editado por você. Atualize a lista antes de editar novamente.",
  REVIEW_CONFLICT: "O artigo mudou ou já foi revisado. Atualize a lista e leia a versão atual antes de aprovar.",
  SELF_DEMOTION: "Você não pode remover seu próprio acesso de superadmin.",
  ROLE_CONFLICT: "A permissão mudou ou esta ação removeria o último superadmin. Atualize a lista.",
  LAST_SUPERADMIN: "O último superadmin não pode perder sua permissão.",
  REVIEW_NOTE_REQUIRED: "Descreva os ajustes necessários antes de devolver o artigo.",
  INVALID_INPUT: "Confira os campos: preencha texto simples, sem HTML e dentro dos limites indicados.",
  INVALID_SECTIONS: "O artigo precisa de 1 a 30 seções, com 1 a 40 parágrafos em cada.",
  BODY_TOO_LARGE: "O texto do artigo ultrapassa o limite de 80.000 caracteres.",
  FILE_TOO_LARGE: "Cada arquivo pode ter no máximo 1 MiB.",
  ATTACHMENT_LIMIT: "Um artigo pode ter no máximo quatro anexos. Remova um antes de adicionar outro.",
  INVALID_FILE_TYPE: "Envie ZIP, Markdown, TXT, JSON ou PDF válido. Arquivos de texto precisam usar UTF-8.",
  INVALID_ATTACHMENT: "Envie os anexos como arquivos, não como texto.",
  INVALID_FILENAME: "Use um nome de arquivo sem barras, caracteres de controle ou caminhos.",
  DUPLICATE_ATTACHMENT: "Já existe um anexo com esse nome. Remova o anterior se quiser substituí-lo.",
  INVALID_REMOVALS: "Os anexos mudaram ou não pertencem a este artigo. Atualize a lista antes de continuar.",
  INVALID_MULTIPART: "Não foi possível ler o envio. Confira os campos e selecione os arquivos novamente.",
  SERVICE_UNAVAILABLE: "O serviço está indisponível. Tente novamente em alguns instantes.",
  DATABASE_NOT_CONFIGURED: "A comunidade ainda está aguardando configuração pela equipe.",
  NOT_FOUND: "Este conteúdo não foi encontrado.",
}
export async function api<T>(path: string, options: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  let response: Response
  const en = document.documentElement.lang === "en"
  const multipart = options.body instanceof FormData
  try {
    response = await fetch(`/api${path}`, {
      method: options.method || "GET",
      credentials: "same-origin",
      headers: options.body === undefined || multipart ? { Accept: "application/json" } : { Accept: "application/json", "Content-Type": "application/json" },
      body: multipart ? options.body as FormData : options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error
    throw new ApiError(en ? "Could not connect to the site. Check your connection and try again." : "Não foi possível conectar ao site. Verifique sua conexão e tente novamente.", 0, "NETWORK_ERROR")
  }
  const payload = await response.json().catch(() => null)
  if (!response.ok || payload === null) {
    const message = (!en && portugueseErrors[payload?.code]) || payload?.error || (en ? "The service is unavailable. Please try again shortly." : "O serviço está indisponível. Tente novamente em alguns instantes.")
    throw new ApiError(message, response.status, payload?.code)
  }
  return payload as T
}

export function canReview(user: User | null): boolean {
  return user?.role === "admin" || user?.role === "superadmin"
}

export function canSubmit(user: User | null): boolean {
  return !!user && (canReview(user) || (user.role === "member" && user.email.split("@")[1] === "institutojef.org.br"))
}

export const roleLabels: Record<Locale, Record<Role, string>> = {
  pt: { superadmin: "Superadmin", admin: "Admin", member: "Membro", visitor: "Visitante" },
  en: { superadmin: "Superadmin", admin: "Admin", member: "Member", visitor: "Visitor" },
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Não foi possível concluir a ação. Tente novamente."
}
