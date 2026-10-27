import { ArrowRight, UserRound } from "lucide-react"
import { Link } from "react-router-dom"
import { Button, FooterFrame } from "@germinai/design-system"
import { accountPath, navigation, pagePath, type Locale, type PageKey } from "@/lib/i18n"
import { useAuth } from "@/components/AuthProvider"

export default function Footer({ locale }: { locale: Locale }) {
  const en = locale === "en"
  const { user } = useAuth()
  return <FooterFrame
    className="site-footer"
    brand={<Link to={pagePath(locale, "home")} aria-label={en ? "GerminAI — home" : "GerminAI — início"}><img src="/images/brand-lockup.webp" width="909" height="219" alt="Instituto GerminAI" className="footer-logo" loading="lazy" /></Link>}
    description={en ? "Built by students. Knowledge for everyone." : "Feito por estudantes. Conhecimento para todos."}
    navigation={<nav aria-label={en ? "Footer navigation" : "Navegação do rodapé"} className="footer-navigation">{(["institute", "projects", "resources", "blog"] as PageKey[]).map(key => <Link key={key} className="footer-link" to={pagePath(locale, key)}>{navigation[locale][key]}</Link>)}</nav>}
    actions={<div><Button asChild variant="outline" className="h-11 text-xs"><Link to={accountPath(locale, user ? "account" : "login")}><UserRound aria-hidden="true" />{user ? (en ? "My account" : "Minha conta") : (en ? "Sign in / create account" : "Entrar / criar conta")}<ArrowRight aria-hidden="true" /></Link></Button><p className="mt-3 text-xs text-neutral-500">{en ? "The community, without passwords." : "A comunidade, sem senhas."}</p></div>}
    bottom={<><span>© 2026 Instituto GerminAI</span><span>{en ? "An independent student initiative at Instituto J&F." : "Uma iniciativa independente de estudantes do Instituto J&F."}</span></>}
  />
}
