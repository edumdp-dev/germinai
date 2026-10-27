import { PageIntro, SectionBand, SectionHeading } from "@germinai/design-system"
import ResourceCard from "@/components/ResourceCard"
import { ecosystem } from "@/data/ecosystem"
import type { Locale } from "@/lib/i18n"

const content = {
  pt: {
    title: "Ferramentas e plataformas.",
    description: "Uma seleção para programar com IA, organizar o trabalho com agentes e acompanhar os modelos. Conheça as ferramentas e forme seu próprio critério.",
    toolsTitle: "Ferramentas para construir.",
    toolsDescription: "Três ferramentas em que confiamos para pensar, programar e trabalhar com agentes de inteligência artificial.",
    platformsTitle: "Plataformas no nosso radar.",
    platformsDescription: "Compare modelos, acompanhe análises e experimente respostas. Diferentes perspectivas ajudam a escolher a IA para cada contexto.",
    curation: "Uma seleção do GerminAI. Os links levam às páginas dos criadores de cada ferramenta.",
  },
  en: {
    title: "Tools & platforms.",
    description: "A selection for coding with AI, organizing work with agents and keeping up with models. Explore the tools and develop your own judgment.",
    toolsTitle: "Tools for building.",
    toolsDescription: "Three tools we trust for thinking, coding and working with artificial intelligence agents.",
    platformsTitle: "Platforms on our radar.",
    platformsDescription: "Compare models, follow analyses and try out responses. Different perspectives help you choose the right AI for each context.",
    curation: "Curated by GerminAI. Each link takes you to the tool’s own website.",
  },
}

export default function ResourcesPage({ locale }: { locale: Locale }) {
  const copy = content[locale]
  const { tools, platforms } = ecosystem[locale]

  return (
    <div className="resources-page">
      <PageIntro title={copy.title} description={copy.description} />

      <SectionBand className="public-band public-band-first" tone="soft" aria-labelledby="tools-title">
        <div className="container-shell">
          <SectionHeading id="tools-title" title={copy.toolsTitle} description={copy.toolsDescription} />
          <div className="grid gap-4 md:grid-cols-3">
            {tools.map(resource => <ResourceCard key={resource.id} resource={resource} locale={locale} />)}
          </div>
          <p className="mt-6 max-w-2xl text-xs leading-6 text-neutral-500">{copy.curation}</p>
        </div>
      </SectionBand>

      <SectionBand className="public-band" tone="raised" aria-labelledby="platforms-title">
        <div className="container-shell">
          <SectionHeading id="platforms-title" title={copy.platformsTitle} description={copy.platformsDescription} />
          <div className="grid gap-4 md:grid-cols-2">
            {platforms.map(resource => <ResourceCard key={resource.id} resource={resource} locale={locale} />)}
          </div>
        </div>
      </SectionBand>
    </div>
  )
}
