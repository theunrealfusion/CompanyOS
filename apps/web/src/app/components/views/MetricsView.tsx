"use client";

import React, { useState } from 'react';
import { DollarSign, TrendingUp, Cpu, PieChart, Activity, Zap, CheckCircle2 } from 'lucide-react';

export default function MetricsView() {
  const [range, setRange] = useState<'today' | '7d' | '30d'>('7d');

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#0b0f19] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Economics & Revenue Intelligence</h1>
          <p className="text-xs text-gray-400 mt-1">Autonomous company unit economics, compute cost, and profit margins</p>
        </div>

        <div className="flex items-center gap-1 bg-[#131722] p-1 border border-gray-800 rounded-xl">
          {(['today', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg uppercase tracking-wider transition-colors ${
                range === r ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* North Star Metric Card */}
      <div className="my-6 p-6 bg-gradient-to-r from-blue-950/40 via-[#131722] to-emerald-950/30 border border-blue-800/40 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold mb-2">
          <Zap size={14} /> CompanyOS North Star Metric
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight">₹43,920</div>
            <p className="text-xs text-gray-300 mt-1">Economic Value Generated per Hour of Founder Attention</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              +34.2% Autonomous Leverage
            </span>
          </div>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#131722] border border-gray-800 rounded-xl p-5 shadow-lg">
          <div className="text-xs text-gray-400 font-medium">Total Revenue</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">₹1,42,800</div>
          <div className="text-[11px] text-emerald-500/90 mt-2 font-medium">↑ 24% vs last period</div>
        </div>

        <div className="bg-[#131722] border border-gray-800 rounded-xl p-5 shadow-lg">
          <div className="text-xs text-gray-400 font-medium">Net Profit</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">₹98,400</div>
          <div className="text-[11px] text-gray-400 mt-2">68.9% Net Margin</div>
        </div>

        <div className="bg-[#131722] border border-gray-800 rounded-xl p-5 shadow-lg">
          <div className="text-xs text-gray-400 font-medium">Monthly Recurring (MRR)</div>
          <div className="text-2xl font-bold text-blue-400 mt-1 font-mono">₹54,000</div>
          <div className="text-[11px] text-blue-300/80 mt-2">7 Active SaaS Subscriptions</div>
        </div>

        <div className="bg-[#131722] border border-gray-800 rounded-xl p-5 shadow-lg">
          <div className="text-xs text-gray-400 font-medium">Agent Compute & API Cost</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">₹3,250</div>
          <div className="text-[11px] text-gray-400 mt-2">2.2% of Total Revenue</div>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#131722] border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4">
            Compute Cost Attribution
          </h3>
          <div className="space-y-3 text-xs">
            {[
              { dept: "Engineering & Architecture", cost: "₹1,365", pct: 42, color: "bg-cyan-500" },
              { dept: "Strategy & Market Research", cost: "₹812", pct: 25, color: "bg-emerald-500" },
              { dept: "Product & Spec Synthesis", cost: "₹585", pct: 18, color: "bg-amber-500" },
              { dept: "Revenue & Customer Pipeline", cost: "₹488", pct: 15, color: "bg-rose-500" },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-gray-300">{item.dept}</span>
                  <span className="font-mono text-gray-200">{item.cost} ({item.pct}%)</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#131722] border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4">
            Recent Autonomous Revenue Inflow
          </h3>
          <div className="space-y-3 font-mono text-xs">
            {[
              { desc: "GPU Cluster Optimization SaaS Plan", amount: "+₹18,500", time: "1 hr ago", customer: "Datastream AI" },
              { desc: "Autonomous Lead Recovery Platform License", amount: "+₹12,000", time: "4 hrs ago", customer: "ScaleGrowth Inc" },
              { desc: "Enterprise Architecture Consulting Review", amount: "+₹35,000", time: "Yesterday", customer: "TechVentures" },
            ].map((tx, idx) => (
              <div key={idx} className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-white font-sans text-xs font-semibold">{tx.desc}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{tx.customer} • {tx.time}</div>
                </div>
                <div className="text-emerald-400 font-bold text-sm">{tx.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
