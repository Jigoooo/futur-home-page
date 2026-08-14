import type { TechnologyCapability } from '../model/types';

export const technologyCapabilities: TechnologyCapability[] = [
  {
    key: 'client',
    label: '클라이언트',
    description: '웹·모바일·데스크톱 환경에서 일관된 제품 경험을 구현합니다.',
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
    description: '서비스의 API와 데이터, 권한, 검색과 비동기 처리 구조를 설계합니다.',
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
    description:
      '검증된 AI 모델을 조직의 데이터와 업무 흐름에 연결해 검색·자동화·에이전트를 구현합니다.',
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
    description: '배포와 트래픽, 관측, 변경 이력을 관리할 수 있는 운영 환경을 구성합니다.',
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
