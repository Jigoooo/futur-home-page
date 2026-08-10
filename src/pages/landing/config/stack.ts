import type { StackGroup } from '../model/types';

export const stackGroups: StackGroup[] = [
  { key: 'frontend', title: 'Frontend', items: ['React', 'TypeScript', 'TanStack', 'Vite'] },
  { key: 'interaction', title: 'Interaction', items: ['GSAP', 'CSS Modules'] },
  { key: 'server', title: 'Server', items: ['Node.js', 'TanStack Start'] },
  { key: 'quality', title: 'Quality', items: ['Playwright', 'axe-core'] },
];
