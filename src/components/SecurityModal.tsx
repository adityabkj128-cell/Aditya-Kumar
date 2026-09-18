import React from 'react';
import { X, ShieldCheck, Lock, CheckCircle2, Server, EyeOff, Terminal, ShieldAlert } from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SecurityModal({ isOpen, onClose }: SecurityModalProps) {
  if (!isOpen) return null;

  const securityFeatures = [
    {
      title: 'Server-Side API Key Isolation',
      desc: 'All sensitive credentials (such as GEMINI_API_KEY) are kept strictly in backend environment variables and executed via server API routes (/api/*). Zero client-side key leakage.',
      icon: Server,
      status: 'Enforced',
      color: 'emerald',
    },
    {
      title: 'Iframe Sandbox Containment',
      desc: 'Live previews and published demo links are sandboxed with restricted permissions, preventing malicious DOM tampering, unwanted popups, or cross-origin elevation.',
      icon: Lock,
      status: 'Active',
      color: 'indigo',
    },
    {
      title: 'Prompt & Config Validation',
      desc: 'Strict sanitization of user input text, length bounding (max 1,000 chars), precision limits (0-8 decimals), and slug regex constraints to thwart script injections.',
      icon: ShieldCheck,
      status: 'Active',
      color: 'teal',
    },
    {
      title: 'Zero Secrets In Client Bundles',
      desc: 'No API keys, access tokens, or private environment variables are ever included in client-side Vite bundles or JavaScript payloads.',
      icon: EyeOff,
      status: 'Verified',
      color: 'emerald',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="security-audit-modal"
        className="w-full max-w-xl rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-2xl p-6 sm:p-7 relative overflow-hidden"
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Security & Sandbox Architecture</h3>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Milestone 4
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Multi-layer protection for prompt execution and app hosting.
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

        {/* Security Checklist Cards */}
        <div className="space-y-3 mb-6">
          {securityFeatures.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Validation Guarantee banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs text-indigo-300 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Audited for Production & Cloud Run hosting safety</span>
          </div>
          <span className="text-[10px] text-indigo-400 font-mono">OWASP Compliant</span>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
