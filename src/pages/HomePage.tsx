import { ArrowRight, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { Button, ParticleField, SectionBand, SectionHeading, Surface } from "@germinai/design-system"
import ProjectCard from "@/components/ProjectCard"
import { ecosystem } from "@/data/ecosystem"
import { pagePath, type Locale } from "@/lib/i18n"

const copy = {
  pt: {
    title: "IA não é", titleEnd: "para poucos.",
    intro: "Aprender, construir e compartilhar. Somos estudantes do Instituto J&F tornando a inteligência artificial mais acessível — dentro e fora da sala de aula.",
    primary: "Explore nossos projetos", secondary: "Conheça o GerminAI", company: "Empresa júnior independente", community: "Feita por estudantes do ensino médio",
    overviewTitle: "Aprendemos juntos.\nO conhecimento vai além.", overviewBody: "Reunimos ferramentas, projetos e descobertas para que mais pessoas possam entender a IA, usá-la com critério e criar com autonomia.",
    originTitle: "Do Instituto J&F.\nPara novas possibilidades.", originBody: "Nossa formação conecta negócios, finanças e tecnologia. O GerminAI é uma iniciativa independente de estudantes desse ambiente: aprender na prática e compartilhar o que descobrimos.", originLink: "De onde viemos",
    projectsTitle: "Aprender também é construir.", projectsBody: "Do agente no terminal à memória para IA. Conheça o que estamos colocando em prática.", allProjects: "Todos os projetos",
    contactTitle: "O conhecimento cresce\nquando é compartilhado.", contactBody: "Crie sua conta ou entre na comunidade. Estudantes e integrantes com e-mail institucional verificado podem enviar contribuições para o blog; cada texto passa por revisão antes da publicação.", contactLink: "Criar conta ou entrar",
  },
  en: {
    title: "AI belongs", titleEnd: "to everyone.",
    intro: "Learn, build and share. We are students at Instituto J&F making artificial intelligence more accessible — in the classroom and beyond.",
    primary: "Explore our projects", secondary: "Meet GerminAI", company: "Independent junior enterprise", community: "Built by high-school students",
    overviewTitle: "We learn together.\nKnowledge goes further.", overviewBody: "We bring tools, projects and discoveries together so more people can understand AI, use it thoughtfully and build independently.",
    originTitle: "From Instituto J&F.\nTowards new possibilities.", originBody: "Our education connects business, finance and technology. GerminAI is an independent initiative by students from this environment: learning by doing and sharing what we discover.", originLink: "Where we come from",
    projectsTitle: "Learning means building, too.", projectsBody: "From a coding agent in the terminal to persistent AI memory. Explore what we are putting into practice.", allProjects: "All projects",
    contactTitle: "Knowledge grows\nwhen we share it.", contactBody: "Create an account or join the community. Students and members with a verified institutional email can submit blog contributions; every article is reviewed before publication.", contactLink: "Create an account or sign in",
  },
}

export default function HomePage({ locale }: { locale: Locale }) {
  const t = copy[locale]
  return (
    <div className="home-page">
      <section className="hero" aria-labelledby="hero-title">
        <div className="container-shell">
          <div className="hero-layout">
            <div className="hero-copy"><h1 id="hero-title" className="hero-heading">{t.title}<br /><span>{t.titleEnd}</span></h1><p className="body-copy hero-description">{t.intro}</p><div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start"><Button asChild className="h-12 px-5 text-xs"><Link to={pagePath(locale, "projects")}>{t.primary}<ArrowRight aria-hidden="true" /></Link></Button><Button asChild variant="ghost" className="h-12 px-4 text-xs text-neutral-300"><Link to={pagePath(locale, "institute")}>{t.secondary}<ArrowRight aria-hidden="true" /></Link></Button></div></div>
            <div className="hero-art" aria-hidden="true"><ParticleField /><img src="/images/brand-mark.webp" width="505" height="338" className="hero-symbol" alt="" fetchPriority="high" /></div>
          </div>
          <div className="hero-bottom"><strong>{t.company}</strong><span>{t.community}</span></div>
        </div>
      </section>
      <SectionBand className="public-band home-overview" tone="soft" aria-labelledby="overview-title">
        <div className="container-shell grid gap-10 md:grid-cols-2 md:gap-16">
          <div><SectionHeading id="overview-title" title={<span className="whitespace-pre-line">{t.overviewTitle}</span>} description={t.overviewBody} /><Link className="text-link" to={pagePath(locale, "institute")}>{t.secondary}<ArrowRight className="size-4" aria-hidden="true" /></Link></div>
          <Surface className="origin-preview-surface">
            <Link to={`${pagePath(locale, "institute")}#onde-somos`} className="origin-preview">
              <div className="home-institution-logo"><img src="/images/instituto-jef.png" alt="Instituto J&F" loading="lazy" /></div>
              <h3 className="whitespace-pre-line">{t.originTitle}</h3><p>{t.originBody}</p>
              <span className="text-link">{t.originLink}<ArrowRight className="size-4" aria-hidden="true" /></span>
            </Link>
          </Surface>
        </div>
      </SectionBand>
      <SectionBand className="public-band" tone="raised" aria-labelledby="home-projects-title">
        <div className="container-shell">
          <SectionHeading id="home-projects-title" title={t.projectsTitle} description={t.projectsBody} action={<Link className="text-link" to={pagePath(locale, "projects")}>{t.allProjects}<ArrowRight className="size-4" aria-hidden="true" /></Link>} />
          <div className="grid gap-4 md:grid-cols-2">{ecosystem[locale].projects.map(project => <ProjectCard key={project.id} project={project} locale={locale} compact />)}</div>
        </div>
      </SectionBand>
      <SectionBand className="public-band" tone="soft" aria-labelledby="community-title">
        <div className="container-shell">
          <Surface className="community-invitation">
            <SectionHeading id="community-title" title={<span className="whitespace-pre-line">{t.contactTitle}</span>} description={t.contactBody} />
            <Button asChild className="h-12 shrink-0 px-5 text-xs"><Link to={locale === "pt" ? "/pt/entrar" : "/en/login"}><Users aria-hidden="true" />{t.contactLink}<ArrowRight aria-hidden="true" /></Link></Button>
          </Surface>
        </div>
      </SectionBand>
    </div>
  )
}
