import { useEffect } from "react"
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { Button } from "@germinai/design-system"
import { posts } from "@/data/posts"
import { ecosystem } from "@/data/ecosystem"
import { articlePath, pagePath, type Locale } from "@/lib/i18n"
import { PageIntro } from "@germinai/design-system"
import { useArticle } from "@/lib/blog"

export default function ArticlePage({ locale }: { locale: Locale }) {
  const { id } = useParams()
  const en = locale === "en"
  const { article: post, error, loading } = useArticle(locale, id)

  useEffect(() => {
    if (loading) return
    const title = post?.title || (error ? (en ? "Article unavailable" : "Artigo indisponível") : (en ? "Article not found" : "Artigo não encontrado"))
    document.title = `${title} — GerminAI`
    const description = post?.excerpt || (en ? "Explore the GerminAI blog." : "Explore o blog do GerminAI.")
    document.querySelector('meta[name="description"]')?.setAttribute("content", description)
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", document.title)
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", description)
    document.querySelector('meta[property="og:type"]')?.setAttribute("content", post ? "article" : "website")
  }, [post, error, loading, en])

  if (loading) return <PageIntro title={en ? "Opening article…" : "Abrindo artigo…"} description={en ? "Loading the published article." : "Carregando o artigo publicado."} />
  if (!post) return <><PageIntro title={error ? (en ? "This article is unavailable." : "Este artigo está indisponível.") : (en ? "Article not found." : "Artigo não encontrado.")} description={error || (en ? "This article is not in our collection. Explore the blog to find something to read." : "Este artigo não está na nossa coleção. Explore o blog para encontrar uma leitura.")} /><div className="container-shell pb-24"><Button asChild><Link to={pagePath(locale, "blog")}>{en ? "Back to the blog" : "Voltar ao blog"}<ArrowRight aria-hidden="true" /></Link></Button></div></>

  const project = ecosystem[locale].projects.find(item => item.id === post.projectId)
  const related = posts[locale].filter(item => item.id !== post.id)
  return (
    <article className="article-page container-shell">
      <Link to={pagePath(locale, "blog")} className="text-link mb-9"><ArrowLeft className="size-4" aria-hidden="true" />{en ? "All articles" : "Todos os artigos"}</Link>
      <header className="article-header"><p className="editorial-eyebrow">{post.category}</p><h1>{post.title}</h1><p>{post.excerpt}</p><div className="article-metadata"><span>{post.authorName}</span><span>{post.readTime}</span>{post.publishedAt && <time dateTime={post.publishedAt}>{new Intl.DateTimeFormat(en ? "en" : "pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(post.publishedAt))}</time>}</div></header>
      <div className="article-layout">
        <div className="article-body">
          {post.sections.map((section, index) => <section id={`section-${index + 1}`} key={index}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph, at) => <p key={at}>{paragraph}</p>)}</section>)}
          {project && <div className="article-source"><p>{en ? "Explore the source project and its documentation." : "Conheça o projeto original e sua documentação."}</p><Button asChild variant="outline" className="mt-3 h-11 text-xs"><a href={project.url} target="_blank" rel="noopener noreferrer">{en ? "View the project on GitHub" : "Ver o projeto no GitHub"}<ArrowUpRight aria-hidden="true" /><span className="sr-only">{en ? " (new tab)" : " (nova aba)"}</span></a></Button></div>}
        </div>
        <aside className="article-sidebar"><nav aria-label={en ? "On this page" : "Neste artigo"}><p>{en ? "On this page" : "Neste artigo"}</p>{post.sections.map((section, index) => <a key={index} href={`#section-${index + 1}`}>{section.heading}</a>)}</nav></aside>
      </div>
      <div className="related-articles"><h2>{en ? "Keep reading." : "Continue a leitura."}</h2>{related.map(item => <Link key={item.id} to={articlePath(locale, item.id)} className="text-link">{item.title}<ArrowRight className="size-4 shrink-0" aria-hidden="true" /></Link>)}</div>
    </article>
  )
}
