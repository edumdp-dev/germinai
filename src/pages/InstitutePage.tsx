import { ArrowUpRight, BookOpen, Cpu, Linkedin, Network } from "lucide-react"
import { FounderCard, InstitutionPanel, MissionGrid, PageIntro, SectionBand, SectionHeading } from "@germinai/design-system"
import type { Locale } from "@/lib/i18n"

const founders = [
  {
    name: "Eduardo de Paula",
    role: { pt: "CEO", en: "CEO" },
    image: "/images/eduardo.webp",
    linkedin: "https://www.linkedin.com/in/eduardomdp/",
    position: "50% 40%",
  },
  {
    name: "Enzo Neves",
    role: { pt: "CTO de Engenharia de IA e Assessor de IA", en: "CTO of AI Engineering & AI Advisor" },
    image: "/images/enzo.webp",
    linkedin: "https://www.linkedin.com/in/enzo-neves-alves-05904135b/",
    position: "50% 37%",
  },
  {
    name: "Nicolas Vlad",
    role: { pt: "CTO de Engenharia de Software e Assessor de Tecnologia", en: "CTO of Software Engineering & Tech Advisor" },
    image: "/images/nicolas.webp",
    linkedin: "https://www.linkedin.com/in/nicolas-vlad-53345b396/",
    position: "50% 42%",
  },
]

const content = {
  pt: {
    title: "Aprender é a nossa origem.",
    description: "O GerminAI é uma empresa júnior independente, liderada por estudantes do ensino médio. Reunimos aprendizado, projetos e conhecimento para tornar a inteligência artificial mais acessível.",
    originTitle: "De onde viemos.",
    originIntro: "Nos encontramos no Instituto J&F. Foi nesse ambiente de formação prática que nasceu a vontade de aprender e construir juntos.",
    institutionLink: "Conheça o Instituto J&F",
    institutionCaption: "Centro de Educação para os Negócios",
    institutionModel: "Escola · Empresa · Família",
    institutionSchools: "Escola de Negócios · Escola de Tecnologia · Escola da Fábrica",
    independent: "O GerminAI é uma iniciativa independente de estudantes. Este site não é um canal oficial do Instituto J&F e não fala em nome da instituição.",
    originParagraphs: [
      "O Instituto J&F se apresenta como um Centro de Educação para os Negócios, mantido pelo Grupo J&F. Seu modelo integra Escola, Empresa e Família e conecta o aprendizado à realidade do trabalho.",
      "Suas frentes de ensino incluem a Escola de Negócios, a Escola de Tecnologia e a Escola da Fábrica. Essa aproximação entre educação e prática é parte do contexto em que estudamos.",
      "Eduardo estuda Finanças e Tecnologia; a maioria dos integrantes está na área de Tecnologia. No GerminAI, reunimos esses caminhos para compartilhar ferramentas, projetos e descobertas sobre inteligência artificial.",
    ],
    missionTitle: "Nossa missão.",
    missionDescription: "Popularizar e democratizar o estudo, o uso e o conhecimento da inteligência artificial.",
    mission: [
      { icon: BookOpen, title: "Democratizar o estudo.", description: "Tornar a inteligência artificial acessível a quem quer aprender, independentemente do ponto de partida." },
      { icon: Cpu, title: "Popularizar o uso.", description: "Sair da teoria. Experimentar ferramentas, criar projetos e usar IA com autonomia e senso crítico." },
      { icon: Network, title: "Compartilhar o conhecimento.", description: "Transformar cada descoberta em algo que mais pessoas possam entender, aplicar e levar adiante." },
    ],
    membersTitle: "Feito por estudantes.",
    membersDescription: "Aprendemos em conjunto: estudando ferramentas, desenvolvendo projetos e compartilhando o que entendemos. Nossa formação é o ponto de partida, não um limite para quem pode aprender com a gente.",
    foundersTitle: "Os fundadores.",
    foundersDescription: "Três estudantes que reuniram a vontade de aprender e construir com inteligência artificial.",
    portrait: "Retrato de",
    linkedin: "LinkedIn de",
    newTab: "nova aba",
  },
  en: {
    title: "Learning is where we begin.",
    description: "GerminAI is an independent junior enterprise led by high-school students. We bring learning, projects and knowledge together to make artificial intelligence more accessible.",
    originTitle: "Where we come from.",
    originIntro: "We met at Instituto J&F. This practical learning environment inspired us to learn and build together.",
    institutionLink: "Discover Instituto J&F",
    institutionCaption: "A center for business education",
    institutionModel: "School · Business · Family",
    institutionSchools: "Business School · Technology School · Factory School",
    independent: "GerminAI is an independent student initiative. This website is not an official Instituto J&F channel and does not speak on behalf of the institution.",
    originParagraphs: [
      "Instituto J&F describes itself as a center for business education, supported by the J&F Group. Its model brings School, Business and Family together and connects learning with the realities of work.",
      "Its educational areas include the Business School, the Technology School and the Factory School. This connection between education and practice is part of the environment in which we study.",
      "Eduardo studies Finance and Technology; most of our members study Technology. In GerminAI, we bring these paths together to share tools, projects and discoveries about artificial intelligence.",
    ],
    missionTitle: "Our mission.",
    missionDescription: "Make learning about, using and understanding artificial intelligence more accessible and widespread.",
    mission: [
      { icon: BookOpen, title: "Open up learning.", description: "Make artificial intelligence accessible to anyone who wants to learn, whatever their starting point." },
      { icon: Cpu, title: "Bring AI into practice.", description: "Go beyond theory. Try tools, build projects and use AI with independence and critical thinking." },
      { icon: Network, title: "Share knowledge.", description: "Turn each discovery into something more people can understand, apply and build on." },
    ],
    membersTitle: "Built by students.",
    membersDescription: "We learn together by studying tools, developing projects and sharing what we understand. Our education is our starting point, not a limit on who can learn alongside us.",
    foundersTitle: "The founders.",
    foundersDescription: "Three students brought together by a shared interest in learning and building with artificial intelligence.",
    portrait: "Portrait of",
    linkedin: "LinkedIn profile of",
    newTab: "new tab",
  },
}

