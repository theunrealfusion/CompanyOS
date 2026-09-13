import React, { useState } from 'react';
import { Search, Plus, Play, Pause, Zap, Cpu, Shield, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { AgentRecord } from './AgentDrawer';

export default function AgentsView({
  agents = [],
  onSelectAgent,
  onToggleStatus,
  onDispatchTask,
}: {
  agents: AgentRecord[];
  onSelectAgent: (agent: AgentRecord) => void;
  onToggleStatus: (agentId: string, nextStatus: string) => Promise<void>;
  onDispatchTask: (agentId: string) => void;
}) {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'WORKING' | 'PAUSED'>('ALL');
  const [search, setSearch] = useState('');

  const filtered = agents.filter((a) => {
    const s = a.status.toUpperCase();
    const matchesFilter = filter === 'ALL' || s === filter;
    const matchesSearch = 
      a.role.toLowerCase().includes(search.toLowerCase()) || 
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.current_task && a.current_task.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-950 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Autonomous Agents Directory</h1>
          <p className="text-xs text-gray-400 mt-1">Manage AI personas, operating states, and active directives</p>
        </div>

        <button 
          onClick={() => onDispatchTask(agents[0]?.id || 'agent_ceo')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus size={16} />
          <span>Dispatch New Task</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-6">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search agents by role, name, task..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-gray-500"
          />
        </div>

        <div className="flex gap-1.5 p-1 bg-gray-900 border border-gray-800 rounded-xl w-full sm:w-auto">
          {(['ALL', 'ACTIVE', 'WORKING', 'PAUSED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                filter === tab 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((agent) => {
          const isWorking = agent.status.toLowerCase() === 'working';
          const isPaused = agent.status.toLowerCase() === 'paused';
          const isActive = agent.status.toLowerCase() === 'active';

          return (
            <div
              key={agent.id}
              className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all"
            >
              <div>
                {/* Top bar: Role, status, toggle */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                      {agent.role.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{agent.role}</h3>
                      <p className="text-xs text-gray-400">{agent.name}</p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    isWorking 
                      ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' 
                      : isActive 
                      ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' 
                      : 'bg-rose-400/10 text-rose-400 border border-rose-400/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      isWorking ? 'bg-amber-400 animate-ping' : isActive ? 'bg-emerald-400' : 'bg-rose-400'
                    }`} />
                    {agent.status}
                  </span>
                </div>

                {/* Current Task */}
                <div className="my-3">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">
                    Current Task
                  </div>
                  <p className="text-xs text-gray-300 line-clamp-2 bg-gray-950/60 p-2.5 rounded-xl border border-gray-800/80 min-h-[44px]">
                    {agent.current_task ? `⚡ ${agent.current_task}` : 'Idle - Ready for directives'}
                  </p>
                </div>

                {/* Metadata badges */}
                <div className="grid grid-cols-2 gap-2 my-3 text-[11px]">
                  <div className="p-2 bg-gray-950/40 border border-gray-800/80 rounded-lg">
                    <div className="text-gray-500 flex items-center gap-1">
                      <Cpu size={11} /> Model
                    </div>
                    <div className="font-mono text-gray-300 font-medium truncate mt-0.5">{agent.model}</div>
                  </div>

                  <div className="p-2 bg-gray-950/40 border border-gray-800/80 rounded-lg">
                    <div className="text-gray-500 flex items-center gap-1">
                      <Shield size={11} /> Authority
                    </div>
                    <div className="font-mono text-amber-300 font-medium mt-0.5">{agent.authority} / 100</div>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-3 border-t border-gray-800/80 flex items-center gap-2 mt-2">
                <button
                  onClick={() => onToggleStatus(agent.id, isPaused ? 'active' : 'paused')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
                    isPaused
                      ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20'
                      : 'bg-rose-600/10 border-rose-500/30 text-rose-400 hover:bg-rose-600/20'
                  }`}
                  title={isPaused ? "Resume Agent" : "Pause Agent"}
                >
                  {isPaused ? <Play size={12} /> : <Pause size={12} />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>

                <button
                  onClick={() => onDispatchTask(agent.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-95"
                >
                  <Zap size={12} />
                  <span>Give Task</span>
                </button>

                <button
                  onClick={() => onSelectAgent(agent)}
                  className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl transition-colors"
                  title="View Full Agent Profile"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
