import { Project, CalculatorConfig, UserCredits, AppTemplate } from '../types';
import { generateProjectFiles } from './codeGenerator';

const STORAGE_KEY = 'prompt2app_projects';
const CREDITS_STORAGE_KEY = 'prompt2app_credits';

export const DEFAULT_CONFIG: CalculatorConfig = {
  title: 'Prompt2App Calculator',
  theme: 'indigo',
  darkMode: true,
  showHistory: true,
  showScientific: false,
  soundEnabled: false,
  precision: 4,
  roundedKeys: true,
  layout: 'standard',
};

export function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'app-' + Math.floor(Math.random() * 10000);
}

export const APP_TEMPLATES: AppTemplate[] = [
  {
    id: 'tpl-calculator',
    name: 'Modern Dark Calculator',
    category: 'Calculator',
    badge: 'Popular',
    badgeColor: 'indigo',
    description: 'Full arithmetic with tactile keypad, percentage, backspace, sound, and calculation history.',
    prompt: 'Create a sleek dark mode calculator with addition, subtraction, multiplication, division, decimal, percentage, backspace, and calculation history.',
    iconName: 'Calculator',
    defaultConfig: {
      theme: 'indigo',
      darkMode: true,
      showHistory: true,
      showScientific: false,
      precision: 4,
      soundEnabled: true,
    },
  },
  {
    id: 'tpl-scientific',
    name: 'Scientific Math Toolkit',
    category: 'Education & STEM',
    badge: 'Advanced',
    badgeColor: 'emerald',
    description: 'Expanded mathematical keypad with square root, powers, pi constant, and memory operations.',
    prompt: 'Build a scientific calculator with square root, exponents, pi, full arithmetic (+, -, ×, ÷), precision display, and collapsible history.',
    iconName: 'Binary',
    defaultConfig: {
      theme: 'emerald',
      darkMode: true,
      showHistory: true,
      showScientific: true,
      precision: 6,
      soundEnabled: false,
    },
  },
  {
    id: 'tpl-financial',
    name: 'Financial & Percentage Calc',
    category: 'Finance',
    badge: 'Business',
    badgeColor: 'amber',
    description: 'Tailored for quick percentage discounts, GST/tax calculations, tip splitting, and decimal accuracy.',
    prompt: 'Financial discount and percentage calculator with instant tax, discount percentages, clear display, and memory history.',
    iconName: 'Percent',
    defaultConfig: {
      theme: 'amber',
      darkMode: true,
      showHistory: true,
      showScientific: false,
      precision: 2,
      soundEnabled: true,
    },
  },
  {
    id: 'tpl-minimalist',
    name: 'Minimalist Slate Calculator',
    category: 'Productivity',
    badge: 'Clean UI',
    badgeColor: 'slate',
    description: 'Distraction-free, high-contrast monochrome design focused purely on rapid daily calculation.',
    prompt: 'Minimalist clean slate calculator with high-contrast keys, zero clutter, smooth click animations, and 4-decimal precision.',
    iconName: 'Sliders',
    defaultConfig: {
      theme: 'slate',
      darkMode: false,
      showHistory: true,
      showScientific: false,
      precision: 4,
      soundEnabled: false,
    },
  },
  {
    id: 'tpl-rose-pastel',
    name: 'Rose Pastel Soft Calculator',
    category: 'Design',
    badge: 'Aesthetic',
    badgeColor: 'rose',
    description: 'Vibrant modern rose-themed calculator with rounded buttons and playful tactile styling.',
    prompt: 'Build a beautiful rose pastel themed calculator with soft rounded keys, sound effects, percentage, and history log.',
    iconName: 'Sparkles',
    defaultConfig: {
      theme: 'rose',
      darkMode: true,
      showHistory: true,
      showScientific: false,
      precision: 4,
      soundEnabled: true,
    },
  },
];

