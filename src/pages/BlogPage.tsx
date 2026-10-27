import { PageIntro } from "@germinai/design-system"
import PostList from "@/components/PostList"
import { ArrowRight, PenLine } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@germinai/design-system"
import { useAuth } from "@/components/AuthProvider"
import { canSubmit } from "@/lib/api"
import { usePublishedPosts } from "@/lib/blog"
import { accountPath, type Locale } from "@/lib/i18n"

export default function BlogPage({ locale }: { locale: Locale }) {
  const en = locale === "en"
  const { articles, error, loading } = usePublishedPosts(locale)
  const { user } = useAuth()
  return (
    <>
      <PageIntro title="Blog" description={en ? "Projects, tools and lessons from students building with AI. A space to share what we learn." : "Projetos, ferramentas e aprendizados de quem estuda e constrói com IA. Um espaço para compartilhar o que descobrimos."} />
      <section className="container-shell blog-index" aria-label={en ? "Articles" : "Artigos"}>
        <div className="blog-toolbar"><p className="editorial-eyebrow">{en ? "Notes from people who build" : "Registros de quem constrói"}</p><Button asChild variant="outline"><Link to={accountPath(locale, user ? "account" : "login")}><PenLine aria-hidden="true" />{canSubmit(user) ? (en ? "Propose article" : "Propor artigo") : user ? (en ? "My account" : "Minha conta") : (en ? "Sign in / create account" : "Entrar / criar conta")}</Link></Button></div>
        {error && <p className="form-message form-error" role="alert">{en ? "Could not load recent articles. " : "Não foi possível carregar os artigos recentes. "}{error}</p>}
        {loading && <p className="sr-only" role="status">{en ? "Loading recent articles" : "Carregando artigos recentes"}</p>}
        <PostList items={articles} locale={locale} />
        <div className="blog-invitation"><div><h2>{en ? "Learning is better when shared." : "Aprendizado bom é aprendizado compartilhado."}</h2><p>{en ? "Students at Instituto J&F can propose articles. Every contribution is reviewed before publication." : "Estudantes do Instituto J&F podem propor artigos. Cada contribuição passa por revisão antes de aparecer aqui."}</p></div><Link className="text-link" to={accountPath(locale, user ? "account" : "login")}>{en ? "Join the community" : "Participar da comunidade"}<ArrowRight size={16} aria-hidden="true" /></Link></div>
      </section>
    </>
  )
}
