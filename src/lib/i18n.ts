export type Locale = "pt" | "en"
export type PageKey = "home" | "institute" | "projects" | "resources" | "blog"

export const pageSlugs: Record<PageKey, Record<Locale, string>> = {
  home: { pt: "", en: "" },
  institute: { pt: "instituto", en: "about" },
  projects: { pt: "projetos", en: "projects" },
  resources: { pt: "recursos", en: "resources" },
  blog: { pt: "blog", en: "blog" },
}

export const navigation: Record<Locale, Record<PageKey, string>> = {
  pt: { home: "Início", institute: "Instituto", projects: "Projetos", resources: "Ferramentas", blog: "Blog" },
  en: { home: "Home", institute: "Institute", projects: "Projects", resources: "Tools", blog: "Blog" },
}

export function pagePath(locale: Locale, page: PageKey): string {
  const slug = pageSlugs[page][locale]
  return `/${locale}${slug ? `/${slug}` : ""}`
}

export function articlePath(locale: Locale, id: string): string {
  return `${pagePath(locale, "blog")}/${id}`
}

export const accountSlugs = {
  login: { pt: "entrar", en: "login" },
  account: { pt: "conta", en: "account" },
  admin: { pt: "administracao", en: "administration" },
} as const

export function accountPath(locale: Locale, destination: keyof typeof accountSlugs = "account"): string {
  return `/${locale}/${accountSlugs[destination][locale]}`
}

export function initialLocale(): Locale {
  try {
    const remembered = localStorage.getItem("germinai-language")
    if (remembered === "pt" || remembered === "en") return remembered
  } catch {
    // Browsers can block storage; language detection must still work.
  }
  const primary = navigator.languages?.[0] || navigator.language
  return primary?.toLowerCase().startsWith("en") ? "en" : "pt"
}

export function equivalentPath(pathname: string, locale: Locale): string {
  const segments = pathname.split("/").filter(Boolean)
  const source: Locale = segments[0] === "en" ? "en" : "pt"
  if (segments[1] === "blog" && segments[2]) return articlePath(locale, segments[2])
  const account = (Object.keys(accountSlugs) as (keyof typeof accountSlugs)[]).find(key => accountSlugs[key][source] === segments[1])
  if (account) return accountPath(locale, account)
  const page = (Object.keys(pageSlugs) as PageKey[]).find(key => pageSlugs[key][source] === (segments[1] || ""))
  return pagePath(locale, page || "home")
}
