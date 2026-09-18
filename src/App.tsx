import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TwoPanelEditor } from './components/TwoPanelEditor';
import { StandaloneDemoView } from './components/StandaloneDemoView';
import { PricingModal } from './components/PricingModal';
import { SecurityModal } from './components/SecurityModal';
import { Project, CalculatorConfig, UserCredits, AppTemplate } from './types';
import { 
  loadSavedProjects, 
  saveSingleProject, 
  deleteProjectFromStorage, 
  duplicateProjectInStorage,
  DEFAULT_CONFIG,
  slugify,
  getUserCredits,
  deductUserCredit,
  refillUserCredits
} from './utils/storage';
import { generateProjectFiles } from './utils/codeGenerator';
import { parsePromptForCalculator, applyModificationPrompt } from './utils/promptParser';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor' | 'standalone-demo'>('dashboard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModifying, setIsModifying] = useState(false);

  // Milestone 4 & 5 Modals
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [credits, setCredits] = useState<UserCredits>(getUserCredits());

  // Load saved projects & check URL routing on mount
  useEffect(() => {
    const loaded = loadSavedProjects();
    setProjects(loaded);
    setCredits(getUserCredits());

    const checkHashRoute = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#p/')) {
        const slug = hash.replace('#p/', '');
        const found = loaded.find((p) => p.slug === slug || p.id === slug);
        if (found) {
          setCurrentProject(found);
          setCurrentView('standalone-demo');
          return;
        }
      } else if (hash.startsWith('#demo-')) {
        const projId = hash.replace('#demo-', '');
        const found = loaded.find((p) => p.id === projId);
        if (found) {
          setCurrentProject(found);
          setCurrentView('standalone-demo');
          return;
        }
      }
    };

    checkHashRoute();
    window.addEventListener('hashchange', checkHashRoute);
    return () => window.removeEventListener('hashchange', checkHashRoute);
  }, []);

  const handleCreateNewProject = () => {
    setCurrentProject(null);
    setCurrentView('dashboard');
    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProject = (project: Project) => {
    setCurrentProject(project);
    setCurrentView('editor');
  };

  const handleDeleteProject = (id: string) => {
    const updated = deleteProjectFromStorage(id);
    setProjects(updated);
    if (currentProject?.id === id) {
      setCurrentProject(null);
      setCurrentView('dashboard');
    }
  };

  const handleDuplicateProject = (id: string) => {
    const { updatedList, newProject } = duplicateProjectInStorage(id);
    setProjects(updatedList);
    if (newProject) {
      setCurrentProject(newProject);
      setCurrentView('editor');
    }
  };

  const handleSaveProject = (updatedProject: Project) => {
    const refreshed = saveSingleProject(updatedProject);
    setProjects(refreshed);
    setCurrentProject(updatedProject);
  };

  // Milestone 1: Template Launcher
  const handleSelectTemplate = (template: AppTemplate) => {
    const now = new Date().toISOString();
    const finalConfig: CalculatorConfig = {
      ...DEFAULT_CONFIG,
      ...template.defaultConfig,
      title: template.name,
    };

    const newProj: Project = {
      id: 'proj_' + Date.now(),
      slug: slugify(template.name) + '-' + Math.floor(1000 + Math.random() * 9000),
      name: template.name,
      prompt: template.description,
      createdAt: now,
      updatedAt: now,
      type: 'calculator',
      config: finalConfig,
      files: generateProjectFiles(finalConfig, template.name),
      status: 'draft',
      version: 1,
      promptHistory: [
        {
          prompt: `Initialized from template: ${template.name}`,
          timestamp: now,
          version: 1,
          configSnapshot: finalConfig,
        },
      ],
    };

    const nextProjects = saveSingleProject(newProj);
    setProjects(nextProjects);
    setCurrentProject(newProj);
    setCurrentView('editor');
  };

  // Milestone 1 & 5: Main "Generate App" execution with Credit deduction
  const handleGenerateNew = async (promptText: string) => {
    // Check credits
    if (credits.remaining <= 0) {
      setIsPricingOpen(true);
      return;
    }

    setIsGenerating(true);

    try {
      // 1. Try hitting backend /api/generate if available (Milestone 4: Server-side API key guard)
      let backendEnhancement = null;
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptText }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.enhancement) {
            backendEnhancement = data.enhancement;
          }
        }
      } catch (err) {
        // Fallback gracefully to demo mode
        console.log('Backend /api/generate offline or fallback mode');
      }

      // Artificial delay for high-craft UI synthesis feeling
      await new Promise((res) => setTimeout(res, 800));

      // 2. Parse prompt using intelligent parser
      const parsed = parsePromptForCalculator(promptText);
      const appName = backendEnhancement?.appName || parsed.appName;

      const finalConfig: CalculatorConfig = {
        ...DEFAULT_CONFIG,
        ...parsed.config,
        ...(backendEnhancement?.theme ? { theme: backendEnhancement.theme } : {}),
        title: appName,
      };

      const now = new Date().toISOString();
      const newProj: Project = {
        id: 'proj_' + Date.now(),
        slug: slugify(appName) + '-' + Math.floor(1000 + Math.random() * 9000),
        name: appName,
        prompt: promptText,
        createdAt: now,
        updatedAt: now,
        type: 'calculator',
        config: finalConfig,
        files: generateProjectFiles(finalConfig, appName),
        status: 'draft',
        version: 1,
        promptHistory: [
          {
            prompt: promptText,
            timestamp: now,
            version: 1,
            configSnapshot: finalConfig,
          },
        ],
      };

      // Deduct credit
      const updatedCredits = deductUserCredit();
      setCredits(updatedCredits);

      const nextProjects = saveSingleProject(newProj);
      setProjects(nextProjects);
      setCurrentProject(newProj);
      setCurrentView('editor');
    } catch (error) {
      console.error('Error generating project:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Milestone 2 & 5: Modify App execution with credits
  const handleModifyApp = async (modificationPrompt: string) => {
    if (!currentProject) return;

    // Check credits
    if (credits.remaining <= 0) {
      setIsPricingOpen(true);
      return;
    }

    setIsModifying(true);

    try {
      // 1. Check backend /api/modify
      let backendSuggestions = null;
      try {
        const response = await fetch('/api/modify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentConfig: currentProject.config,
            modificationPrompt,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.suggestions) {
            backendSuggestions = data.suggestions;
          }
        }
      } catch {
        // Fallback gracefully
      }

      await new Promise((res) => setTimeout(res, 500));

      // 2. Parse modification
      const partialUpdates = applyModificationPrompt(currentProject.config, modificationPrompt);
      const nextConfig: CalculatorConfig = {
        ...currentProject.config,
        ...partialUpdates,
        ...(backendSuggestions ? {
          ...(backendSuggestions.theme ? { theme: backendSuggestions.theme } : {}),
          ...(backendSuggestions.darkMode !== undefined ? { darkMode: backendSuggestions.darkMode } : {}),
          ...(backendSuggestions.showScientific !== undefined ? { showScientific: backendSuggestions.showScientific } : {}),
          ...(backendSuggestions.precision !== undefined ? { precision: backendSuggestions.precision } : {}),
        } : {}),
      };

      const now = new Date().toISOString();
      const updatedProject: Project = {
        ...currentProject,
        config: nextConfig,
        version: currentProject.version + 1,
        updatedAt: now,
        files: generateProjectFiles(nextConfig, currentProject.name),
        promptHistory: [
          ...(currentProject.promptHistory || []),
          {
            prompt: modificationPrompt,
            timestamp: now,
            version: currentProject.version + 1,
            configSnapshot: nextConfig,
          },
        ],
      };

      // Deduct credit
      const updatedCredits = deductUserCredit();
      setCredits(updatedCredits);

      handleSaveProject(updatedProject);
    } catch (err) {
      console.error('Failed modifying app:', err);
    } finally {
      setIsModifying(false);
    }
  };

  const handleRefillCredits = () => {
    const updated = refillUserCredits();
    setCredits(updated);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      {currentView !== 'standalone-demo' && (
        <Navbar
          currentView={currentView}
          projectName={currentProject?.name}
          credits={credits}
          onNewProject={handleCreateNewProject}
          onGoToDashboard={() => {
            setCurrentView('dashboard');
            if (window.location.hash) {
              window.history.pushState(null, '', window.location.pathname);
            }
          }}
          onOpenPricing={() => setIsPricingOpen(true)}
          onOpenSecurity={() => setIsSecurityOpen(true)}
        />
      )}

      <main className="w-full">
        {currentView === 'dashboard' && (
          <DashboardView
            projects={projects}
            credits={credits}
            onOpenProject={handleOpenProject}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            onGenerateNew={handleGenerateNew}
            onSelectTemplate={handleSelectTemplate}
            onOpenPricing={() => setIsPricingOpen(true)}
            onOpenSecurity={() => setIsSecurityOpen(true)}
            isGenerating={isGenerating}
          />
        )}

        {currentView === 'editor' && currentProject && (
          <TwoPanelEditor
            project={currentProject}
            onSaveProject={handleSaveProject}
            onBackToDashboard={() => {
              setCurrentView('dashboard');
              if (window.location.hash) {
                window.history.pushState(null, '', window.location.pathname);
              }
            }}
            onModifyApp={handleModifyApp}
            isModifying={isModifying}
            onOpenStandaloneDemo={() => {
              window.location.hash = `#p/${currentProject.slug || currentProject.id}`;
              setCurrentView('standalone-demo');
            }}
          />
        )}

        {currentView === 'standalone-demo' && currentProject && (
          <StandaloneDemoView
            project={currentProject}
            onBackToEditor={() => {
              if (window.location.hash) {
                window.history.pushState(null, '', window.location.pathname);
              }
              setCurrentView('editor');
            }}
          />
        )}
      </main>

      {/* Pricing & Monetization Modal (Milestone 5) */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        credits={credits}
        onRefillCredits={handleRefillCredits}
      />

      {/* Security & Sandbox Audit Modal (Milestone 4) */}
      <SecurityModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
      />
    </div>
  );
}
