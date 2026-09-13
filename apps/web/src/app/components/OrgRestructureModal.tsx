"use client";

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Shield, Cpu, Layers, DollarSign, Save, GitBranch } from 'lucide-react';
import { AgentData } from './CompanyGraph';

export default function OrgRestructureModal({
  isOpen,
  mode, // 'add' | 'edit'
  agent,
  existingAgents,
  onClose,
  onSaveAgent,
  onDeleteAgent,
}: {
  isOpen: boolean;
  mode: 'add' | 'edit';
  agent?: AgentData | null;
  existingAgents: AgentData[];
  onClose: () => void;
  onSaveAgent: (agentData: Partial<AgentData>, managerId?: string) => void;
  onDeleteAgent?: (agentId: string) => void;
}) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [managerId, setManagerId] = useState('ceo');
  const [model, setModel] = useState('Gemini 1.5 Pro');
  const [runtime, setRuntime] = useState('CompanyOS Native');
  const [permissionLevel, setPermissionLevel] = useState('L3 Execute');
  const [costPerHour, setCostPerHour] = useState('₹75.00');
  const [icon, setIcon] = useState('engineering');

  useEffect(() => {
    if (mode === 'edit' && agent) {
      setName(agent.name || '');
      setRole(agent.role || '');
      setDepartment(agent.department || 'Engineering');
      setModel(agent.model || 'Gemini 1.5 Pro');
      setRuntime(agent.runtime || 'CompanyOS Native');
      setPermissionLevel(agent.permissionLevel || 'L3 Execute');
      setCostPerHour(agent.costPerHour || '₹75.00');
      setIcon(agent.icon || 'engineering');
    } else if (mode === 'add') {
      setName('');
      setRole('');
      setDepartment('Engineering');
      setManagerId('ceo');
      setModel('Gemini 1.5 Pro');
      setRuntime('CompanyOS Native');
      setPermissionLevel('L3 Execute');
      setCostPerHour('₹65.00');
      setIcon('engineering');
    }
  }, [mode, agent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    onSaveAgent(
      {
        id: mode === 'edit' && agent ? agent.id : `agent-${Date.now()}`,
        name: name.trim(),
        role: role.trim(),
        department,
        model,
        runtime,
        permissionLevel,
        costPerHour,
        icon,
        status: agent?.status || 'IDLE',
        task: agent?.task || 'Ready for assignments',
        metrics: agent?.metrics || { efficiency: 90, tasks: 0 }
      },
      managerId
    );
    onClose();
  };

  const departments = [
    'Executive',
    'Strategy & Research',
    'Product & Design',
    'Engineering & Architecture',
    'Revenue & Monetization',
    'Growth & Marketing',
    'DevOps & Security',
    'Finance & Accounting',
    'Operations'
  ];

  const models = [
    'nvidia/nemotron-3-ultra-550b-a55b',
    'meta/llama-3.3-70b-instruct',
    'deepseek-ai/deepseek-r1',
    'Gemini 1.5 Pro',
    'Gemini 1.5 Flash',
    'Claude 3.5 Sonnet',
    'GPT-4o',
    'GPT-4o-mini',
    'Hermes 3 / Llama 3.1',
    'Local Ollama / vLLM'
  ];

  const runtimes = [
    'CompanyOS Native',
    'Antigravity SDK',
    'Hermes Adapter',
    'OpenClaw Runtime',
    'NVIDIA NIM vLLM',
    'Human Authority'
  ];

  const permissionLevels = [
    'L0 Think (Read Only)',
    'L1 Research (Web / Docs)',
    'L2 Draft (Artifacts)',
    'L3 Execute (Tools / Tests)',
    'L4 Publish & Deploy (Code / Social)',
    'L5 Spend & Policy (Budgets)',
    'L6 Irreversible / Legal (Founder)'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#111622] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl">
              {mode === 'add' ? <UserPlus size={18} /> : <GitBranch size={18} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {mode === 'add' ? 'Add New Organization Agent' : `Restructure Agent: ${agent?.role}`}
              </h3>
              <p className="text-xs text-gray-400">
                Configure organizational hierarchy, reporting line, model, and capabilities
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Agent Persona Role *
              </label>
              <input
                type="text"
                placeholder="e.g. QA Director, Growth Specialist"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Agent Identifier Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Agent QA, Agent Growth"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Reporting Line (Reports To) *
              </label>
              <select
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                {existingAgents
                  .filter((a) => !agent || a.id !== agent.id)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.role} ({a.name})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Assigned AI Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
              >
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Execution Runtime Adapter
              </label>
              <select
                value={runtime}
                onChange={(e) => setRuntime(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                {runtimes.map((rt) => (
                  <option key={rt} value={rt}>{rt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Permission & Authority Level
              </label>
              <select
                value={permissionLevel}
                onChange={(e) => setPermissionLevel(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
              >
                {permissionLevels.map((pl) => (
                  <option key={pl} value={pl}>{pl}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Estimated Cost / Hour
              </label>
              <input
                type="text"
                value={costPerHour}
                onChange={(e) => setCostPerHour(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-800 flex items-center justify-between gap-3">
            {mode === 'edit' && agent && onDeleteAgent && agent.id !== 'founder' && agent.id !== 'ceo' ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to remove ${agent.role} from the company structure?`)) {
                    onDeleteAgent(agent.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-rose-400 hover:text-white bg-rose-950/30 hover:bg-rose-900/50 border border-rose-900/40 rounded-xl transition-colors"
              >
                <Trash2 size={14} />
                <span>Remove Agent</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white bg-gray-800/60 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                <Save size={14} />
                <span>{mode === 'add' ? 'Create Agent' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
