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

export type ServiceCapabilityKey = 'product' | 'system' | 'ai' | 'operations';

export interface ServiceCapability {
  key: ServiceCapabilityKey;
  index: string;
  title: string;
  description: string;
  scopes: string[];
  tone: 'ice' | 'sand' | 'mint' | 'periwinkle';
}

export type TechnologyCapabilityKey = 'client' | 'backend' | 'ai' | 'cloud';

export interface TechnologyGroup {
  label: string;
  technologies: string[];
}

export interface TechnologyCapability {
  key: TechnologyCapabilityKey;
  label: string;
  description: string;
  featuredTechnologies: string[];
  groups: TechnologyGroup[];
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
