import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Trash2, 
  Copy, 
  Calculator, 
  Play, 
  CheckCircle2, 
  Code2, 
  Laptop2, 
  SlidersHorizontal,
  FolderOpen,
  Plus,
  Zap,
  Globe,
  LayoutTemplate,
  Percent,
  Binary,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { Project, CalculatorConfig, UserCredits, AppTemplate } from '../types';
import { APP_TEMPLATES } from '../utils/storage';

interface DashboardViewProps {
  projects: Project[];
  credits?: UserCredits;
  onOpenProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (id: string) => void;
  onGenerateNew: (prompt: string, customConfig?: Partial<CalculatorConfig>) => Promise<void>;
  onSelectTemplate: (template: AppTemplate) => void;
  onOpenPricing?: () => void;
  onOpenSecurity?: () => void;
  isGenerating: boolean;
}

export function DashboardView({
  projects,
  credits,
  onOpenProject,
  onDeleteProject,
  onDuplicateProject,
  onGenerateNew,
  onSelectTemplate,
  onOpenPricing,
  onOpenSecurity,
  isGenerating,
}: DashboardViewProps) {
  const [promptText, setPromptText] = useState(
    'एक modern responsive calculator app बनाओ जिसमें addition, subtraction, multiplication, division, decimal, percentage, clear, backspace, history, और basic dark mode शामिल हों।'
  );

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptText.trim() || isGenerating) return;
    await onGenerateNew(promptText.trim());
  };

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Binary':
        return <Binary className="w-5 h-5 text-emerald-400" />;
      case 'Percent':
        return <Percent className="w-5 h-5 text-amber-400" />;
      case 'Sliders':
        return <Sliders className="w-5 h-5 text-slate-300" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-rose-400" />;
      default:
        return <Calculator className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Hero / Prompt Section (Milestone 1) */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-emerald-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          {/* Top Status Badges */}
          <div className="flex items-center justify-center gap-2.5 flex-wrap mb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Prompt2App Studio • Core Prompt-to-App Engine</span>
            </div>

            {credits && onOpenPricing && (
              <button
                type="button"
                onClick={onOpenPricing}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <span>⚡ {credits.remaining}/{credits.total} Credits</span>
                <span className="text-[10px] uppercase font-bold text-amber-400/80 bg-amber-500/20 px-1.5 py-0.2 rounded">
                  Free
                </span>
              </button>
            )}

            {onOpenSecurity && (
              <button
                type="button"
                onClick={onOpenSecurity}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-medium transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Key Leakage</span>
              </button>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
            Prompt likho, <span className="bg-gradient-to-r from-indigo-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">App ready pao.</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto mb-6 leading-relaxed">
            Enter any natural language prompt or pick a starter template. Prompt2App builds complete interactive applications with full arithmetic operations, calculation history, undo/redo iterations, and live publishing.
          </p>

          {/* Prompt Box Form */}
          <form onSubmit={handleGenerate} className="w-full text-left">
            <div className="relative rounded-2xl bg-zinc-900/90 border border-zinc-700/80 shadow-2xl p-2 sm:p-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <textarea
                id="prompt-input-box"
                rows={3}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Describe your app... (e.g. Create a calculator with addition, subtraction, percentage, backspace, history log, and dark mode)"
                className="w-full bg-transparent border-0 resize-none text-zinc-100 placeholder-zinc-500 text-xs sm:text-sm focus:outline-none p-2 sm:p-3 leading-relaxed"
                disabled={isGenerating}
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 sm:pt-3 border-t border-zinc-800/80 px-2">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="hidden sm:inline">Free Demo Mode active • Local Storage persistence</span>
                  <span className="sm:hidden">Free Demo Mode</span>
                </div>

                <button
                  id="generate-app-btn"
                  type="submit"
                  disabled={isGenerating || !promptText.trim()}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isGenerating
                      ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white shadow-indigo-600/30 active:scale-98'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                      <span>Generating App...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate App</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Template Apps Section (Milestone 1: Template apps जैसे Calculator) */}
      <section className="py-6 px-4 sm:px-6 bg-zinc-900/30 border-t border-zinc-800/60">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Template Apps (Instant 1-Click Launch)
              </h2>
            </div>
            <span className="text-[11px] text-zinc-400">
              Ready-to-use production architectures
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {APP_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                id={`template-card-${tpl.id}`}
                onClick={() => onSelectTemplate(tpl)}
                className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-900/90 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 group-hover:scale-105 transition-transform">
                      {getTemplateIcon(tpl.iconName)}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold">
                      {tpl.badge}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors mb-1">
                    {tpl.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-indigo-400 font-semibold group-hover:text-indigo-300">
                  <span>Use Template</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Projects Section (Milestone 2 & 3: Recent projects, draft vs published) */}
      <section className="flex-1 py-8 px-4 sm:px-6 bg-zinc-900/40 border-t border-zinc-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Recent Projects</h2>
                <p className="text-xs text-zinc-400">Local state persistence & live published links</p>
              </div>
            </div>

            <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 font-medium">
              {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
              <Calculator className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-zinc-300 mb-1">No saved projects yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
                Type a prompt above or pick a template to synthesize your first application.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => {
                const isPublished = proj.status === 'published';
                return (
                  <div
                    key={proj.id}
                    id={`project-card-${proj.id}`}
                    className="rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700/80 p-5 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-black/40 group relative"
                  >
                    <div>
                      {/* Top Row: icon, badge, actions */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 text-indigo-400 border border-indigo-500/20">
                          <Calculator className="w-5 h-5" />
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onDuplicateProject(proj.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                            title="Duplicate Project"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProject(proj.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                          {proj.name}
                        </h3>
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 shrink-0">
                          v{proj.version}.0
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                        {proj.prompt}
                      </p>
                    </div>

                    <div>
                      {/* Milestone 3: Draft vs Published state clearly visible */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-4">
                        {isPublished ? (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            PUBLISHED
                          </span>
                        ) : (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-bold">
                            DRAFT
                          </span>
                        )}

                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium">
                          {proj.config.theme}
                        </span>

                        {proj.slug && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-950 font-mono text-zinc-400 border border-zinc-800 truncate max-w-[120px]">
                            /p/{proj.slug}
                          </span>
                        )}
                      </div>

                      {/* Bottom Row: Timestamp & Open Button */}
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-xs text-zinc-500">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(proj.updatedAt).toLocaleDateString()}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onOpenProject(proj)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95"
                        >
                          <span>Open Editor</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
