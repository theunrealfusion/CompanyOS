"use client";

import React from 'react';
import { X, Activity, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export interface EventLog {
  id: string;
  time: string;
  type: string;
  message: string;
  agent?: string;
}

export default function EventsFeed({
  isOpen,
  onClose,
  events,
}: {
  isOpen: boolean;
  onClose: () => void;
  events: EventLog[];
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-[#111622] border-l border-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Live Event Stream</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
        {events.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-sans">
            <Clock size={24} className="mx-auto mb-2 text-gray-600" />
            <p>Waiting for company bus events...</p>
            <p className="text-[11px] mt-1 text-gray-600">Run a simulation to generate live telemetry</p>
          </div>
        ) : (
          events.map((evt) => (
            <div key={evt.id} className="p-3 bg-gray-900/70 border border-gray-800/80 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span className="font-semibold text-blue-400 uppercase">{evt.type}</span>
                <span>{evt.time}</span>
              </div>
              <p className="text-gray-200 font-sans text-xs leading-relaxed">{evt.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
