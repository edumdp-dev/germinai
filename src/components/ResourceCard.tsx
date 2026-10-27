import { ResourceCard as DesignResourceCard } from "@germinai/design-system"
import type { EcosystemResource } from "@/data/ecosystem"
import type { Locale } from "@/lib/i18n"

export default function ResourceCard({ resource, locale }: { resource: EcosystemResource; locale: Locale }) {
  const lightTile = ["tern", "artificial-analysis", "arena"].includes(resource.id)
  return <DesignResourceCard
    name={resource.name}
    subtitle={resource.subtitle}
    description={resource.description}
    url={resource.url}
    className={lightTile ? "resource-light" : undefined}
    logo={<img src={resource.logo} width="32" height="32" alt="" loading="lazy" />}
    newTabLabel={locale === "en" ? "visit website (new tab)" : "visitar site (nova aba)"}
  />
}
