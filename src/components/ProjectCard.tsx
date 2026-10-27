import { ProjectCard as DesignProjectCard } from "@germinai/design-system"
import RouterLink from "@/components/RouterLink"
import type { Project } from "@/data/ecosystem"
import { pagePath, type Locale } from "@/lib/i18n"

export default function ProjectCard({ project, locale, compact = false }: { project: Project; locale: Locale; compact?: boolean }) {
  const en = locale === "en"
  return <div id={compact ? undefined : project.id} className="project-anchor">
    <DesignProjectCard
      title={project.name}
      subtitle={project.subtitle}
      description={project.description}
      href={compact ? `${pagePath(locale, "projects")}#${project.id}` : project.url}
      tags={project.tags}
      kind={project.id === "oh-my-goat" ? "terminal" : "library"}
      compact={compact}
      actionLabel={compact ? (en ? "Explore the project" : "Conhecer o projeto") : (en ? "View on GitHub (new tab)" : "Ver no GitHub (nova aba)")}
      linkComponent={compact ? RouterLink : undefined}
      newTab={!compact}
    />
  </div>
}
