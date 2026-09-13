"use client";

import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles,
  X
} from 'lucide-react';

interface RequiredSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete: (mongoData: any) => void;
  onGoToSettings: () => void;
}

export default function RequiredSetupModal({
  isOpen,
  onClose,
  onSetupComplete,
  onGoToSettings,
}: RequiredSetupModalProps) {
  const [mongoUri, setMongoUri] = useState('');
  const [showMongoUri, setShowMongoUri] = useState(false);
  const [nvidiaKey, setNvidiaKey] = useState('');
  const [showNvidiaKey, setShowNvidiaKey] = useState(false);

  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const getBackendUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:8003';
    const host = window.location.hostname || 'localhost';
    return `http://${host}:8003`;
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mongoUri.trim()) {
      setErrorMsg('Please provide your Cloud MongoDB Atlas connection string.');
      return;
    }

    setConnecting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${getBackendUrl()}/api/v1/system/quick-setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mongodb_uri: mongoUri.trim(),
          nvidia_api_key: nvidiaKey.trim(),
          nvidia_nim_endpoint: 'https://integrate.api.nvidia.com/v1',
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const latency = data.mongodb?.latency_ms ? ` (${data.mongodb.latency_ms}ms)` : '';
        setSuccessMsg(`Cloud MongoDB Atlas successfully connected${latency}! All company documents and multi-agent events are now active.`);
        setTimeout(() => {
          onSetupComplete(data.mongodb);
          onClose();
        }, 1500);
      } else {
        setErrorMsg(data.detail || data.error || 'Connection failed: could not reach Cloud MongoDB Atlas cluster.');
      }
    } catch (err: any) {
      setErrorMsg(`Network or connection error: ${err.message}`);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111622] border border-amber-500/40 rounded-2xl w-full max-w-xl p-6 sm:p-8 shadow-2xl shadow-amber-950/20 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Database size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Required Action
                </span>
                <span className="text-xs text-gray-400">Default Cloud Database</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                Complete Cloud MongoDB Setup
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Informational context */}
        <div className="text-xs text-gray-300 space-y-2 bg-gray-900/60 p-3.5 rounded-xl border border-gray-800">
          <p>
            CompanyOS runs an autonomous multi-agent organization. By architectural design, <strong className="text-white">Cloud MongoDB Atlas is active by default</strong> (no local container is required in docker-compose).
          </p>
          <p className="text-gray-400">
            Before launching autonomous business cycles, you must connect your Cloud MongoDB database to store agent memory, task graphs, and real-time audit logs.
          </p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleConnect} className="space-y-4">
          {/* MongoDB URI Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-200">
                Cloud MongoDB Connection String (Atlas URI) *
              </label>
              <a
                href="https://cloud.mongodb.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                <span>Free Atlas Cluster</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <div className="relative">
              <input
                type={showMongoUri ? "text" : "password"}
                required
                placeholder="mongodb+srv://<username>:<password>@cluster.mongodb.net/companyos?retryWrites=true&w=majority"
                value={mongoUri}
                onChange={(e) => setMongoUri(e.target.value)}
                className="w-full bg-[#0b0f19] border border-gray-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500 transition-colors placeholder-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowMongoUri(!showMongoUri)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showMongoUri ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Optional NVIDIA API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-300">
                NVIDIA NIM API Key <span className="text-gray-500 font-normal">(Optional for 90+ Models)</span>
              </label>
              <a
                href="https://build.nvidia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                <span>build.nvidia.com</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <div className="relative">
              <input
                type={showNvidiaKey ? "text" : "password"}
                placeholder="nvapi-..."
                value={nvidiaKey}
                onChange={(e) => setNvidiaKey(e.target.value)}
                className="w-full bg-[#0b0f19] border border-gray-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowNvidiaKey(!showNvidiaKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showNvidiaKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
              <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-700/50 rounded-xl text-xs text-emerald-300 flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onGoToSettings();
              }}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Or configure manually in Settings</span>
              <ArrowRight size={13} />
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Later
              </button>

              <button
                type="submit"
                disabled={connecting}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {connecting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Verifying Atlas Cluster...</span>
                  </>
                ) : (
                  <>
                    <Database size={14} />
                    <span>Connect & Verify Setup</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
