import type { Locale } from '@/lib/i18n';

export type Post = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  projectId: string;
  sections: {
    heading: string;
    paragraphs: string[];
  }[];
};

export const posts: Record<Locale, Post[]> = {
  pt: [
    {
      id: 'lancamento-ohmypi',
      title: 'Conheça o OhMyGoat',
      excerpt:
        'O fork de Eduardo traz o agente Oh My Pi para uma configuração própria. Entenda o comando ohmg, a instalação e um primeiro exercício de programação.',
      category: 'Projetos',
      readTime: '3 min de leitura',
      projectId: 'oh-my-goat',
      sections: [
        {
          heading: 'De Oh My Pi a OhMyGoat',
          paragraphs: [
            'Oh My Pi é o agente conhecido como omp. O projeto de Eduardo é o OhMyGoat: um fork público independente, com o comando ohmg e uma configuração própria.',
            'A distinção importa. O README do OhMyGoat credita a trajetória Pi, de Mario Zechner, seguida por Oh My Pi, de Can Bölük e Stencil Labs. Também declara que o fork não é afiliado à Stencil Labs. Conhecer essa origem ajuda a reconhecer o trabalho de cada autor e a consultar a documentação certa.',
          ],
        },
        {
          heading: 'Configuração que você pode entender',
          paragraphs: [
            'O OhMyGoat oferece um ponto de partida com modelos preconfigurados, alternativas automáticas e ajustes para sessões longas. As preferências ficam em arquivos YAML, em um diretório próprio do usuário. A instalação inicial só cria a configuração quando ela ainda não existe, preservando as escolhas locais entre reinstalações.',
            'Para quem está aprendendo, essa organização permite estudar o que existe por trás de um agente: modelo, ferramentas, instruções e contexto. O objetivo não precisa ser entregar a tarefa inteira à IA, mas entender como essas peças colaboram e quando a intervenção humana é necessária.',
          ],
        },
        {
          heading: 'Verifique antes de instalar',
          paragraphs: [
            'O repositório documenta uma instalação recomendada com verificação de procedência pelo GitHub CLI. Os instaladores verificam os arquivos por checksums e executam uma checagem de funcionamento. Há também um caminho rápido, apresentado como conveniência sem verificação independente.',
            'Essa diferença rende uma boa conversa em sala: baixar um programa não é o mesmo que conhecer sua origem. Antes de executar comandos, leia o README, entenda as permissões e consulte os requisitos atuais. Mais importante que decorar a instalação é saber onde encontrar e avaliar as instruções.',
          ],
        },
        {
          heading: 'Um primeiro exercício',
          paragraphs: [
            'Abra um projeto pequeno e peça ao agente que explique sua estrutura antes de sugerir alterações. Depois, compare a explicação com os arquivos, revise cada mudança e investigue o que você ainda não compreendeu.',
            'Assim, a ferramenta vira companhia de aprendizagem, não substituta do raciocínio. A proposta da GerminAI é aproximar mais estudantes desse repertório: experimentar, fazer perguntas e construir autonomia para usar IA com critério.',
          ],
        },
      ],
    },
    {
      id: 'lancamento-biblioteca-alexandria',
      title: 'Como a Alexandria guarda contexto',
      excerpt:
        'Notas Markdown, um índice SQLite e ferramentas MCP ajudam agentes a recuperar decisões e registrar aprendizados, sem confundir armazenamento local com inferência local.',
      category: 'Projetos',
      readTime: '3 min de leitura',
      projectId: 'alexandria-for-agents',
      sections: [
        {
          heading: 'Uma biblioteca para o projeto',
          paragraphs: [
            'A Biblioteca de Alexandria apresenta o Alexandria for Agents, criado por Neves e Nicolas Vlad: memória persistente e local-first para agentes de IA, armazenada em notas Markdown de um vault do Obsidian.',
            'A ideia é levar contexto útil de uma conversa para outra. Antes de trabalhar, o agente pode recuperar notas relevantes; depois, pode salvar um resumo conciso. Não se trata de memória humana nem de uma garantia de que a IA nunca esquecerá algo: são registros que precisam ser selecionados, consultados e revisados.',
          ],
        },
        {
          heading: 'Notas legíveis, ferramentas conectadas',
          paragraphs: [
            'As notas continuam disponíveis para leitura e edição no Obsidian. Um índice auxiliar em SQLite oferece busca textual e semântica local e pode ser reconstruído a partir dos arquivos. Na configuração padrão, a busca não exige uma chave de API.',
            'A conexão com os agentes acontece por MCP, um protocolo para disponibilizar ferramentas. O projeto oferece operações como vault_recall, para recuperar contexto, vault_write, para escrever notas, e vault_auto_save, para registrar resumos. O instalador integra clientes como Codex CLI, Cursor, Claude Code e Gemini CLI, conforme as instruções do repositório.',
          ],
        },
        {
          heading: 'Um diário de estudo consultável',
          paragraphs: [
            'Imagine uma atividade de programação em grupo: uma nota explica por que uma solução foi escolhida; outra registra um erro e como ele foi resolvido. Em uma nova conversa, essas notas podem ajudar a retomar o trabalho sem depender apenas do histórico de um chat.',
            'A prática é escrever registros curtos, separar observações de hipóteses e conferir o contexto recuperado antes de tomar uma decisão. Uma biblioteca bem cuidada começa pela qualidade do que se coloca nela.',
          ],
        },
        {
          heading: 'Memória também exige cuidado',
          paragraphs: [
            'O README orienta a não salvar senhas, tokens, cookies, arquivos de ambiente, logs brutos ou dados pessoais sensíveis. A expansão de busca por modelos remotos vem desativada por padrão. Ainda assim, um vault local não garante inferência local: o cliente de IA pode enviar o contexto a um provedor remoto. Conheça suas configurações e políticas antes de usar dados sensíveis.',
            'Para começar, consulte os requisitos no repositório, escolha uma pasta de notas e confira a conexão com vault_stats. Organizar contexto, revisar registros e proteger informações faz parte do uso responsável de agentes — e ajuda a transformar experimentação com IA em conhecimento compartilhável.',
          ],
        },
      ],
    },
  ],
  en: [
    {
      id: 'lancamento-ohmypi',
      title: 'Meet OhMyGoat',
      excerpt:
        'Eduardo’s fork gives the Oh My Pi agent its own configuration. Learn about the ohmg command, installation, and a first coding exercise.',
      category: 'Projects',
      readTime: '3 min read',
      projectId: 'oh-my-goat',
      sections: [
        {
          heading: 'From Oh My Pi to OhMyGoat',
          paragraphs: [
            'Oh My Pi is the agent known as omp. Eduardo’s project is OhMyGoat: an independent public fork, run with the ohmg command and its own configuration.',
            'The distinction matters. The OhMyGoat README credits the lineage from Pi, by Mario Zechner, to Oh My Pi, by Can Bölük and Stencil Labs. It also states that the fork is not affiliated with Stencil Labs. Understanding that history helps you recognize each author’s work and find the right documentation.',
          ],
        },
        {
          heading: 'Configuration you can understand',
          paragraphs: [
            'OhMyGoat offers a starting point with preconfigured models, automatic fallbacks, and adjustments for long sessions. Preferences live in YAML files in a dedicated user directory. Initial installation only creates the configuration if it does not already exist, preserving local choices across reinstalls.',
            'For learners, this setup is a chance to study what makes an agent work: the model, tools, instructions, and context. The goal does not have to be handing the entire task over to AI. It can be understanding how these pieces work together and when human intervention is needed.',
          ],
        },
        {
          heading: 'Verify before installing',
          paragraphs: [
            'The repository documents a recommended installation path with provenance verification through the GitHub CLI. The installers check files against checksums and run a functional check. There is also a quick path, presented as a convenience without independent verification.',
            'That difference makes a useful classroom discussion: downloading a program is not the same as knowing where it came from. Before running commands, read the README, understand the permissions, and check the current requirements. Knowing where to find and evaluate instructions matters more than memorizing the installation steps.',
          ],
        },
        {
          heading: 'A first exercise',
          paragraphs: [
            'Open a small project and ask the agent to explain its structure before suggesting changes. Then compare the explanation with the files, review every change, and investigate anything you do not yet understand.',
            'The tool becomes a learning companion rather than a substitute for reasoning. GerminAI aims to introduce more students to these practices: experimenting, asking questions, and building the independence to use AI thoughtfully.',
          ],
        },
      ],
    },
    {
      id: 'lancamento-biblioteca-alexandria',
      title: 'How Alexandria stores context',
      excerpt:
        'Markdown notes, a SQLite index, and MCP tools help agents retrieve decisions and record lessons, without confusing local storage with local inference.',
      category: 'Projects',
      readTime: '3 min read',
      projectId: 'alexandria-for-agents',
      sections: [
        {
          heading: 'A library for your project',
          paragraphs: [
            'The Library of Alexandria introduces Alexandria for Agents, created by Neves and Nicolas Vlad: persistent, local-first memory for AI agents, stored as Markdown notes in an Obsidian vault.',
            'The idea is to carry useful context from one conversation to the next. Before working, an agent can retrieve relevant notes; afterward, it can save a concise summary. This is neither human memory nor a guarantee that AI will never forget anything. These are records that need to be selected, consulted, and reviewed.',
          ],
        },
        {
          heading: 'Readable notes, connected tools',
          paragraphs: [
            'The notes remain available to read and edit in Obsidian. A supporting SQLite index provides local full-text and semantic search and can be rebuilt from the files. In the default configuration, search does not require an API key.',
            'Agents connect through MCP, a protocol for exposing tools. The project provides operations such as vault_recall to retrieve context, vault_write to write notes, and vault_auto_save to record summaries. The installer integrates clients such as Codex CLI, Cursor, Claude Code, and Gemini CLI, following the repository’s instructions.',
          ],
        },
        {
          heading: 'A study journal you can search',
          paragraphs: [
            'Imagine a group coding activity: one note explains why a solution was chosen; another records an error and how it was resolved. In a new conversation, these notes can help the group resume work without relying solely on a chat history.',
            'The practice is to write short records, separate observations from hypotheses, and check retrieved context before making a decision. A well-maintained library starts with the quality of what you put into it.',
          ],
        },
        {
          heading: 'Memory needs care, too',
          paragraphs: [
            'The README advises against saving passwords, tokens, cookies, environment files, raw logs, or sensitive personal data. Search expansion using remote models is disabled by default. Even so, a local vault does not guarantee local inference: the AI client may send context to a remote provider. Understand its settings and policies before using sensitive data.',
            'To get started, check the requirements in the repository, choose a notes folder, and verify the connection with vault_stats. Organizing context, reviewing records, and protecting information are part of responsible agent use — and help turn AI experimentation into knowledge others can use.',
          ],
        },
      ],
    },
  ],
};
