import { useEffect, useState } from "react"
import { posts } from "@/data/posts"
import { api, ApiError, errorMessage, type Attachment, type BlogPost, type PostSection } from "@/lib/api"
import type { Locale } from "@/lib/i18n"

export type BlogArticle = {
  id: string
  title: string
  excerpt: string
  category: string
  readTime: string
  projectId: string | null
  sections: PostSection[]
  authorName: string
  publishedAt: string | null
  attachments: Attachment[]
}
const seedArticles: Record<Locale, BlogArticle[]> = {
  pt: posts.pt.map(post => ({ ...post, authorName: "GerminAI", publishedAt: null, attachments: [] })),
  en: posts.en.map(post => ({ ...post, authorName: "GerminAI", publishedAt: null, attachments: [] })),
}

function publishedArticle(post: BlogPost, locale: Locale): BlogArticle {
  const words = post.sections.reduce((total, section) => total + section.paragraphs.reduce((count, text) => count + text.split(/\s+/).length, 0), 0)
  const minutes = Math.max(1, Math.ceil(words / 200))
  return { id: post.slug, title: post.title, excerpt: post.excerpt, category: post.category, projectId: post.projectId, sections: post.sections, authorName: post.authorName, publishedAt: post.publishedAt, attachments: post.attachments, readTime: locale === "en" ? `${minutes} min read` : `${minutes} min de leitura` }
}

export function usePublishedPosts(locale: Locale) {
  const [state, setState] = useState<{ locale: Locale; articles: BlogArticle[]; error: string | null; loading: boolean }>({ locale, articles: seedArticles[locale], error: null, loading: true })
  useEffect(() => {
    const controller = new AbortController()
    setState({ locale, articles: seedArticles[locale], error: null, loading: true })
    api<{ posts: BlogPost[] }>(`/posts?locale=${locale}`, { signal: controller.signal }).then(data => {
      setState({ locale, articles: [...data.posts.map(post => publishedArticle(post, locale)), ...seedArticles[locale]], error: null, loading: false })
    }).catch(error => {
      if (!controller.signal.aborted) setState({ locale, articles: seedArticles[locale], error: errorMessage(error), loading: false })
    })
    return () => controller.abort()
  }, [locale])
  return state.locale === locale ? state : { locale, articles: seedArticles[locale], error: null, loading: true }
}

export function useArticle(locale: Locale, slug: string | undefined) {
  const seed = seedArticles[locale].find(article => article.id === slug)
  const key = `${locale}/${slug}`
  const [state, setState] = useState<{ key: string; article?: BlogArticle; error: string | null; loading: boolean }>({ key, article: seed, error: null, loading: !seed })
  useEffect(() => {
    if (seed) { setState({ key, article: seed, error: null, loading: false }); return }
    const controller = new AbortController()
    setState({ key, error: null, loading: true })
    api<{ post: BlogPost }>(`/posts/${encodeURIComponent(slug || "")}?locale=${locale}`, { signal: controller.signal }).then(data => {
      setState({ key, article: publishedArticle(data.post, locale), error: null, loading: false })
    }).catch(error => {
      if (!controller.signal.aborted) setState({ key, error: error instanceof ApiError && error.status === 404 ? null : errorMessage(error), loading: false })
    })
    return () => controller.abort()
  }, [key, locale, slug, seed])
  return state.key === key ? state : { key, article: seed, error: null, loading: !seed }
}
