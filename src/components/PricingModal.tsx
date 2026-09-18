import React, { useState } from 'react';
import { X, Check, Zap, Sparkles, Shield, ArrowRight, RefreshCw, Star } from 'lucide-react';
import { UserCredits } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: UserCredits;
  onRefillCredits: () => void;
}

export function PricingModal({
  isOpen,
  onClose,
  credits,
  onRefillCredits,
}: PricingModalProps) {
  const [notified, setNotified] = useState(false);
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setNotified(true);
    setTimeout(() => {
      setNotified(false);
      setEmail('');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="pricing-plans-modal"
        className="w-full max-w-3xl rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-2xl p-6 sm:p-8 relative overflow-hidden"
      >
        {/* Glow Header */}
        <div className="absolute top-0 right-1/4 w-72 h-40 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Monetization & Plans (Milestone 5)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Prompt2App Plans & Credits
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Start building with your free quota, or reserve access for advanced deployment tiers.
            </p>
          </div>
          <button
            id="close-pricing-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Card */}
        <div className="mb-6 p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 flex items-center justify-center font-bold text-lg">
              ⚡
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-medium">Active Free Plan Quota</div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>{credits.remaining} / {credits.total} AI Credits Remaining</span>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Free Tier
                </span>
              </div>
            </div>
          </div>

          <button
            id="refill-credits-btn"
            type="button"
            onClick={onRefillCredits}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all shrink-0 active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Reset / Refill Credits (Demo)</span>
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Free Tier */}
          <div className="rounded-2xl bg-zinc-950/80 border-2 border-indigo-500/50 p-5 flex flex-col justify-between relative">
            <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-indigo-600 text-[10px] font-extrabold text-white uppercase tracking-wider">
              Current Plan
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                Free Starter
              </div>
              <div className="text-2xl font-black text-white mb-2">
                $0 <span className="text-xs text-zinc-500 font-normal">/ forever</span>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                Ideal for learning, experimentation, and rapid calculator prototyping.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>10 Free AI generation credits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Unlimited local project saves</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Instant live preview & undo/redo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Public Demo slug sharing</span>
                </li>
              </ul>
            </div>
            <div className="mt-5">
              <span className="w-full block py-2 rounded-xl text-center bg-zinc-800 text-xs font-semibold text-zinc-400">
                Active on your browser
              </span>
            </div>
          </div>

          {/* Pro Creator */}
          <div className="rounded-2xl bg-zinc-950/40 border border-zinc-800 hover:border-zinc-700 p-5 flex flex-col justify-between relative transition-all">
            <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider">
              Upcoming
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                Pro Creator
              </div>
              <div className="text-2xl font-black text-white mb-2">
                $12 <span className="text-xs text-zinc-500 font-normal">/ month</span>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                For developers & creators publishing live tools to real domains.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>500 AI credits per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Custom domain deployment</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Remove Prompt2App badge</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>1-Click GitHub & Vercel export</span>
                </li>
              </ul>
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setNotified(true)}
                className="w-full py-2 rounded-xl text-center bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition-colors"
              >
                Join Waitlist
              </button>
            </div>
          </div>

          {/* Enterprise */}
          <div className="rounded-2xl bg-zinc-950/40 border border-zinc-800 p-5 flex flex-col justify-between relative">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Team & Scale
              </div>
              <div className="text-2xl font-black text-white mb-2">
                $49 <span className="text-xs text-zinc-500 font-normal">/ month</span>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                For organizations building internal tools with multi-seat access.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Unlimited AI generations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Team shared workspace</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Private enterprise server keys</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Dedicated cloud hosting & SLA</span>
                </li>
              </ul>
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setNotified(true)}
                className="w-full py-2 rounded-xl text-center bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>

        {/* Waitlist Form */}
        <form onSubmit={handleNotifyMe} className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-zinc-400">Want early access when Pro paid plans launch?</span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 w-full sm:w-56"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shrink-0"
            >
              {notified ? 'Saved!' : 'Notify Me'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
