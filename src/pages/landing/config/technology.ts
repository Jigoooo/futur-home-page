import type { TechnologyCapability } from '../model/types';

export const technologyCapabilities: TechnologyCapability[] = [
  {
    key: 'client',
    label: '클라이언트',
    featuredTechnologies: [
      'React',
      'Next.js',
      'TanStack Start',
      'React Router Framework',
      'React Native',
      'Expo',
      'Kotlin',
      'Swift',
      'Electron',
    ],
    groups: [
      {
        label: 'Web Frameworks',
        technologies: ['React', 'Next.js', 'TanStack Start', 'React Router Framework'],
      },
      {
        label: 'Mobile & Desktop',
        technologies: ['React Native', 'Expo', 'Kotlin', 'Swift', 'Electron'],
      },
      {
        label: 'Language & Tooling',
        technologies: ['TypeScript', 'JavaScript', 'TanStack Router', 'TanStack Query', 'Vite'],
      },
      {
        label: 'Motion & Graphics',
        technologies: ['Motion', 'GSAP', 'Rive', 'Three.js'],
      },
    ],
  },
  {
    key: 'backend',
    label: '백엔드·데이터',
    featuredTechnologies: [
      'Node.js',
      'NestJS',
      'Spring Boot',
      'PostgreSQL',
      'MariaDB',
      'MongoDB',
      'Redis',
      'Elasticsearch',
    ],
    groups: [
      {
        label: 'Runtime & Frameworks',
        technologies: ['Node.js', 'NestJS', 'Spring Boot', 'Java', 'Kotlin', 'TypeScript'],
      },
      {
        label: 'API & Communication',
        technologies: ['REST API', 'OpenAPI', 'GraphQL', 'WebSocket', 'gRPC'],
      },
      {
        label: 'Database, Cache & Search',
        technologies: ['PostgreSQL', 'MariaDB', 'SQLite', 'MongoDB', 'Redis', 'Elasticsearch'],
      },
      {
        label: 'Data & Messaging',
        technologies: ['Prisma', 'JPA/Hibernate', 'Kafka', 'RabbitMQ', 'BullMQ'],
      },
    ],
  },
  {
    key: 'ai',
    label: 'AI·AX',
    featuredTechnologies: [
      'Agentic RAG',
      'Hybrid Search',
      'Reranking',
      'GraphRAG',
      'Multimodal RAG',
      'Stateful Agent Workflows',
      'AI Evals',
    ],
    groups: [
      {
        label: 'Models & Frameworks',
        technologies: ['OpenAI', 'Anthropic', 'Gemini', 'LangGraph', 'LlamaIndex'],
      },
      {
        label: 'Advanced Retrieval',
        technologies: ['Agentic RAG', 'Hybrid Search', 'Reranking', 'GraphRAG', 'Multimodal RAG'],
      },
      {
        label: 'Agent Systems',
        technologies: ['Stateful Agent Workflows', 'Human-in-the-loop', 'Model Routing & Fallback'],
      },
      {
        label: 'Reliability',
        technologies: ['AI Evals', 'LLM Observability', 'Guardrails'],
      },
    ],
  },
  {
    key: 'cloud',
    label: '클라우드·운영',
    featuredTechnologies: [
      'AWS',
      'KT Cloud',
      'Cloudflare',
      'Docker',
      'Kubernetes',
      'NGINX',
      'Terraform',
      'OpenTelemetry',
    ],
    groups: [
      {
        label: 'Cloud & Edge',
        technologies: ['AWS', 'KT Cloud', 'Cloudflare'],
      },
      {
        label: 'Container & Network',
        technologies: ['Docker', 'Kubernetes', 'NGINX'],
      },
      {
        label: 'CI/CD & Infrastructure',
        technologies: ['Jenkins', 'GitHub Actions', 'Terraform', 'Argo CD'],
      },
      {
        label: 'Observability',
        technologies: ['OpenTelemetry', 'Prometheus', 'Grafana', 'Sentry'],
      },
    ],
  },
];
