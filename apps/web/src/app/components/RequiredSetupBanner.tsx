"use client";

import React from 'react';
import { Database, AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface RequiredSetupBannerProps {
  isMongoConnected: boolean;
  onOpenSetupModal: () => void;
  onGoToSettings: () => void;
}

export default function RequiredSetupBanner({
  isMongoConnected,
  onOpenSetupModal,
  onGoToSettings,
}: RequiredSetupBannerProps) {
  if (isMongoConnected) return null;

  return (
    <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#161a26] to-amber-950/20 border border-amber-500/40 shadow-xl shadow-amber-950/10 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <Database size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Required Setup Incomplete
            </span>
            <span className="text-xs font-semibold text-white">
              Cloud MongoDB Atlas Not Connected
            </span>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            Cloud MongoDB Atlas is active by default. You must configure your connection string to persist autonomous agent tasks and audit events.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
        <button
          onClick={onGoToSettings}
          className="px-3.5 py-2 text-xs font-semibold text-gray-300 hover:text-white bg-gray-800/80 hover:bg-gray-700/80 rounded-xl border border-gray-700 transition-colors"
        >
          View in Settings
        </button>

        <button
          onClick={onOpenSetupModal}
          className="px-4 py-2 text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-400/20 flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Database size={14} />
          <span>Connect Atlas Now</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
