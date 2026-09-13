import React from 'react';
import { X, Cpu, Shield, Play, Pause, Zap, Layers, AlertCircle } from 'lucide-react';

export interface AgentRecord {
  id: string;
  name: string;
  role: string;
  mission: string;
  system_instructions?: string;
  model_provider: string;
  model: string;
  authority: number;
  status: string;
  current_task?: string | null;
  risk_tolerance?: string;
  escalation_policy?: string;
}

export default function AgentDrawer({
  agent,
  onClose,
  onToggleStatus,
  onAssignTask,
}: {
  agent: AgentRecord | null;
  onClose: () => void;
  onToggleStatus: (agentId: string, nextStatus: string) => Promise<void>;
  onAssignTask: (agentId: string) => void;
}) {
  if (!agent) return null;

  const isWorking = agent.status.toLowerCase() === 'working';
  const isPaused = agent.status.toLowerCase() === 'paused';
  const isActive = agent.status.toLowerCase() === 'active';

  const handleToggle = () => {
    const nextStatus = isPaused ? 'active' : 'paused';
    onToggleStatus(agent.id, nextStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-gray-900 border-l border-gray-800 h-full p-6 flex flex-col shadow-2xl overflow-y-auto text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              {agent.role.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{agent.role}</h3>
              <p className="text-xs text-gray-400">{agent.name} • ID: {agent.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Operating State Card */}
        <div className="my-5 p-4 bg-gray-800/60 border border-gray-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Operating State</div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                isWorking ? 'bg-amber-400 animate-ping' : isActive ? 'bg-emerald-400' : 'bg-rose-500'
              }`} />
              <span className={`text-sm font-semibold capitalize ${
                isWorking ? 'text-amber-400' : isActive ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {agent.status}
              </span>
            </div>
          </div>
          <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all active:scale-95 ${
              isPaused 
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30' 
                : 'bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30'
            }`}
          >
            {isPaused ? <Play size={13} /> : <Pause size={13} />}
            <span>{isPaused ? 'Resume Agent' : 'Pause Agent'}</span>
          </button>
        </div>

        {/* Current Objective / Task */}
        <div className="space-y-4 flex-1">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Objective</label>
            <div className={`mt-1.5 p-3.5 rounded-xl text-sm border ${
              agent.current_task 
                ? 'bg-blue-950/40 border-blue-800/60 text-blue-200' 
                : 'bg-gray-800/40 border-gray-800 text-gray-400'
            }`}>
              {agent.current_task || 'Idle - No active task currently assigned'}
            </div>
          </div>

          {/* Mission */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Core Mission</label>
            <p className="mt-1 text-xs text-gray-300 leading-relaxed bg-gray-800/40 p-3 rounded-xl border border-gray-800">
              {agent.mission || 'Operate according to organizational guidelines.'}
            </p>
          </div>

          {/* Configuration Matrix */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Runtime & Governance</label>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-gray-800/50 border border-gray-800 rounded-xl">
                <div className="text-gray-400 flex items-center gap-1 mb-1">
                  <Cpu size={13} /> Model
                </div>
                <div className="font-mono text-gray-200 font-medium truncate">{agent.model}</div>
                <div className="text-[10px] text-gray-500">{agent.model_provider}</div>
              </div>

              <div className="p-3 bg-gray-800/50 border border-gray-800 rounded-xl">
                <div className="text-gray-400 flex items-center gap-1 mb-1">
                  <Shield size={13} /> Authority
                </div>
                <div className="font-mono text-amber-300 font-medium">{agent.authority} / 100</div>
                <div className="text-[10px] text-gray-500">Autonomous budget & decisions</div>
              </div>

              <div className="p-3 bg-gray-800/50 border border-gray-800 rounded-xl">
                <div className="text-gray-400 flex items-center gap-1 mb-1">
                  <AlertCircle size={13} /> Risk Tolerance
                </div>
                <div className="font-mono text-gray-200 font-medium capitalize">{agent.risk_tolerance || 'medium'}</div>
              </div>

              <div className="p-3 bg-gray-800/50 border border-gray-800 rounded-xl">
                <div className="text-gray-400 flex items-center gap-1 mb-1">
                  <Layers size={13} /> Escalation
                </div>
                <div className="font-mono text-blue-300 font-medium capitalize">{agent.escalation_policy || 'human'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-gray-800 flex gap-2">
          <button 
            onClick={() => {
              onAssignTask(agent.id);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            <Zap size={14} />
            <span>Dispatch New Directive</span>
          </button>
        </div>
      </div>
    </div>
  );
}