export function getInitialSampleProject(): Project {
  const config = { ...DEFAULT_CONFIG };
  const name = 'Smart Financial & Basic Calculator';
  const prompt = 'Create a modern calculator app with addition, subtraction, multiplication, division, decimal, percentage, clear, backspace, history log, and dark mode.';
  const now = new Date().toISOString();

  return {
    id: 'proj_sample_01',
    slug: 'smart-calculator-demo',
    name,
    prompt,
    createdAt: now,
    updatedAt: now,
    type: 'calculator',
    config,
    files: generateProjectFiles(config, name),
    status: 'published',
    publishedAt: now,
    version: 1,
    promptHistory: [
      {
        prompt,
        timestamp: now,
      },
    ],
  };
}

export function loadSavedProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const sample = getInitialSampleProject();
      saveProjectsToStorage([sample]);
      return [sample];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const sample = getInitialSampleProject();
      saveProjectsToStorage([sample]);
      return [sample];
    }
    // Ensure backwards compatibility for slug and status
    return parsed.map((p) => ({
      ...p,
      slug: p.slug || slugify(p.name || 'app'),
      status: p.status === 'published' || p.status === 'published-demo' ? 'published' : 'draft',
      type: p.type || 'calculator',
    }));
  } catch (err) {
    console.error('Error loading projects from localStorage:', err);
    return [getInitialSampleProject()];
  }
}

export function saveProjectsToStorage(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Error saving projects to localStorage:', err);
  }
}

export function saveSingleProject(project: Project): Project[] {
  const existing = loadSavedProjects();
  const index = existing.findIndex((p) => p.id === project.id);
  const updatedProject: Project = {
    ...project,
    slug: project.slug || slugify(project.name),
    updatedAt: new Date().toISOString(),
    files: generateProjectFiles(project.config, project.name),
  };

  let nextProjects: Project[];
  if (index >= 0) {
    nextProjects = [...existing];
    nextProjects[index] = updatedProject;
  } else {
    nextProjects = [updatedProject, ...existing];
  }

  saveProjectsToStorage(nextProjects);
  return nextProjects;
}

export function deleteProjectFromStorage(id: string): Project[] {
  const existing = loadSavedProjects();
  const filtered = existing.filter((p) => p.id !== id);
  saveProjectsToStorage(filtered);
  return filtered;
}

export function duplicateProjectInStorage(id: string): { updatedList: Project[]; newProject: Project | null } {
  const existing = loadSavedProjects();
  const target = existing.find((p) => p.id === id);
  if (!target) return { updatedList: existing, newProject: null };

  const now = new Date().toISOString();
  const newProject: Project = {
    ...target,
    id: 'proj_' + Date.now(),
    name: `${target.name} (Copy)`,
    slug: slugify(`${target.name}-copy-${Date.now().toString().slice(-4)}`),
    createdAt: now,
    updatedAt: now,
    status: 'draft',
    publishedAt: undefined,
    version: 1,
  };

  const nextList = [newProject, ...existing];
  saveProjectsToStorage(nextList);
  return { updatedList: nextList, newProject };
}

// User Credits Management (Milestone 5)
const DEFAULT_CREDITS: UserCredits = {
  total: 10,
  remaining: 10,
  plan: 'free',
  lastRefill: new Date().toISOString(),
};

export function loadUserCredits(): UserCredits {
  try {
    const raw = localStorage.getItem(CREDITS_STORAGE_KEY);
    if (!raw) {
      saveUserCredits(DEFAULT_CREDITS);
      return DEFAULT_CREDITS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CREDITS;
  }
}

export function saveUserCredits(credits: UserCredits): void {
  try {
    localStorage.setItem(CREDITS_STORAGE_KEY, JSON.stringify(credits));
  } catch (err) {
    console.error('Error saving user credits:', err);
  }
}

export function deductUserCredit(): UserCredits {
  const current = loadUserCredits();
  if (current.remaining > 0) {
    const updated: UserCredits = {
      ...current,
      remaining: current.remaining - 1,
    };
    saveUserCredits(updated);
    return updated;
  }
  return current;
}

export const getUserCredits = loadUserCredits;

export function refillUserCredits(): UserCredits {
  const refilled: UserCredits = {
    total: 10,
    remaining: 10,
    plan: 'free',
    lastRefill: new Date().toISOString(),
  };
  saveUserCredits(refilled);
  return refilled;
}
