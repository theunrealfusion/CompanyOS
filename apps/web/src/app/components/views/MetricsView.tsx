"use client";

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Cpu, 
  PieChart, 
  Activity, 
  Zap, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  X,
  ArrowDownRight,
  ArrowUpRight,
  Receipt
} from 'lucide-react';

interface Transaction {
  id: string;
  description: string;
  amount: string;
  type: 'REVENUE' | 'EXPENSE';
  customer: string;
  time: string;
}

interface MetricsData {
  total_tasks: number;
  completed_tasks: number;
  total_agents: number;
  active_agents: number;
  total_events: number;
  pending_approvals: number;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  compute_cost: number;
  recent_transactions: Transaction[];
}

export default function MetricsView() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [txType, setTxType] = useState<'REVENUE' | 'EXPENSE'>('REVENUE');
  const [txCategory, setTxCategory] = useState('Enterprise SaaS');
  const [txAmount, setTxAmount] = useState('10000');
  const [txCustomer, setTxCustomer] = useState('Direct Client');
  const [txDesc, setTxDesc] = useState('Quarterly subscription license');

  const getBackendUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:8003';
    const host = window.location.hostname || 'localhost';
    return `http://${host}:8003`;
  };

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getBackendUrl()}/api/v1/metrics/`);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error('Failed to fetch metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(txAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${getBackendUrl()}/api/v1/metrics/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: txType,
          category: txCategory,
          amount: parsedAmount,
          customer: txCustomer,
          description: txDesc,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        setTxDesc('');
        await fetchMetrics();
      } else {
        alert('Failed to record transaction: ' + (await res.text()));
      }
    } catch (err: any) {
      alert('Error recording transaction: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const revenue = metrics?.total_revenue || 0;
  const expenses = metrics?.total_expenses || 0;
  const computeCost = metrics?.compute_cost || 0;
  const netProfit = metrics?.net_profit || 0;
  const roiMultiplier = computeCost > 0 ? (revenue / computeCost).toFixed(1) : '100+';

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#0b0f19] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Economics & Revenue Intelligence</h1>
          <p className="text-xs text-gray-400 mt-1">
            Genuine autonomous company unit economics, compute cost, and verified ledger
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMetrics}
            className="flex items-center gap-2 px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl border border-gray-700 transition-all active:scale-95"
            title="Refresh metrics from PostgreSQL"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Plus size={15} />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* North Star Metric Card */}
      <div className="my-6 p-6 bg-gradient-to-r from-blue-950/40 via-[#131722] to-emerald-950/30 border border-blue-800/40 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold mb-2">
          <Zap size={14} /> CompanyOS Autonomous Leverage Ratio
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {roiMultiplier}x
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Economic Value Generated per ₹1.00 of AI Model Compute Spend
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              {metrics?.completed_tasks || 0} Autonomous Tasks Completed
            </span>
          </div>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#131722] border border-gray-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
            <span>Total Revenue</span>
            <ArrowUpRight size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
            {formatINR(revenue)}
          </div>
          <div className="text-[11px] text-gray-400 mt-2 font-medium">
            From verified customer ledger
          </div>
        </div>

        <div className="bg-[#131722] border border-gray-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
            <span>Net Profit</span>
            <DollarSign size={16} className="text-white" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">
            {formatINR(netProfit)}
          </div>
          <div className="text-[11px] text-gray-400 mt-2">
            Revenue minus expenses and compute
          </div>
        </div>

        <div className="bg-[#131722] border border-gray-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
            <span>Operating Expenses</span>
            <ArrowDownRight size={16} className="text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">
            {formatINR(expenses)}
          </div>
          <div className="text-[11px] text-gray-400 mt-2">
            Recorded business expenditures
          </div>
        </div>

        <div className="bg-[#131722] border border-gray-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
            <span>Agent Compute & API Cost</span>
            <Cpu size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
            {formatINR(computeCost)}
          </div>
          <div className="text-[11px] text-gray-400 mt-2">
            Calculated from model token usage
          </div>
        </div>
      </div>

      {/* Operational Breakdown & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operational Statistics */}
        <div className="bg-[#131722] border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4 flex items-center justify-between">
            <span>Operational Activity</span>
            <span className="text-xs font-normal text-gray-400 font-mono">Live PostgreSQL DB</span>
          </h3>
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-xl border border-gray-800">
              <span className="text-gray-300">Total Company Tasks Executed</span>
              <span className="font-mono text-white font-bold">{metrics?.total_tasks || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-xl border border-gray-800">
              <span className="text-gray-300">Completed Autonomous Tasks</span>
              <span className="font-mono text-emerald-400 font-bold">{metrics?.completed_tasks || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-xl border border-gray-800">
              <span className="text-gray-300">Configured Autonomous Agents</span>
              <span className="font-mono text-blue-400 font-bold">{metrics?.total_agents || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-xl border border-gray-800">
              <span className="text-gray-300">System Audit Events Logged</span>
              <span className="font-mono text-amber-300 font-bold">{metrics?.total_events || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-xl border border-gray-800">
              <span className="text-gray-300">Pending Human Approvals</span>
              <span className="font-mono text-rose-300 font-bold">{metrics?.pending_approvals || 0}</span>
            </div>
          </div>
        </div>

        {/* Recent Ledger Inflow / Outflow */}
        <div className="bg-[#131722] border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200">
                Verified Financial Ledger
              </h3>
              <span className="text-xs text-gray-400">
                {metrics?.recent_transactions?.length || 0} records
              </span>
            </div>

            {(!metrics?.recent_transactions || metrics.recent_transactions.length === 0) ? (
              <div className="py-12 border border-dashed border-gray-800 rounded-xl text-center flex flex-col items-center justify-center">
                <Receipt size={36} className="text-gray-600 mb-2" />
                <p className="text-xs text-gray-400">No transactions recorded yet in database.</p>
                <p className="text-[11px] text-gray-600 mt-1">
                  Click &ldquo;Record Transaction&rdquo; above to log actual client revenue or expenses.
                </p>
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs max-h-72 overflow-y-auto">
                {metrics.recent_transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-white font-sans text-xs font-semibold">{tx.description}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {tx.customer} • {tx.time}
                      </div>
                    </div>
                    <div className={`font-bold text-sm ${
                      tx.type === 'REVENUE' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {tx.type === 'REVENUE' ? '+' : '-'}{tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Record Transaction */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-[#131722] border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-400" />
                Record Verified Transaction
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Transaction Type</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as any)}
                    className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="REVENUE">REVENUE (Inflow)</option>
                    <option value="EXPENSE">EXPENSE (Outflow)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Amount (₹ INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 15000"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise SaaS License, Cloud GPU, Consulting"
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Client / Vendor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ScaleGrowth Corp, AWS, Direct Customer"
                  value={txCustomer}
                  onChange={(e) => setTxCustomer(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly subscription for autonomous agents"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2"
                >
                  {submitting ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={14} />}
                  <span>Record Transaction</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
