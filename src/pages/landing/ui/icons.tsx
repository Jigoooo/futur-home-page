import {
  Braces,
  Calendar,
  Check,
  Clock,
  Link as LinkIcon,
  Mail,
  MapPin,
  Monitor,
  Phone,
  Server,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';

import type { IconName } from '../model/types';

interface IconProps {
  name: IconName;
}

const ICONS: Record<IconName, LucideIcon> = {
  api: Braces,
  app: Smartphone,
  calendar: Calendar,
  check: Check,
  clock: Clock,
  desktop: Monitor,
  link: LinkIcon,
  mail: Mail,
  map: MapPin,
  phone: Phone,
  shield: ShieldCheck,
  system: Server,
};

export function Icon({ name }: IconProps) {
  const Component = ICONS[name];
  return <Component aria-hidden='true' />;
}
