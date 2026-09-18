import React, { useState } from 'react';
import { 
  X, 
  Globe, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  Share2,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Project, ProjectStatus } from '../types';
import { slugify } from '../utils/storage';

interface PublishDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onOpenStandaloneDemo: () => void;
}

export function PublishDemoModal({
  isOpen,
  onClose,
  project,
  onUpdateProject,
  onOpenStandaloneDemo,
}: PublishDemoModalProps) {
  const [slug, setSlug] = useState<string>(project.slug || slugify(project.name));
  const [slugError, setSlugError] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [justPublished, setJustPublished] = useState(false);

  if (!isOpen) return null;

  const isPublished = project.status === 'published';
  const publicSlug = slug.trim() || slugify(project.name);
  const publicUrl = `${window.location.origin}/#p/${publicSlug}`;
  const embedCode = `<iframe src="${publicUrl}" width="400" height="640" style="border:0;border-radius:24px;box-shadow:0 20px 40px rgba(0,0,0,0.3)" title="${project.name}" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>`;

  const handleSlugChange = (val: string) => {
    const formatted = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(formatted);
    if (formatted.length < 3) {
      setSlugError('Slug must be at least 3 characters');
    } else if (formatted.length > 40) {
      setSlugError('Slug cannot exceed 40 characters');
    } else {
      setSlugError('');
    }
  };

  const handlePublishToggle = (targetStatus: ProjectStatus) => {
    if (slugError) return;
    const now = new Date().toISOString();
    const finalSlug = slug.trim() || slugify(project.name);

    const updated: Project = {
      ...project,
      slug: finalSlug,
      status: targetStatus,
      publishedAt: targetStatus === 'published' ? now : project.publishedAt,
      updatedAt: now,
    };

    onUpdateProject(updated);
    if (targetStatus === 'published') {
      setJustPublished(true);
      setTimeout(() => setJustPublished(false), 2500);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Check out my new app built with Prompt2App: "${project.name}"!`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(publicUrl)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Check out this app I built with Prompt2App: ${project.name} - ${publicUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="publish-system-modal"
        className="w-full max-w-xl rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-2xl p-6 sm:p-7 relative overflow-hidden"
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl border ${
              isPublished 
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' 
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}>
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Publishing & Public URL</h3>
                {isPublished ? (
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE PUBLISHED
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                    DRAFT
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configure your unique slug and share your live application with anyone.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status banner */}
        <div className={`mb-5 p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
          isPublished 
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
            : 'bg-zinc-950 border-zinc-800 text-zinc-400'
        }`}>
          <div className="flex items-center gap-2">
            {isPublished ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0" />
            )}
            <div>
              <span className="font-semibold text-white">
                {isPublished ? 'App is currently Published & Public' : 'App is currently in Draft state'}
              </span>
              <div className="text-[11px] text-zinc-400">
                {isPublished && project.publishedAt 
                  ? `Published on ${new Date(project.publishedAt).toLocaleDateString()}` 
                  : 'Only you can view and edit this draft until published.'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isPublished ? (
              <button
                type="button"
                onClick={() => handlePublishToggle('draft')}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
              >
                Unpublish
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handlePublishToggle('published')}
                disabled={Boolean(slugError)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                Publish Now
              </button>
            )}
          </div>
        </div>

        {/* Slug Customizer */}
        <div className="space-y-4 mb-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Public App Slug
              </label>
              <button
                type="button"
                onClick={() => handleSlugChange(slugify(project.name))}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset from name</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs focus-within:border-indigo-500 transition-colors">
                <span className="text-zinc-500 font-mono select-none">/p/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="custom-slug-here"
                  className="bg-transparent border-none text-white font-mono text-xs focus:outline-none flex-1 pl-1"
                />
              </div>

              {isPublished && (
                <button
                  type="button"
                  onClick={() => handlePublishToggle('published')}
                  disabled={Boolean(slugError)}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition-colors"
                >
                  Update Slug
                </button>
              )}
            </div>
            {slugError && (
              <p className="text-[11px] text-rose-400 mt-1">{slugError}</p>
            )}
          </div>

          {/* Shareable Link Box */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 block">
              Direct Public URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-indigo-300 select-all focus:outline-none"
              />
              <button
                id="copy-public-url-btn"
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Embed snippet */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 block">
              HTML Sandbox Embed Code
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={embedCode}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-400 select-all focus:outline-none"
              />
              <button
                id="copy-embed-code-btn"
                type="button"
                onClick={handleCopyEmbed}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmbed ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Social Share & Launch */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Share:</span>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium transition-colors"
            >
              WhatsApp
            </button>
            <button
              type="button"
              onClick={handleShareTwitter}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium transition-colors"
            >
              Twitter / X
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Close
            </button>
            <button
              id="launch-public-view-btn"
              type="button"
              onClick={() => {
                onClose();
                onOpenStandaloneDemo();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Launch Public View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
