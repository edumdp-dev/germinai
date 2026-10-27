import type { Locale } from '@/lib/i18n';

export type EcosystemResource = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  url: string;
  logo: string;
};

export type Project = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  url: string;
  tags: string[];
};

// Descriptions draw on the linked official sites and repository READMEs.
// Inclusion does not imply a partnership or affiliation with their developers.
export const ecosystem: Record<
  Locale,
  { tools: EcosystemResource[]; platforms: EcosystemResource[]; projects: Project[] }
> = {
  pt: {
    tools: [
      {
        id: 'omp',
        name: 'omp',
        subtitle: 'Agente de programação no terminal.',
        description:
          'Agente da Stencil Labs com subagentes, planejamento e integração com servidores de linguagem e depuradores. Reúne ferramentas de desenvolvimento no terminal, com núcleo nativo em Rust.',
        url: 'https://omp.sh/',
        logo: '/images/omp.svg',
      },
      {
        id: 'tern',
        name: 'Tern',
        subtitle: 'Um espaço de trabalho no terminal.',
        description:
          'Workspace nativo em Rust da Stencil que reúne shells, omp e painéis de navegador. As sessões continuam em um processo separado da janela. O site apresenta um beta fechado, com lista de espera.',
        url: 'https://stencil.so/tern',
        logo: '/images/tern.svg',
      },
      {
        id: 'maestri',
        name: 'Maestri',
        subtitle: 'Um canvas para organizar agentes.',
        description:
          'Reúne terminais, notas e agentes de IA em um canvas infinito. Permite definir responsabilidades, conectar agentes para que se comuniquem e acompanhar o contexto do projeto em um espaço visual.',
        url: 'https://www.themaestri.app/pt-br',
        logo: '/images/maestri.webp',
      },
    ],
    platforms: [
      {
        id: 'artificial-analysis',
        name: 'Artificial Analysis',
        subtitle: 'Dados para comparar modelos de IA.',
        description:
          'Análises independentes de modelos e provedores de IA. Compare capacidade, preços, velocidade e latência para escolher de acordo com o seu caso de uso.',
        url: 'https://artificialanalysis.ai/',
        logo: '/images/artificial-analysis.svg',
      },
      {
        id: 'arena',
        name: 'Arena',
        subtitle: 'Comparações feitas pela comunidade.',
        description:
          'Experimente modelos de IA, compare respostas e vote nas que prefere. As avaliações da comunidade alimentam rankings públicos de modelos de linguagem, imagem e código.',
        url: 'https://arena.ai/',
        logo: '/images/arena.svg',
      },
    ],
    projects: [
      {
        id: 'oh-my-goat',
        name: 'OhMyGoat',
        subtitle: 'Programação com IA no terminal.',
        description:
          'Fork público independente do Oh My Pi, criado por Eduardo, com CLI ohmg, configuração em YAML e modelos preconfigurados com alternativas automáticas. Simplifica a instalação e preserva as configurações locais entre reinstalações. Não é afiliado à Stencil Labs.',
        url: 'https://github.com/edumdp-dev/oh-my-goat',
        tags: ['Agentes de código', 'Terminal', 'TypeScript', 'Código aberto'],
      },
      {
        id: 'alexandria-for-agents',
        name: 'Biblioteca de Alexandria',
        subtitle: 'Memória persistente para agentes de IA.',
        description:
          'Alexandria for Agents, criado por Neves e Nicolas Vlad, organiza contexto em notas Markdown de um vault do Obsidian. Um servidor MCP permite recuperar e salvar conhecimento, com índice SQLite para busca textual e semântica local. O vault local não garante processamento local pelo agente.',
        url: 'https://github.com/Neveslv/alexandria-for-agents/tree/main',
        tags: ['Memória para agentes', 'MCP', 'Obsidian', 'Local-first'],
      },
    ],
  },
  en: {
    tools: [
      {
        id: 'omp',
        name: 'omp',
        subtitle: 'A coding agent in your terminal.',
        description:
          'A Stencil Labs agent with subagents, planning, and integration with language servers and debuggers. It brings development tools together in the terminal, with a native Rust core.',
        url: 'https://omp.sh/',
        logo: '/images/omp.svg',
      },
      {
        id: 'tern',
        name: 'Tern',
        subtitle: 'A workspace in your terminal.',
        description:
          'A native Rust workspace from Stencil that brings together shells, omp, and browser panels. Sessions run in a process separate from the window. The website describes a closed beta with a waitlist.',
        url: 'https://stencil.so/tern',
        logo: '/images/tern.svg',
      },
      {
        id: 'maestri',
        name: 'Maestri',
        subtitle: 'A canvas for organizing agents.',
        description:
          'Brings terminals, notes, and AI agents together on an infinite canvas. Assign responsibilities, connect agents so they can communicate, and follow project context in one visual workspace.',
        url: 'https://www.themaestri.app/pt-br',
        logo: '/images/maestri.webp',
      },
    ],
    platforms: [
      {
        id: 'artificial-analysis',
        name: 'Artificial Analysis',
        subtitle: 'Data for comparing AI models.',
        description:
          'Independent analysis of AI models and providers. Compare capabilities, prices, speed, and latency to choose the right fit for your use case.',
        url: 'https://artificialanalysis.ai/',
        logo: '/images/artificial-analysis.svg',
      },
      {
        id: 'arena',
        name: 'Arena',
        subtitle: 'Community-driven comparisons.',
        description:
          'Try AI models, compare responses, and vote for the ones you prefer. Community evaluations inform public rankings of language, image, and coding models.',
        url: 'https://arena.ai/',
        logo: '/images/arena.svg',
      },
    ],
    projects: [
      {
        id: 'oh-my-goat',
        name: 'OhMyGoat',
        subtitle: 'AI-assisted coding in the terminal.',
        description:
          'An independent public fork of Oh My Pi by Eduardo, with the ohmg CLI, YAML configuration, and preconfigured models with automatic fallbacks. It simplifies installation and preserves local settings across reinstalls. It is not affiliated with Stencil Labs.',
        url: 'https://github.com/edumdp-dev/oh-my-goat',
        tags: ['Coding agents', 'Terminal', 'TypeScript', 'Open source'],
      },
      {
        id: 'alexandria-for-agents',
        name: 'Library of Alexandria',
        subtitle: 'Persistent memory for AI agents.',
        description:
          'Alexandria for Agents, created by Neves and Nicolas Vlad, organizes context in Markdown notes inside an Obsidian vault. An MCP server retrieves and saves knowledge, with a SQLite index for local full-text and semantic search. A local vault does not guarantee local processing by the agent.',
        url: 'https://github.com/Neveslv/alexandria-for-agents/tree/main',
        tags: ['Agent memory', 'MCP', 'Obsidian', 'Local-first'],
      },
    ],
  },
};