export default function InstitutePage({ locale }: { locale: Locale }) {
  const copy = content[locale]

  return (
    <div className="institute-page">
      <PageIntro title={copy.title} description={copy.description} />

      <SectionBand id="onde-somos" className="institute-origin public-band public-band-first" tone="soft" aria-labelledby="origin-title">
        <div className="container-shell">
          <SectionHeading id="origin-title" title={copy.originTitle} description={copy.originIntro} />
          <InstitutionPanel
            logo={<img className="institution-logo" src="/images/instituto-jef.png" alt="Instituto J&F" loading="lazy" />}
            info={<>
              <p className="institute-source-caption">{copy.institutionCaption}</p>
              <p className="institute-source-model">{copy.institutionModel}</p>
              <p className="institute-source-schools">{copy.institutionSchools}</p>
              <a className="text-link" href="https://institutojef.org.br/" target="_blank" rel="noopener noreferrer">
                {copy.institutionLink}<ArrowUpRight className="size-4" aria-hidden="true" />
                <span className="sr-only"> ({copy.newTab})</span>
              </a>
            </>}
            story={<div className="institute-origin-story">{copy.originParagraphs.map(paragraph => <p key={paragraph} className="body-copy">{paragraph}</p>)}</div>}
            footer={<p className="institute-independence">{copy.independent}</p>}
          />
        </div>
      </SectionBand>

      <SectionBand className="public-band" tone="raised" aria-labelledby="mission-title">
        <div className="container-shell">
          <SectionHeading id="mission-title" title={copy.missionTitle} description={copy.missionDescription} />
          <MissionGrid>
            {copy.mission.map(item => (
              <article key={item.title} className="institute-practice">
                <item.icon className="size-5 text-neutral-400" strokeWidth={1.3} aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </MissionGrid>
          <div className="institute-student-note">
            <SectionHeading level={3} title={copy.membersTitle} description={copy.membersDescription} />
          </div>
        </div>
      </SectionBand>

      <SectionBand className="public-band institute-founders" tone="soft" aria-labelledby="founders-title">
        <div className="container-shell">
          <SectionHeading id="founders-title" title={copy.foundersTitle} description={copy.foundersDescription} />
          <div className="grid gap-8 md:grid-cols-3">
            {founders.map(person => (
              <FounderCard
                key={person.name}
                image={<img src={person.image} alt={`${copy.portrait} ${person.name}`} width="800" height="800" loading="lazy" style={{ objectPosition: person.position }} />}
                name={person.name}
                role={person.role[locale]}
                action={<a className="founder-link" href={person.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${copy.linkedin} ${person.name} (${copy.newTab})`}>
                  <Linkedin className="size-3.5" aria-hidden="true" /> LinkedIn
                  <ArrowUpRight className="size-3" aria-hidden="true" />
                </a>}
              />
            ))}
          </div>
        </div>
      </SectionBand>
    </div>
  )
}
