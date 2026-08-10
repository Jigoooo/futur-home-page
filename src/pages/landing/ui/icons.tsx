import { Check, type LucideIcon } from 'lucide-react';

import type { IconName } from '../model/types';

interface IconProps {
  name: IconName;
}

const ICONS: Record<IconName, LucideIcon> = {
  check: Check,
};

export function Icon({ name }: IconProps) {
  const Component = ICONS[name];
  return <Component aria-hidden='true' />;
}
