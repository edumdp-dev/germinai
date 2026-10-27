import { useState } from "react"
import { ArrowRight, BookOpen, Building2, FolderCode, Home, Layers3, Menu, Shield, UserRound } from "lucide-react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { Button, HeaderFrame, Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@germinai/design-system"
import { accountPath, equivalentPath, navigation, pagePath, type Locale, type PageKey } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/AuthProvider"

const entries: { key: PageKey; icon: typeof Home }[] = [
  { key: "home", icon: Home },
  { key: "institute", icon: Building2 },
  { key: "projects", icon: FolderCode },
  { key: "resources", icon: Layers3 },
  { key: "blog", icon: BookOpen },
]

const descriptions: Record<Locale, Record<PageKey, string>> = {
  pt: { home: "O que estamos construindo.", institute: "Nossa origem, missão e equipe.", projects: "Ideias que já viraram código.", resources: "Ferramentas e comparadores de IA.", blog: "Projetos, descobertas e aprendizado." },
  en: { home: "A look at what we are building.", institute: "Our roots, mission and people.", projects: "Ideas turned into code.", resources: "AI tools and model comparisons.", blog: "Projects, discoveries and learning." },
}

function LanguageSwitcher({ locale, onChoose }: { locale: Locale; onChoose?: () => void }) {
  const location = useLocation()
  return (
    <div className="language-switch" aria-label={locale === "en" ? "Website language" : "Idioma do site"}>
      {(["pt", "en"] as const).map(language => <Link key={language} lang={language === "pt" ? "pt-BR" : "en"} to={equivalentPath(location.pathname, language) + location.search + location.hash} aria-current={language === locale ? "true" : undefined} aria-label={language === "en" ? "Read in English" : "Ler em português"} onClick={() => {
        try { localStorage.setItem("germinai-language", language) } catch { /* Language URLs work even when storage is blocked. */ }
        onChoose?.()
      }}>{language.toUpperCase()}</Link>)}
    </div>
  )
}

export default function Header({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false)
  const en = locale === "en"
  const { user } = useAuth()
  return (
    <>
      <HeaderFrame className="site-header sticky top-0 z-40"
        skipLink={<a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:p-3 focus:text-black">{en ? "Skip to content" : "Pular para o conteúdo"}</a>}
        brand={<Link to={pagePath(locale, "home")} aria-label={en ? "GerminAI — home" : "GerminAI — início"} className="shrink-0"><img className="brand-lockup" src="/images/brand-lockup.webp" alt="Instituto GerminAI" width="909" height="219" /></Link>}
        navigation={<nav aria-label={en ? "Main navigation" : "Navegação principal"} className="desktop-navigation hidden lg:flex">
            {entries.map(({ key }) => <NavLink key={key} to={pagePath(locale, key)} end={key === "home"} className={({ isActive }) => cn("nav-link", isActive && "is-active")}>{navigation[locale][key]}</NavLink>)}
          </nav>}
        actions={<div className="flex items-center gap-3">
            <div className="hidden lg:block"><LanguageSwitcher locale={locale} /></div>
            {user?.role === "superadmin" && <Link to={accountPath(locale, "admin")} className="admin-shortcut" aria-label={en ? "Administration (superadmins only)" : "Administração (somente superadmins)"}><Shield size={18} strokeWidth={1.4} aria-hidden="true" /></Link>}
            <Button asChild variant="outline" className="h-10 border-white/20 px-3 text-xs"><Link to={accountPath(locale, user ? "account" : "login")}><UserRound aria-hidden="true" /><span className="hidden sm:inline">{user ? (en ? "My account" : "Minha conta") : (en ? "Sign in / sign up" : "Entrar / criar conta")}</span><span className="sr-only sm:hidden">{user ? (en ? "My account" : "Minha conta") : (en ? "Sign in / create account" : "Entrar / criar conta")}</span></Link></Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon-lg" className="lg:hidden" aria-label={en ? "Open navigation menu" : "Abrir menu de navegação"}><Menu aria-hidden="true" /></Button></SheetTrigger>
              <SheetContent showCloseButton={false} className="mobile-sidebar w-[min(400px,94vw)] overflow-y-auto">
                <SheetHeader className="shrink-0 px-7 pt-10"><div className="flex items-center justify-between gap-3"><SheetTitle className="font-display text-2xl">GerminAI</SheetTitle><Button variant="ghost" className="text-xs" onClick={() => setOpen(false)}>{en ? "Close" : "Fechar"}</Button></div><SheetDescription className="text-left text-xs leading-6">{en ? "Our institute, projects, tools and articles." : "Instituto, projetos, ferramentas e artigos."}</SheetDescription></SheetHeader>
                <nav aria-label={en ? "Mobile menu" : "Menu móvel"} className="flex shrink-0 flex-col px-4 py-2">
                  {entries.map(({ key, icon: Icon }) => <NavLink key={key} to={pagePath(locale, key)} end={key === "home"} onClick={() => setOpen(false)} className={({ isActive }) => cn("sidebar-link", isActive && "is-active")}><Icon className="size-5 shrink-0" strokeWidth={1.4} aria-hidden="true" /><span><strong>{navigation[locale][key]}</strong><small>{descriptions[locale][key]}</small></span><ArrowRight className="ml-auto size-4 shrink-0 text-neutral-600" aria-hidden="true" /></NavLink>)}
                </nav>
                <div className="mt-auto flex shrink-0 flex-col gap-4 px-7 py-7">{user?.role === "superadmin" && <Link to={accountPath(locale, "admin")} onClick={() => setOpen(false)} className="text-link"><Shield size={16} aria-hidden="true" />{en ? "Administration" : "Administração"}</Link>}<div className="flex items-center justify-between gap-4"><LanguageSwitcher locale={locale} onChoose={() => setOpen(false)} /><Link to={accountPath(locale, user ? "account" : "login")} onClick={() => setOpen(false)} className="text-link"><UserRound size={16} aria-hidden="true" />{user ? (en ? "My account" : "Minha conta") : (en ? "Sign in / sign up" : "Entrar / criar conta")}</Link></div></div>
              </SheetContent>
            </Sheet>
          </div>}
      />
      <nav className="mobile-tabs" aria-label={en ? "Quick navigation" : "Navegação rápida"}>
        {entries.map(({ key, icon: Icon }) => <NavLink key={key} to={pagePath(locale, key)} end={key === "home"} className={({ isActive }) => cn("mobile-tab", isActive && "is-active")}><Icon className="size-[19px]" strokeWidth={1.5} aria-hidden="true" /><span>{navigation[locale][key]}</span></NavLink>)}
      </nav>
    </>
  )
}
