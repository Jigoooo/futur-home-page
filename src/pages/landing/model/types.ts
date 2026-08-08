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
  | 'link'
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

export type CaseStoryKey = 'web' | 'mobile' | 'system' | 'automation';

export interface CaseStory {
  key: CaseStoryKey;
  tabLabel: string;
  label: string;
  title: string;
  description: string;
  icon: string;
  noteTitle: string;
  noteDescription: string;
  items: string[];
  tags: string[];
  stack: string[];
  artifact: {
    label: string;
    columns: string[];
    rows: Array<{ title: string; meta: string }>;
  };
}

export interface TeamRole {
  badge: string;
  title: string;
  job: string;
  strength: string;
  projectExperience: string;
  tags: string[];
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

export interface ContactChip {
  label: string;
  icon: IconName;
}

export interface FaqItem {
  question: string;
  answer: string;
}
