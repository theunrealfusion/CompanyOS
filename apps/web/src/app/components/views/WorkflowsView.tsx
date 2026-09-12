"use client";

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, ArrowRight, ShieldCheck, Play, RefreshCw } from 'lucide-react';

interface ApprovalItem {
  id: string;
  title: string;
  requester: string;
  department: string;
  cost: string;
  expectedReturn: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
}

export default function WorkflowsView({
  onRunWorkflow,
}: {
  onRunWorkflow: () => void;
}) {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([
    {
      id: 'app-01',
      title: 'Authorize ₹4,500 validation budget for AI GPU Cloud SaaS market test',
      requester: 'Agent CEO',
      department: 'Executive / Strategy',
      cost: '₹4,500',
      expectedReturn: '₹25,000 - ₹60,000',
      risk: 'LOW',
      status: 'PENDING',
      timestamp: '12 mins ago',
    },
    {
      id: 'app-02',
      title: 'Deploy Automated Social Content Engine (LinkedIn & X) with live publishing',
      requester: 'Agent Prod',
      department: 'Product / Growth',
      cost: '₹1,200/mo',
      expectedReturn: '15,000 Impressions / wk',
      risk: 'MEDIUM',
      status: 'PENDING',
      timestamp: '34 mins ago',
    },
    {
      id: 'app-03',
      title: 'Merge & Release Inference Gateway v1.2 with Claude 3.5 Sonnet fallback',
      requester: 'Agent Eng',
      department: 'Engineering',
      cost: '₹0',
      expectedReturn: '99.99% Reliability',
      risk: 'LOW',
      status: 'APPROVED',
      timestamp: '2 hours ago',
    },
  ]);

  const handleAction = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setApprovals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const steps = [
    { title: "Market Research", agent: "Strategy", status: "completed" },
    { title: "Opportunity Scoring", agent: "Strategy", status: "completed" },
    { title: "PRD & Architecture", agent: "Product / Eng", status: "active" },
    { title: "Implementation", agent: "Engineering", status: "pending" },
    { title: "Autonomous Launch", agent: "Growth / Rev", status: "pending" },
  ];

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#0b0f19] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workflows & Approvals Center</h1>
          <p className="text-xs text-gray-400 mt-1">
            Temporal workflow pipelines, human-in-the-loop signoffs, and execution state
          </p>
        </div>

        <button
          onClick={onRunWorkflow}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Play size={15} />
          <span>Trigger Autonomous Pipeline</span>
        </button>
      </div>

      {/* Human Approvals Gate */}
      <div className="my-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-200">
              Pending Human Sign-off ({approvals.filter(a => a.status === 'PENDING').length})
            </h2>
          </div>
          <span className="text-xs text-gray-500">Shared across Web, Telegram, and CLI</span>
        </div>

        <div className="space-y-3">
          {approvals.map((item) => (
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
                  <span className="text-[11px] text-gray-500">{item.timestamp}</span>
                </div>
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-gray-400">
                  <span>Authorized Cost: <strong className="text-emerald-400 font-mono">{item.cost}</strong></span>
                  <span>Expected Return: <strong className="text-blue-300 font-mono">{item.expectedReturn}</strong></span>
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
                    item.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {item.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Pipeline */}
      <div className="mt-8 pt-6 border-t border-gray-800">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4">
          Autonomous Business Loop Pipeline
        </h2>

        <div className="bg-[#131722] border border-gray-800 rounded-2xl p-6 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  step.status === 'completed'
                    ? 'bg-emerald-950/20 border-emerald-800/40'
                    : step.status === 'active'
                    ? 'bg-blue-950/30 border-blue-600 shadow-lg shadow-blue-500/10'
                    : 'bg-gray-900/40 border-gray-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono text-gray-500">0{idx + 1}</span>
                    <span className={`capitalize font-bold ${
                      step.status === 'completed' ? 'text-emerald-400' : step.status === 'active' ? 'text-blue-400 animate-pulse' : 'text-gray-500'
                    }`}>
                      {step.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white">{step.title}</h4>
                </div>
                <div className="text-[11px] text-gray-400 mt-3 font-mono">{step.agent}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
