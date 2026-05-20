import { createFileRoute } from '@tanstack/react-router';

import '../pages/landing/ui/styles/hero.module.css';
import '../pages/landing/ui/styles/landing-responsive.module.css';
import '../pages/landing/ui/styles/landing-shell.module.css';
import { LandingPage } from '@/pages/landing';

export const Route = createFileRoute('/')({
  component: LandingPage,
});
