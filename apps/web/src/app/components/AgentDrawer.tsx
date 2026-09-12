"use client";

import React from 'react';
import { X, Cpu, Shield, DollarSign, CheckCircle2, Play, Pause, Activity, Zap, Layers } from 'lucide-react';
import { AgentData } from './CompanyGraph';

export default function AgentDrawer({
  agent,
  onClose,
  onToggleStatus,
  onAssignTask,
}: {
  agent: AgentData | null;
  onClose: () => void;
  onToggleStatus: (agentId: string) => void;
  onAssignTask: (agentId: string) => void;
}) {
  if (!agent) return null;

  const isWorking = agent.status === 'WORKING';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#111622] border-l border-gray-800 h-full p-6 flex flex-col shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              {agent.role.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{agent.role}</h3>
              <p className="text-xs text-gray-400">{agent.name} • {agent.department}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Badge & Actions */}
        <div className="my-5 p-4 bg-[#181f30] border border-gray-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Operating State</div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isWorking ? 'bg-emerald-400 animate-ping' : 'bg-gray-500'}`} />
              <span className={`text-sm font-semibold ${isWorking ? 'text-emerald-400' : 'text-gray-400'}`}>
                {agent.status}
              </span>
            </div>
          </div>
          <button
            onClick={() => onToggleStatus(agent.id)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all active:scale-95 ${
              isWorking 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30' 
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            {isWorking ? <Pause size={14} /> : <Play size={14} />}
            <span>{isWorking ? 'Pause Agent' : 'Activate Agent'}</span>
          </button>
        </div>

        {/* Current Task */}
        <div className="space-y-4 flex-1">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Objective</label>
            <div className="mt-1.5 p-3.5 bg-blue-950/30 border border-blue-800/40 rounded-xl text-sm text-blue-200">
              {agent.task || 'Idle - No active task currently assigned'}
            </div>
          </div>

          {/* Configuration Matrix */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Runtime & Policy</label>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-gray-900/60 border border-gray-800 rounded-lg">
                <div className="text-gray-500 flex items-center gap-1 mb-1">
                  <Cpu size={13} /> Model
                </div>
                <div className="font-mono text-gray-200 font-medium">{agent.model}</div>
              </div>

              <div className="p-3 bg-gray-900/60 border border-gray-800 rounded-lg">
                <div className="text-gray-500 flex items-center gap-1 mb-1">
                  <Layers size={13} /> Runtime
                </div>
                <div className="font-mono text-gray-200 font-medium">{agent.runtime}</div>
              </div>

              <div className="p-3 bg-gray-900/60 border border-gray-800 rounded-lg">
                <div className="text-gray-500 flex items-center gap-1 mb-1">
                  <Shield size={13} /> Permissions
                </div>
                <div className="font-mono text-amber-300 font-medium">{agent.permissionLevel}</div>
              </div>

              <div className="p-3 bg-gray-900/60 border border-gray-800 rounded-lg">
                <div className="text-gray-500 flex items-center gap-1 mb-1">
                  <DollarSign size={13} /> Cost / Hour
                </div>
                <div className="font-mono text-emerald-400 font-medium">{agent.costPerHour}</div>
              </div>
            </div>
          </div>

          {/* Performance KPIs */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Performance</label>
            <div className="mt-2 p-4 bg-gray-900/60 border border-gray-800 rounded-xl space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Autonomous Efficiency</span>
                  <span className="text-gray-200 font-mono font-medium">{agent.metrics.efficiency}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${agent.metrics.efficiency}%` }} />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-800">
                <span className="text-gray-400">Verified Completed Tasks</span>
                <span className="text-emerald-400 font-mono font-bold">{agent.metrics.tasks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-gray-800 flex gap-2">
          <button 
            onClick={() => onAssignTask(agent.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            <Zap size={14} />
            <span>Dispatch New Task</span>
          </button>
        </div>
      </div>
    </div>
  );
}
