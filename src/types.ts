export type ThemeColor = 'slate' | 'zinc' | 'emerald' | 'indigo' | 'amber' | 'rose';

export interface CalculatorConfig {
  title: string;
  theme: ThemeColor;
  darkMode: boolean;
  showHistory: boolean;
  showScientific: boolean;
  soundEnabled: boolean;
  precision: number;
  roundedKeys: boolean;
  layout: 'standard' | 'compact' | 'expanded';
}

export interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

export interface ProjectFile {
  name: string;
  path: string;
  language: string;
  content: string;
}

export type ProjectStatus = 'draft' | 'published';

export interface Project {
  id: string;
  slug: string;
  name: string;
  prompt: string;
  createdAt: string;
  updatedAt: string;
  type: 'calculator' | 'todo' | 'unit-converter' | 'notes' | 'financial';
  config: CalculatorConfig;
  files: ProjectFile[];
  status: ProjectStatus;
  publishedAt?: string;
  version: number;
  promptHistory: Array<{
    prompt: string;
    timestamp: string;
    version?: number;
    configSnapshot?: CalculatorConfig;
  }>;
}

export interface GenerationStep {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface UserCredits {
  total: number;
  remaining: number;
  plan: 'free' | 'pro';
  lastRefill: string;
}

export interface AppTemplate {
  id: string;
  name: string;
  category: string;
  badge: string;
  badgeColor: string;
  description: string;
  prompt: string;
  iconName: string;
  defaultConfig: Partial<CalculatorConfig>;
}
