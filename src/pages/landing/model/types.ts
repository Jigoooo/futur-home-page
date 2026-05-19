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

export type IconName =
  | 'api'
  | 'app'
  | 'calendar'
  | 'check'
  | 'clock'
  | 'desktop'
  | 'github'
  | 'link'
  | 'linkedin'
  | 'mail'
  | 'map'
  | 'phone'
  | 'shield'
  | 'system';

export interface ServiceItem {
  title: string;
  description: string;
  cursorText: string;
  icon: IconName;
}

export type CaseStoryKey = 'system' | 'mobile' | 'api';

export interface CaseStory {
  key: CaseStoryKey;
  tabLabel: string;
  label: string;
  title: string;
  description: string;
  icon: string;
  noteTitle: string;
  noteDescription: string;
  metrics: Array<{ value: string; label: string }>;
  items: string[];
}

export interface TeamRole {
  badge: string;
  location: string;
  experience: string;
  title: string;
  job: string;
  strength: string;
  projectExperience: string;
  tags: string[];
  cursorText: string;
}

export interface ProcessStep {
  index: string;
  title: string;
  description: string;
}

export interface ReviewItem {
  quote: string;
  person: string;
  context: string;
}

export interface ContactCheckItem {
  value: string;
  title: string;
  description: string;
  defaultChecked?: boolean;
}

export interface ContactChip {
  label: string;
  icon: IconName;
}

export interface FooterColumn {
  title: string;
  links: NavItem[];
}
