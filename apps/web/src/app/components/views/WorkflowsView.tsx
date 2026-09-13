"use client";

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Play, 
  RefreshCw, 
  Plus, 
  Inbox, 
  Check, 
  X,
  Building2,
  DollarSign
} from 'lucide-react';

export interface ApprovalItem {
  id: string;
  title: string;
  requester: string;
  department: string;
  cost: string;
  expected_return?: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  decided_at?: string | null;
}

export default function WorkflowsView({
  onRunWorkflow,
}: {
  onRunWorkflow: () => void;
}) {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'DECIDED'>('PENDING');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State for new approval
  const [formTitle, setFormTitle] = useState('');
  const [formRequester, setFormRequester] = useState('Agent CEO');
  const [formDepartment, setFormDepartment] = useState('Strategy & Operations');
  const [formCost, setFormCost] = useState('₹5,000');
  const [formReturn, setFormReturn] = useState('₹25,000 ARR');
  const [formRisk, setFormRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');

  const getBackendUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:8003';
    const host = window.location.hostname || 'localhost';
    return `http://${host}:8003`;
  };

  const fetchApprovals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${getBackendUrl()}/api/v1/approvals/`);
      if (res.ok) {
        const data = await res.json();
        setApprovals(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch approvals', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`${getBackendUrl()}/api/v1/approvals/${id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });

      if (res.ok) {
        const updated = await res.json();
        setApprovals((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: updated.status, decided_at: updated.decided_at } : item))
        );
      } else {
        alert('Failed to update decision: ' + (await res.text()));
      }
    } catch (err: any) {
      alert('Network error: ' + err.message);
    }
  };

  const handleCreateApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch(`${getBackendUrl()}/api/v1/approvals/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          requester: formRequester,
          department: formDepartment,
          cost: formCost,
          expected_return: formReturn,
          risk: formRisk,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setApprovals((prev) => [created, ...prev]);
        setModalOpen(false);
        setFormTitle('');
      } else {
        alert('Failed to create approval request: ' + (await res.text()));
      }
    } catch (err: any) {
      alert('Error creating approval request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = approvals.filter((item) => {
    if (filter === 'PENDING') return item.status === 'PENDING';
    if (filter === 'DECIDED') return item.status === 'APPROVED' || item.status === 'REJECTED';
    return true;
  });

  const pendingCount = approvals.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#0b0f19] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workflows & Human Sign-off Center</h1>
          <p className="text-xs text-gray-400 mt-1">
            Genuine human-in-the-loop approvals, bounded autonomy limits, and audit logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchApprovals}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl border border-gray-700 transition-all active:scale-95"
            title="Refresh from database"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Plus size={15} />
            <span>New Request</span>
          </button>

          <button
            onClick={onRunWorkflow}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <Play size={15} />
            <span>Trigger Autonomous Pipeline</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between my-6">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-amber-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-200">
            Authorization Gate ({pendingCount} Pending)
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-[#131722] p-1 border border-gray-800 rounded-xl">
          {(['PENDING', 'DECIDED', 'ALL'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg uppercase tracking-wider transition-colors ${
                filter === mode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {mode} {mode === 'PENDING' && pendingCount > 0 ? `(${pendingCount})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Approvals List */}
      {isLoading ? (
        <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-2">
          <RefreshCw size={24} className="animate-spin text-blue-500" />
          <span className="text-xs">Loading live approval records from PostgreSQL...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-[#131722]/60 border border-dashed border-gray-800 rounded-2xl text-center flex flex-col items-center justify-center">
          <Inbox size={40} className="text-gray-600 mb-3" />
          <h3 className="text-sm font-semibold text-gray-300">No {filter.toLowerCase()} approvals</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            {filter === 'PENDING' 
              ? 'Agents will submit authorization requests when operations exceed autonomous budget or risk limits.'
              : 'Decided approval transactions will be recorded here for regulatory and audit tracking.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#131722] border border-gray-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold text-blue-400">{item.requester}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-[11px] text-gray-400">{item.department}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-[11px] text-gray-500 font-mono">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent'}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-gray-400">
                  <span>
                    Authorized Cost: <strong className="text-emerald-400 font-mono">{item.cost}</strong>
                  </span>
                  {item.expected_return && (
                    <span>
                      Expected Return: <strong className="text-blue-300 font-mono">{item.expected_return}</strong>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    Risk: 
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      item.risk === 'LOW' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {item.risk}
                    </span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                {item.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => handleAction(item.id, 'APPROVED')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                    >
                      <CheckCircle2 size={14} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'REJECTED')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/40 text-xs font-semibold rounded-xl transition-all active:scale-95"
                    >
                      <XCircle size={14} />
                      <span>Reject</span>
                    </button>
                  </>
                ) : (
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    item.status === 'APPROVED' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {item.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workflow Loop Architecture */}
      <div className="mt-8 pt-6 border-t border-gray-800">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4">
          Autonomous Company Business Loop
        </h2>

        <div className="bg-[#131722] border border-gray-800 rounded-2xl p-6 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { step: "01", title: "Strategic Vision", agent: "Agent CEO", desc: "Sets weekly direction and goals" },
              { step: "02", title: "Market Research", agent: "Strategy Director", desc: "Evaluates demand & pricing" },
              { step: "03", title: "PRD & Architecture", agent: "Product Director", desc: "Synthesizes detailed roadmap" },
              { step: "04", title: "Implementation", agent: "Engineering Director", desc: "Develops core features & QA" },
              { step: "05", title: "Autonomous Revenue", agent: "Revenue Director", desc: "Closes clients & collects revenue" },
            ].map((step, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-800 bg-gray-900/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono text-gray-500">{step.step}</span>
                    <span className="text-blue-400 font-bold uppercase text-[10px]">Active Loop</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white">{step.title}</h4>
                  <p className="text-[11px] text-gray-400 mt-1">{step.desc}</p>
                </div>
                <div className="text-[10px] text-blue-300 font-mono mt-3 bg-blue-950/40 px-2 py-1 rounded border border-blue-900/40">
                  {step.agent}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Create Approval Request */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-[#131722] border border-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-amber-400" />
                Submit Human Authorization Request
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateApproval} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Request Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Authorize ₹10,000 for high-memory GPU inference nodes"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Requester</label>
                  <input
                    type="text"
                    value={formRequester}
                    onChange={(e) => setFormRequester(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Department</label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Cost</label>
                  <input
                    type="text"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Expected Return</label>
                  <input
                    type="text"
                    value={formReturn}
                    onChange={(e) => setFormReturn(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Risk Tier</label>
                  <select
                    value={formRisk}
                    onChange={(e) => setFormRisk(e.target.value as any)}
                    className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2"
                >
                  {submitting ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={14} />}
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
