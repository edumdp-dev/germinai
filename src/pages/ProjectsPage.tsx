import { PageIntro, SectionBand } from "@germinai/design-system"
import ProjectCard from "@/components/ProjectCard"
import { ecosystem } from "@/data/ecosystem"
import type { Locale } from "@/lib/i18n"

const content = {
  pt: {
    title: "Projetos.",
    description: "Projetos de código aberto construídos por estudantes do GerminAI. Do terminal à memória de agentes, aprendemos colocando ideias em prática.",
  },
  en: {
    title: "Projects.",
    description: "Open-source projects built by GerminAI students. From the terminal to agent memory, we learn by putting ideas into practice.",
  },
}

export default function ProjectsPage({ locale }: { locale: Locale }) {
  const copy = content[locale]
  const { projects } = ecosystem[locale]

  return (
    <>
      <PageIntro title={copy.title} description={copy.description} />
      <SectionBand className="public-band public-band-first" tone="soft" aria-label={locale === "en" ? "Open-source projects" : "Projetos de código aberto"}>
        <div className="container-shell">
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map(project => <ProjectCard key={project.id} project={project} locale={locale} />)}
          </div>
        </div>
      </SectionBand>
    </>
  )
}
