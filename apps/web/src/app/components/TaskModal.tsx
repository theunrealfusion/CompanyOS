"use client";

import React, { useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  defaultAgent = 'ceo',
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (agent: string, taskTitle: string) => void;
  defaultAgent?: string;
}) {
  const [selectedAgent, setSelectedAgent] = useState(defaultAgent);
  const [taskText, setTaskText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;
    onSubmit(selectedAgent, taskText.trim());
    setTaskText('');
    onClose();
  };

  const sampleTasks = [
    "Discover high-margin SaaS opportunities with ARR > ₹50L",
    "Design architectural specification for multi-model fallback router",
    "Draft Go-To-Market content campaign for LinkedIn & Twitter",
    "Audit cloud infrastructure costs and propose 30% reduction plan"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#131722] border border-gray-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Dispatch Agent Task</h3>
              <p className="text-xs text-gray-400">Direct instruction into CompanyOS message router</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Assignee Agent
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ceo">Agent CEO (Executive)</option>
              <option value="strategy">Agent Strat (Strategy & Research)</option>
              <option value="product">Agent Prod (Product & PRD)</option>
              <option value="engineering">Agent Eng (Architecture & Code)</option>
              <option value="revenue">Agent Rev (Revenue & Monetization)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Task Directive
            </label>
            <textarea
              rows={3}
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="e.g. Find 3 high-yield enterprise automation opportunities..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-gray-500 resize-none"
              required
            />
          </div>

          <div>
            <div className="text-[11px] font-medium text-gray-400 mb-1.5">Quick Inspiration:</div>
            <div className="space-y-1">
              {sampleTasks.map((sample, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setTaskText(sample)}
                  className="block w-full text-left text-xs text-gray-400 hover:text-blue-300 bg-gray-900/40 hover:bg-gray-800/60 rounded-lg px-2.5 py-1.5 truncate transition-colors"
                >
                  • {sample}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white bg-gray-800/60 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              <Send size={13} />
              <span>Dispatch Directive</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
