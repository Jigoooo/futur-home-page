export interface NavItem {
  label: string;
  href: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface BriefStage {
  value: string;
  index: string;
  label: string;
  description: string;
}

export type IconName = 'check' | 'clock' | 'desktop' | 'link' | 'shield' | 'sparkles' | 'system';

export type ServiceKey = 'web' | 'system' | 'api' | 'ai' | 'operations';

export interface ServiceItem {
  key: ServiceKey;
  title: string;
  description: string;
  icon: IconName;
  scopes: [string, string, string];
}

export interface ServicePhase {
  key: 'build' | 'connect' | 'operate';
  index: string;
  label: 'BUILD' | 'CONNECT' | 'OPERATE';
  title: string;
  services: ServiceItem[];
}

export interface StackGroup {
  key: 'frontend' | 'interaction' | 'server' | 'quality';
  title: string;
  items: string[];
}

export interface TeamRole {
  badge: string;
  title: string;
  responsibility: string;
  tags: string[];
}

export interface OperationsPolicy {
  icon: IconName;
  title: string;
  description: string;
}

export interface ProcessStep {
  index: string;
  title: string;
  description: string;
}

export interface ContactCheckItem {
  value: string;
  title: string;
  description: string;
  defaultChecked?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}
