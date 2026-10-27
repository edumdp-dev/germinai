import { useEffect } from "react"
import { ArrowRight } from "lucide-react"
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { PageIntro } from "@germinai/design-system"
import { Button } from "@germinai/design-system"
import HomePage from "@/pages/HomePage"
import InstitutePage from "@/pages/InstitutePage"
import ProjectsPage from "@/pages/ProjectsPage"
import ResourcesPage from "@/pages/ResourcesPage"
import BlogPage from "@/pages/BlogPage"
import ArticlePage from "@/pages/ArticlePage"
import { posts } from "@/data/posts"
import { accountSlugs, equivalentPath, initialLocale, navigation, pagePath, pageSlugs, type Locale, type PageKey } from "@/lib/i18n"
import { AuthProvider } from "@/components/AuthProvider"
import LoginPage from "@/pages/LoginPage"
import AccountPage from "@/pages/AccountPage"
import AdminPage from "@/pages/AdminPage"

const descriptions: Record<Locale, Record<PageKey, string>> = {
  pt: {
    home: "IA não é para poucos. Estudantes do Instituto J&F compartilham ferramentas, projetos e conhecimento para tornar a inteligência artificial acessível.",
    institute: "Conheça o GerminAI: uma empresa júnior com mais de 35 estudantes do Instituto J&F, sua missão e seus fundadores.",
    projects: "Projetos de código aberto do GerminAI: OhMyGoat e Alexandria for Agents. Aprendemos construindo e compartilhando.",
    resources: "Ferramentas e plataformas em que confiamos para criar com IA e comparar modelos: omp, Tern, Maestri, Artificial Analysis e Arena.",
    blog: "Artigos sobre projetos, ferramentas e aprendizados de estudantes que constroem com inteligência artificial.",
  },
  en: {
    home: "AI belongs to everyone. Students at Instituto J&F share tools, projects and knowledge to make artificial intelligence more accessible.",
    institute: "Meet GerminAI: a student-run junior enterprise with 35+ high school students at Instituto J&F, its mission and founders.",
    projects: "Open-source projects from GerminAI: OhMyGoat and Alexandria for Agents. We learn by building and sharing.",
    resources: "Tools and platforms we trust to build with AI and compare models: omp, Tern, Maestri, Artificial Analysis and Arena.",
    blog: "Articles on projects, tools and lessons from students building with artificial intelligence.",
  },
}

function DefaultEntry() {
  return <Navigate to={pagePath(initialLocale(), "home")} replace />
}

function SiteLayout({ locale }: { locale: Locale }) {
  const location = useLocation()
  const segments = location.pathname.split("/").filter(Boolean)
  const page = (Object.keys(pageSlugs) as PageKey[]).find(key => pageSlugs[key][locale] === (segments[1] || ""))
  const article = page === "blog" && segments[2] ? posts[locale].find(post => post.id === segments[2]) : undefined
  const account = (Object.keys(accountSlugs) as (keyof typeof accountSlugs)[]).find(key => accountSlugs[key][locale] === segments[1])
  const missing = !page && !account
  const accountTitles = locale === "en" ? { login: "Sign in / create account", account: "My account", admin: "Administration" } : { login: "Entrar / criar conta", account: "Minha conta", admin: "Administração" }
  const title = account ? accountTitles[account] : missing ? (locale === "en" ? "Page not found" : "Página não encontrada") : article?.title || (page === "home" ? (locale === "en" ? "AI belongs to everyone" : "IA não é para poucos") : navigation[locale][page!])
  const description = account ? (locale === "en" ? "Sign in without a password and take part in the GerminAI community." : "Entre sem senha e participe da comunidade GerminAI.") : article?.excerpt || descriptions[locale][page || "home"]

  useEffect(() => {
    document.documentElement.lang = locale === "pt" ? "pt-BR" : "en"
    document.title = `${title} — GerminAI`
    document.querySelector('meta[name="description"]')?.setAttribute("content", description)
    const canonical = `https://germinai.duds.dev${location.pathname}`
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", canonical)
    for (const [property, value] of [["og:title", document.title], ["og:description", description], ["og:url", canonical], ["og:type", article ? "article" : "website"], ["og:locale", locale === "pt" ? "pt_BR" : "en_US"]]) {
      let meta = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
      if (!meta) { meta = document.createElement("meta"); meta.setAttribute("property", property); document.head.append(meta) }
      meta.content = value
    }
    for (const language of ["pt", "en"] as const) {
      const hreflang = language === "pt" ? "pt-BR" : "en"
      let link = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${hreflang}"]`)
      if (!link) { link = document.createElement("link"); link.rel = "alternate"; link.hreflang = hreflang; document.head.append(link) }
      link.href = `https://germinai.duds.dev${equivalentPath(location.pathname, language)}`
    }
  }, [locale, location.pathname, title, description, article])

  useEffect(() => {
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.append(robots) }
    robots.content = account ? "noindex, nofollow" : "index, follow"
  }, [account])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView()
      else window.scrollTo({ top: 0, behavior: "instant" })
    })
    return () => cancelAnimationFrame(frame)
  }, [location.pathname, location.hash])

  return <><Header locale={locale} /><main id="conteudo" className="site-main" tabIndex={-1}><Outlet /></main><Footer locale={locale} /><span className="sr-only" aria-live="polite">{title}</span></>
}

function NotFoundPage({ locale }: { locale: Locale }) {
  const en = locale === "en"
  return <><PageIntro title={en ? "This page isn't here." : "Esta página não está aqui."} description={en ? "Explore our institute, projects and articles from the home page." : "Conheça o instituto, os projetos e os artigos a partir da página inicial."} /><div className="container-shell pb-24"><Button asChild><Link to={pagePath(locale, "home")}>{en ? "Back to home" : "Voltar ao início"}<ArrowRight aria-hidden="true" /></Link></Button></div></>
}

export default function App() {
  return (
    <BrowserRouter><AuthProvider>
      <Routes>
        <Route path="/" element={<DefaultEntry />} />
        {(["pt", "en"] as const).map(locale => <Route key={locale} path={locale} element={<SiteLayout locale={locale} />}>
          <Route index element={<HomePage locale={locale} />} />
          <Route path={pageSlugs.institute[locale]} element={<InstitutePage locale={locale} />} />
          <Route path={pageSlugs.projects[locale]} element={<ProjectsPage locale={locale} />} />
          <Route path={pageSlugs.resources[locale]} element={<ResourcesPage locale={locale} />} />
          <Route path="blog" element={<BlogPage locale={locale} />} />
          <Route path="blog/:id" element={<ArticlePage locale={locale} />} />
          <Route path={accountSlugs.login[locale]} element={<LoginPage locale={locale} />} />
          <Route path={accountSlugs.account[locale]} element={<AccountPage locale={locale} />} />
          <Route path={accountSlugs.admin[locale]} element={<AdminPage locale={locale} />} />
          <Route path="*" element={<NotFoundPage locale={locale} />} />
        </Route>)}
        <Route path="*" element={<Navigate to={pagePath(initialLocale(), "home")} replace />} />
      </Routes>
    </AuthProvider></BrowserRouter>
  )
}
