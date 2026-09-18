import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Globe, 
  Share2, 
  Sparkles, 
  ExternalLink, 
  Check, 
  Copy, 
  ShieldCheck,
  Code
} from 'lucide-react';
import { Project } from '../types';
import { LiveCalculator } from './LiveCalculator';

interface StandaloneDemoViewProps {
  project: Project;
  onBackToEditor: () => void;
}

export function StandaloneDemoView({ project, onBackToEditor }: StandaloneDemoViewProps) {
  const [copied, setCopied] = useState(false);
  const isPublished = project.status === 'published';
  const publicUrl = `${window.location.origin}/#p/${project.slug || project.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Demo Banner */}
      <header className="w-full bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToEditor}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Editor</span>
          </button>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs sm:text-sm text-white">{project.name}</span>
            {isPublished ? (
              <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PUBLISHED VIEW
              </span>
            ) : (
              <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                PREVIEW DRAFT
              </span>
            )}
            <span className="hidden md:inline font-mono text-[11px] text-zinc-500 px-2 py-0.5 bg-zinc-950 rounded border border-zinc-800">
              /p/{project.slug}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sandbox Isolated</span>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Link' : 'Copy URL'}</span>
          </button>
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main className="w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm">
          <LiveCalculator config={project.config} isStandalone={true} />
        </div>
      </main>

      {/* Footer Info Notice */}
      <footer className="w-full border-t border-zinc-800/80 bg-zinc-900/60 px-4 py-2.5 flex items-center justify-between text-xs text-zinc-400 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Prompt2App Standalone Host • {project.name}</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-500">
          <span>Version {project.version}.0</span>
          <span>•</span>
          <button 
            onClick={onBackToEditor}
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            Open in Prompt2App Studio
          </button>
        </div>
      </footer>
    </div>
  );
}
