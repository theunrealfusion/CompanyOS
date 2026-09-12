"use client";

import React, { useState } from 'react';
import { Users, Search, Plus, Play, Pause, Zap, Cpu, Shield, Sparkles, Filter } from 'lucide-react';
import { AgentData } from '../CompanyGraph';

export default function AgentsView({
  agents,
  onSelectAgent,
  onToggleStatus,
  onDispatchTask,
}: {
  agents: Record<string, AgentData>;
  onSelectAgent: (agent: AgentData) => void;
  onToggleStatus: (agentId: string) => void;
  onDispatchTask: (agentId: string) => void;
}) {
  const [filter, setFilter] = useState<'ALL' | 'WORKING' | 'IDLE'>('ALL');
  const [search, setSearch] = useState('');

  const agentList = Object.values(agents);

  const filtered = agentList.filter((a) => {
    const matchesFilter = filter === 'ALL' || a.status === filter;
    const matchesSearch = 
      a.role.toLowerCase().includes(search.toLowerCase()) || 
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.department.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#0b0f19] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Autonomous Agents Directory</h1>
          <p className="text-xs text-gray-400 mt-1">Manage AI personas, capabilities, runtimes, and assignments</p>
        </div>

        <button 
          onClick={() => onDispatchTask('ceo')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus size={16} />
          <span>New Mission Directive</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-6">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search agents by role, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#131722] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-gray-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#131722] p-1 border border-gray-800 rounded-xl self-stretch sm:self-auto justify-center">
          {(['ALL', 'WORKING', 'IDLE'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === mode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((agent) => {
          const isWorking = agent.status === 'WORKING';

          return (
            <div
              key={agent.id}
              className="bg-[#131722] border border-gray-800/90 hover:border-gray-700 rounded-2xl p-5 shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
                      {agent.department}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">{agent.role}</h3>
                    <p className="text-xs text-gray-400">{agent.name}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isWorking 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse' 
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                <div className="my-3 p-3 bg-gray-900/60 border border-gray-800/80 rounded-xl text-xs text-gray-300">
                  <div className="text-[10px] uppercase font-semibold text-gray-500 mb-1">Active Objective</div>
                  <p className="line-clamp-2">{agent.task || 'Awaiting instructions'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
                  <div className="p-2 bg-gray-900/40 rounded-lg border border-gray-800">
                    <div className="text-gray-500 flex items-center gap-1"><Cpu size={12} /> Model</div>
                    <div className="font-mono text-gray-200 truncate font-medium">{agent.model}</div>
                  </div>
                  <div className="p-2 bg-gray-900/40 rounded-lg border border-gray-800">
                    <div className="text-gray-500 flex items-center gap-1"><Shield size={12} /> Authority</div>
                    <div className="font-mono text-amber-300 font-medium">{agent.permissionLevel}</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800/80 flex items-center gap-2">
                <button
                  onClick={() => onSelectAgent(agent)}
                  className="flex-1 py-2 text-center text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl transition-colors"
                >
                  Inspect Profile
                </button>
                <button
                  onClick={() => onToggleStatus(agent.id)}
                  className={`p-2 rounded-xl border transition-colors ${
                    isWorking 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' 
                      : 'bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600/30'
                  }`}
                  title={isWorking ? 'Pause Agent' : 'Activate Agent'}
                >
                  {isWorking ? <Pause size={15} /> : <Play size={15} />}
                </button>
                <button
                  onClick={() => onDispatchTask(agent.id)}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  title="Dispatch Task"
                >
                  <Zap size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
