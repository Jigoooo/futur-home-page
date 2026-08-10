import {
  Check,
  Clock,
  Link as LinkIcon,
  Monitor,
  Server,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

import type { IconName } from '../model/types';

interface IconProps {
  name: IconName;
}

const ICONS: Record<IconName, LucideIcon> = {
  check: Check,
  clock: Clock,
  desktop: Monitor,
  link: LinkIcon,
  shield: ShieldCheck,
  system: Server,
};

export function Icon({ name }: IconProps) {
  const Component = ICONS[name];
  return <Component aria-hidden='true' />;
}
