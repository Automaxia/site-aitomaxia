/**
 * Conteúdo das páginas de serviço. Cada entrada vira uma rota (/slug),
 * entra no sitemap e no pré-render. Ao criar uma nova, adicione também
 * o slug em src/sitemap.xml e em PRERENDER_ROUTES (scripts/prerender.mjs).
 */
export interface SecaoServico {
  titulo: string;
  paragrafos?: string[];
  itens?: { titulo: string; texto: string }[];
}

export interface Servico {
  slug: string;
  /** Nome curto, usado em menus e links. */
  nome: string;
  /** <title> da página. */
  tituloSeo: string;
  /** meta description (até ~155 caracteres). */
  descricaoSeo: string;
  h1: string;
  intro: string;
  secoes: SecaoServico[];
  tecnologias: string[];
}

export const SERVICOS: Servico[] = [
  {
    slug: 'automacao-de-processos-rpa',
    nome: 'Automação de processos (RPA)',
    tituloSeo: 'Automação de Processos e RPA | Automaxia',
    descricaoSeo: 'Hiperautomação com RPA e IA: descobrimos quais processos automatizar e colocamos robôs para fazer o trabalho repetitivo e burocrático da sua empresa.',
    h1: 'Automação de processos com RPA e hiperautomação',
    intro: 'Deixe o trabalho repetitivo e burocrático com os robôs e libere sua equipe para o que exige inteligência humana. '
      + 'A Automaxia identifica os processos com maior potencial de automação e os coloca para rodar com RPA, '
      + 'inteligência artificial e integração de dados.',
    secoes: [
      {
        titulo: 'Como trabalhamos',
        itens: [
          {
            titulo: 'Descoberta e mineração de processos',
            texto: 'Mapeamos a operação para identificar e classificar os processos com maior potencial de automação, '
              + 'com uma metodologia testada no mercado.',
          },
          {
            titulo: 'Automação com RPA',
            texto: 'Desenvolvemos robôs de software que executam tarefas em sistemas, planilhas, portais e e-mails, '
              + 'do mesmo jeito que uma pessoa faria, só que sem pausa.',
          },
          {
            titulo: 'Hiperautomação',
            texto: 'Combinamos RPA, inteligência artificial e processamento de dados para automatizar etapas que exigem '
              + 'leitura de documentos, decisões e integração entre sistemas.',
          },
          {
            titulo: 'Operação e escala',
            texto: 'Acompanhamos os robôs em produção e ajustamos conforme a demanda muda, para a automação continuar '
              + 'entregando resultado.',
          },
        ],
      },
      {
        titulo: 'Soluções próprias',
        itens: [
          {
            titulo: 'Automaxia RPA',
            texto: 'Plataforma de hiperautomação que combina tecnologias de automação, inteligência artificial e '
              + 'processamento de dados para automatizar, otimizar e escalar processos.',
          },
          {
            titulo: 'Botfarm',
            texto: 'Fazenda de robôs para otimizar operações, reduzir custos e melhorar a experiência do cliente, '
              + 'mantendo a operação ágil quando a demanda dos robôs muda.',
          },
        ],
      },
    ],
    tecnologias: ['Python', 'Apache Airflow', 'Microsoft', 'Amazon Web Services'],
  },
  {
    slug: 'atendimento-whatsapp-com-ia',
    nome: 'Atendimento com IA no WhatsApp',
    tituloSeo: 'Atendimento com IA no WhatsApp e Instagram | Automaxia',
    descricaoSeo: 'Automatize o primeiro atendimento no WhatsApp e no Instagram com IA generativa: triagem, coleta de dados, agendamentos e integração com seus sistemas.',
    h1: 'Primeiro atendimento com IA no WhatsApp e no Instagram',
    intro: 'Automatizamos o primeiro contato com seus clientes usando IA generativa integrada ao WhatsApp Business '
      + 'e ao Instagram. O assistente faz a triagem, coleta os dados e conversa com os seus sistemas internos, '
      + 'para acelerar agendamentos, cadastros e respostas a perguntas frequentes.',
    secoes: [
      {
        titulo: 'O que o assistente faz',
        itens: [
          {
            titulo: 'Triagem',
            texto: 'Entende o que o cliente precisa e direciona a conversa para o fluxo certo ou para a pessoa certa da equipe.',
          },
          {
            titulo: 'Coleta de dados',
            texto: 'Pede e organiza as informações necessárias para o atendimento, sem formulários longos.',
          },
          {
            titulo: 'Integração com seus sistemas',
            texto: 'Consulta e registra informações nos sistemas internos para fazer agendamentos e cadastros na própria conversa.',
          },
          {
            titulo: 'Perguntas frequentes',
            texto: 'Responde às dúvidas mais comuns com IA generativa, a qualquer hora.',
          },
        ],
      },
      {
        titulo: 'Talkcare.ai',
        paragrafos: [
          'O Talkcare.ai é o assistente inteligente de atendimento da Automaxia. A plataforma integra IA generativa, '
          + 'RPA e mensageria para automatizar o primeiro contato com clientes em canais como WhatsApp e Instagram.',
        ],
      },
    ],
    tecnologias: ['OpenAI', 'LangChain', 'LangGraph', 'Python'],
  },
  {
    slug: 'agentes-de-ia',
    nome: 'Agentes de IA',
    tituloSeo: 'Agentes de IA para Empresas | Automaxia',
    descricaoSeo: 'Agentes de IA que executam tarefas autônomas ou colaborativas nos processos da sua empresa, combinando IA generativa, machine learning e automação.',
    h1: 'Agentes de IA para os processos da sua empresa',
    intro: 'Agentes de IA executam tarefas de forma autônoma ou em colaboração com a sua equipe. Eles combinam '
      + 'IA generativa, machine learning e automação para dar escala, velocidade e inteligência à operação.',
    secoes: [
      {
        titulo: 'CortexAI: fazenda de agentes de IA',
        paragrafos: [
          'O CortexAI é o ambiente da Automaxia dedicado à criação, orquestração e operação de múltiplos agentes '
          + 'inteligentes prontos para uso, que executam tarefas autônomas ou colaborativas em processos de negócio.',
        ],
        itens: [
          {
            titulo: 'Criação',
            texto: 'Desenhamos cada agente para uma tarefa de negócio definida, com acesso apenas aos dados e sistemas de que precisa.',
          },
          {
            titulo: 'Orquestração',
            texto: 'Coordenamos vários agentes trabalhando juntos, cada um com seu papel no processo.',
          },
          {
            titulo: 'Operação',
            texto: 'Mantemos os agentes rodando e acompanhamos o resultado em produção.',
          },
        ],
      },
    ],
    tecnologias: ['OpenAI', 'LangChain', 'LangGraph', 'H2O.ai', 'Python'],
  },
  {
    slug: 'dados-bi-e-inteligencia-artificial',
    nome: 'Dados, BI e IA',
    tituloSeo: 'Dados, Business Intelligence e Inteligência Artificial | Automaxia',
    descricaoSeo: 'Pipelines de dados, business intelligence, dashboards gerados por IA e modelos de machine learning para transformar seus dados em decisões.',
    h1: 'Dados, business intelligence e inteligência artificial',
    intro: 'Sem modismos: usamos as melhores tecnologias para que os dados que a sua empresa coleta e gera '
      + 'virem decisões. Da ingestão dos dados ao modelo de IA em produção.',
    secoes: [
      {
        titulo: 'O que fazemos',
        itens: [
          {
            titulo: 'Pipelines de dados',
            texto: 'Integramos, tratamos e organizamos os dados das suas fontes para que fiquem prontos para análise.',
          },
          {
            titulo: 'Business intelligence',
            texto: 'Painéis e indicadores para acompanhar a operação e encontrar oportunidades.',
          },
          {
            titulo: 'Dashboards generativos',
            texto: 'Usamos IA para gerar gráficos automaticamente e extrair insights, com painéis que se adaptam às necessidades do negócio.',
          },
          {
            titulo: 'Modelos de IA',
            texto: 'Desenvolvemos e colocamos em produção modelos de machine learning e IA generativa.',
          },
        ],
      },
      {
        titulo: 'Soluções próprias',
        itens: [
          {
            titulo: 'DataVibe AI',
            texto: 'Plataforma que permite que qualquer pessoa, com ou sem experiência técnica, desenvolva modelos de IA. '
              + 'Com interface guiada por IA generativa, conduz todas as etapas, da ingestão de dados à explicabilidade.',
          },
          {
            titulo: 'Botanalytics (Datalake)',
            texto: 'Módulo de análise que reúne práticas e tecnologias para que os dados da sua organização sejam usados '
              + 'para otimizar operações e impulsionar o crescimento.',
          },
        ],
      },
    ],
    tecnologias: ['Python', 'Apache Airflow', 'H2O.ai', 'Amazon Web Services', 'Microsoft'],
  },
  {
    slug: 'lgpd-e-governanca-de-dados',
    nome: 'LGPD e governança de dados',
    tituloSeo: 'LGPD e Governança de Dados | Automaxia',
    descricaoSeo: 'Governança, integração e privacidade de dados conforme a LGPD, como base para projetos de automação e inteligência artificial seguros.',
    h1: 'LGPD e governança de dados',
    intro: 'Projetos de automação e de inteligência artificial dependem de dados bem cuidados. Somos especialistas '
      + 'em governança, integração e enriquecimento de dados, além de cuidar da segurança e da privacidade '
      + 'das suas informações, de acordo com a LGPD.',
    secoes: [
      {
        titulo: 'O que fazemos',
        itens: [
          {
            titulo: 'Governança de dados',
            texto: 'Definimos onde estão os dados, quem é responsável por eles e como podem ser usados.',
          },
          {
            titulo: 'Integração e enriquecimento',
            texto: 'Conectamos as fontes de dados da empresa e melhoramos a qualidade da informação.',
          },
          {
            titulo: 'Privacidade e LGPD',
            texto: 'Ajudamos a adequar o tratamento de dados pessoais à Lei Geral de Proteção de Dados, '
              + 'inclusive dentro de automações e modelos de IA.',
          },
          {
            titulo: 'Segurança da informação',
            texto: 'Aplicamos controles de acesso e boas práticas para proteger os dados em todas as etapas.',
          },
        ],
      },
    ],
    tecnologias: ['Python', 'Apache Airflow', 'Microsoft', 'Amazon Web Services'],
  },
];

export const SERVICOS_POR_SLUG: Record<string, Servico> =
  SERVICOS.reduce((acc, s) => ({ ...acc, [s.slug]: s }), {} as Record<string, Servico>);
