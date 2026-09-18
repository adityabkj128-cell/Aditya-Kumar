import React from 'react';
import { 
  Sparkles, 
  FolderGit2, 
  Plus, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { UserCredits } from '../types';

interface NavbarProps {
  currentView: 'dashboard' | 'editor' | 'standalone-demo';
  projectName?: string;
  credits?: UserCredits;
  onNewProject: () => void;
  onGoToDashboard: () => void;
  onOpenPublish?: () => void;
  onOpenPricing?: () => void;
  onOpenSecurity?: () => void;
}

export function Navbar({
  currentView,
  projectName,
  credits,
  onNewProject,
  onGoToDashboard,
  onOpenPublish,
  onOpenPricing,
  onOpenSecurity,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 text-white px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onGoToDashboard}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-emerald-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-base sm:text-lg bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Prompt2App
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Free Demo
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Turn prompts into functional applications
            </p>
          </div>
        </div>

        {/* Middle Breadcrumb if in Editor */}
        {currentView === 'editor' && projectName && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
            <span 
              onClick={onGoToDashboard} 
              className="text-zinc-400 hover:text-white cursor-pointer transition-colors"
            >
              Dashboard
            </span>
            <span className="text-zinc-600">/</span>
            <span className="font-medium text-indigo-300 truncate max-w-[200px]">
              {projectName}
            </span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Security Audit Badge (Milestone 4) */}
          {onOpenSecurity && (
            <button
              id="nav-security-badge-btn"
              type="button"
              onClick={onOpenSecurity}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
              title="View Security & Sandbox Details"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">Security</span>
            </button>
          )}

          {/* Credits Counter (Milestone 5) */}
          {credits && onOpenPricing && (
            <button
              id="nav-credits-badge-btn"
              type="button"
              onClick={onOpenPricing}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 transition-colors font-medium"
              title="Click to view plans & credits"
            >
              <span className="text-amber-400">⚡</span>
              <span>{credits.remaining}/{credits.total} <span className="hidden md:inline text-amber-400/80 font-normal">Credits</span></span>
            </button>
          )}

          {currentView === 'editor' ? (
            <>
              <button
                id="nav-back-dashboard-btn"
                type="button"
                onClick={onGoToDashboard}
                className="px-3 py-1.5 text-xs font-medium rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Dashboard
              </button>
              {onOpenPublish && (
                <button
                  id="nav-publish-btn"
                  type="button"
                  onClick={onOpenPublish}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Publish</span>
                </button>
              )}
            </>
          ) : (
            <button
              id="nav-new-project-btn"
              type="button"
              onClick={onNewProject}
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
