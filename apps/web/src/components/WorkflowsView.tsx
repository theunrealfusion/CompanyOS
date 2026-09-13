import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, Plus, Check, X, Users, ArrowRight } from 'lucide-react';

export interface TaskRecord {
  id: string;
  description: string;
  executor: string;
  priority: string;
  risk: string;
  status: string;
  expected_outcome?: string;
  created_at: string;
}

export interface FrictionRecord {
  id: string;
  subject: string;
  conflict_type: string;
  participants: string[];
  status: string;
  proposals?: Array<{
    id: string;
    agent_id: string;
    description: string;
    claims?: Array<{ description: string; confidence: number }>;
  }>;
}

export interface DecisionRecord {
  id: string;
  friction_id: string;
  description: string;
  chosen_proposal_id: string;
  decision_score: number;
  required_authority: number;
  approvers: string[];
  status: string;
}

export default function WorkflowsView({
  tasks = [],
  frictions = [],
  decisions = [],
  onUpdateTaskStatus,
  onDispatchTask,
}: {
  tasks: TaskRecord[];
  frictions: FrictionRecord[];
  decisions: DecisionRecord[];
  onUpdateTaskStatus: (taskId: string, nextStatus: string) => Promise<void>;
  onDispatchTask: () => void;
}) {
  const [filter, setFilter] = useState<'ALL' | 'IN_PROGRESS' | 'PENDING' | 'COMPLETED'>('ALL');

  const filteredTasks = tasks.filter((t) => {
    const s = t.status.toUpperCase();
    if (filter === 'ALL') return true;
    if (filter === 'IN_PROGRESS') return s === 'IN_PROGRESS' || s === 'WORKING';
    if (filter === 'PENDING') return s === 'PENDING';
    if (filter === 'COMPLETED') return s === 'COMPLETED';
    return true;
  });

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-950 text-white space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workflows & Task Directives</h1>
          <p className="text-xs text-gray-400 mt-1">Live task queue, agent assignments, and friction consensus decisions</p>
        </div>

        <button 
          onClick={onDispatchTask}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus size={16} />
          <span>Dispatch New Task</span>
        </button>
      </div>

      {/* Task Queue Section */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold text-gray-200 flex items-center gap-2">
            <Clock size={16} className="text-blue-400" />
            <span>Active Directives & Task Queue ({tasks.length})</span>
          </h2>

          <div className="flex gap-1.5 p-1 bg-gray-900 border border-gray-800 rounded-xl">
            {(['ALL', 'IN_PROGRESS', 'PENDING', 'COMPLETED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 text-xs font-medium rounded-lg capitalize transition-colors ${
                  filter === tab ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.replace('_', ' ').toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-gray-900 border border-gray-800 rounded-2xl text-gray-400 text-xs">
            No directives found matching this filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const isCompleted = task.status.toLowerCase() === 'completed';
              const isInProgress = task.status.toLowerCase() === 'in_progress' || task.status.toLowerCase() === 'working';

              return (
                <div
                  key={task.id}
                  className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        isInProgress
                          ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                          : isCompleted
                          ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                          : 'bg-blue-400/10 text-blue-400 border border-blue-400/20'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>

                      <span className="text-[11px] px-2 py-0.5 bg-gray-800 text-gray-300 rounded font-medium">
                        Assignee: <strong className="text-white">{task.executor}</strong>
                      </span>

                      <span className="text-[10px] uppercase font-bold text-gray-500">
                        Priority: <span className="text-gray-300">{task.priority}</span>
                      </span>
                    </div>

                    <p className="text-sm font-medium text-white">{task.description}</p>
                    {task.expected_outcome && (
                      <p className="text-xs text-gray-400">Target outcome: {task.expected_outcome}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isCompleted ? (
                      <button
                        onClick={() => onUpdateTaskStatus(task.id, 'completed')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold rounded-lg transition-colors"
                      >
                        <Check size={13} />
                        <span>Mark Complete</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateTaskStatus(task.id, 'in_progress')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-gray-300 hover:text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <span>Re-open</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Frictions & Consensus Decisions */}
      <div className="pt-6 border-t border-gray-800">
        <h2 className="text-base font-semibold text-gray-200 flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-rose-400" />
          <span>Frictions & Consensus Resolutions</span>
        </h2>

        <div className="space-y-4">
          {frictions.map((fric) => (
            <div key={fric.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-bold rounded uppercase">
                      {fric.conflict_type}
                    </span>
                    <h3 className="text-base font-bold text-white">{fric.subject}</h3>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                    <Users size={13} /> Participants: {fric.participants.join(', ')}
                  </p>
                </div>

                <span className="text-xs px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-medium capitalize">
                  Status: {fric.status}
                </span>
              </div>

              {/* Proposals */}
              {fric.proposals && fric.proposals.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Tabled Proposals
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {fric.proposals.map((prop) => (
                      <div key={prop.id} className="p-3 bg-gray-950/60 border border-gray-800 rounded-xl space-y-1">
                        <div className="text-[11px] font-bold text-blue-400">{prop.agent_id}</div>
                        <p className="text-xs text-gray-300">{prop.description}</p>
                        {prop.claims && prop.claims[0] && (
                          <div className="text-[10px] text-gray-500 pt-1">
                            Claim: {prop.claims[0].description} ({Math.round(prop.claims[0].confidence * 100)}% conf)
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Decision */}
              {decisions.filter(d => d.friction_id === fric.id).map((dec) => (
                <div key={dec.id} className="p-4 bg-purple-950/20 border border-purple-800/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase">
                      <ShieldCheck size={15} />
                      <span>Approved Organizational Decision</span>
                    </div>
                    <span className="text-[11px] text-purple-400 font-mono">
                      Consensus Score: {Math.round(dec.decision_score * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-purple-100 font-medium">{dec.description}</p>
                  <div className="text-[10px] text-purple-400 flex items-center gap-2">
                    <span>Approved by: {dec.approvers.join(', ')}</span>
                    <span>•</span>
                    <span>Required Authority: {dec.required_authority}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
