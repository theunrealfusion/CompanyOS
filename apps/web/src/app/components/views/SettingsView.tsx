"use client";

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Cpu, 
  Server, 
  Radio, 
  ShieldAlert,
  Key,
  Eye,
  EyeOff,
  Save,
  Sliders,
  Sparkles,
  DollarSign,
  Database,
  Zap,
  Play,
  Brain,
  ExternalLink
} from 'lucide-react';

interface SettingsViewProps {
  onMongoStatusChange?: (isConnected: boolean, latencyMs: number | null) => void;
}

export default function SettingsView({ onMongoStatusChange }: SettingsViewProps = {}) {
  const [apiUrl, setApiUrl] = useState('http://localhost:8003');
  const [apiStatus, setApiStatus] = useState<'testing' | 'online' | 'offline'>('online');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState<string>("ae5ecdc5-0a51-4589-98d6-fe7a4362d559");

  // Show/hide API keys
  const [showNvidiaKey, setShowNvidiaKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showTelegramToken, setShowTelegramToken] = useState(false);
  const [showMongoUri, setShowMongoUri] = useState(false);

  // NVIDIA NIM Models State
  const [nvidiaModels, setNvidiaModels] = useState<Array<{ id: string; name: string; owned_by?: string; supports_thinking?: boolean }>>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [fetchModelsFeedback, setFetchModelsFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  // NVIDIA NIM Model Test State
  const [testNvidiaModel, setTestNvidiaModel] = useState('nvidia/nemotron-3-ultra-550b-a55b');
  const [testPrompt, setTestPrompt] = useState('Write a limerick about the wonders of GPU computing.');
  const [testEnableThinking, setTestEnableThinking] = useState(true);
  const [testingNvidia, setTestingNvidia] = useState(false);
  const [testOutput, setTestOutput] = useState<{ reasoning: string; content: string } | null>(null);

  // Cloud MongoDB State (Default database)
  const [mongoUri, setMongoUri] = useState('');
  const [mongoStatus, setMongoStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'NOT_CONFIGURED' | 'TESTING'>('NOT_CONFIGURED');
  const [mongoLatency, setMongoLatency] = useState<number | null>(null);
  const [mongoCollections, setMongoCollections] = useState<string[]>([]);
  const [mongoTesting, setMongoTesting] = useState(false);
  const [mongoFeedback, setMongoFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  // Settings State
  const [settings, setSettings] = useState({
    // Model Router
    default_model: "nvidia/nemotron-3-ultra-550b-a55b",
    fallback_model: "gpt-4o-mini",
    nvidia_api_key: "",
    nvidia_nim_endpoint: "https://integrate.api.nvidia.com/v1",
    gemini_api_key: "",
    openai_api_key: "",
    anthropic_api_key: "",
    ollama_vllm_url: "http://localhost:11434",
    temperature: 0.2,
    max_tokens: 4096,
    // Telegram Message Gateway
    telegram_bot_token: "",
    telegram_allowed_users: "@founder, @ceo",
    telegram_mode: "polling",
    telegram_topic_routing: true,
    // Economics & Governance
    company_name: "CompanyOS Labs",
    company_mission: "Build and scale autonomous AI software companies",
    currency: "INR (₹)",
    monthly_budget_cap: "500000",
    human_approval_threshold: "5000",
    emergency_spend_limit: "25000",
    autonomous_mode: "SUPERVISED",
  });

  // Load existing settings on mount
  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined') {
        const host = window.location.hostname || 'localhost';
        const backendHost = `http://${host}:8003`;
        setApiUrl(backendHost);

        try {
          // Fetch company ID first
          const compRes = await fetch(`${backendHost}/api/v1/companies/`);
          if (compRes.ok) {
            const comps = await compRes.json();
            if (comps && comps.length > 0) {
              const activeComp = comps[0];
              setCompanyId(activeComp.id);
              
              // Fetch settings for company
              const setRes = await fetch(`${backendHost}/api/v1/companies/${activeComp.id}/settings`);
              if (setRes.ok) {
                const loaded = await setRes.json();
                setSettings((prev) => ({
                  ...prev,
                  ...loaded,
                  company_name: activeComp.name || prev.company_name,
                  company_mission: activeComp.mission || prev.company_mission,
                  nvidia_nim_endpoint: loaded.nvidia_nim_endpoint && !loaded.nvidia_nim_endpoint.includes("localhost:8000") 
                    ? loaded.nvidia_nim_endpoint 
                    : "https://integrate.api.nvidia.com/v1",
                }));
              }
            }
          }
        } catch (err) {
          console.error("Could not fetch remote settings, using local defaults", err);
        }

        // Fetch NVIDIA NIM models on mount
        try {
          const modelsRes = await fetch(`${backendHost}/api/v1/models/nvidia`);
          if (modelsRes.ok) {
            const data = await modelsRes.json();
            if (data.models && data.models.length > 0) {
              setNvidiaModels(data.models);
            }
          }
        } catch (err) {
          console.error("Could not fetch initial NVIDIA models", err);
        }

        // Fetch real Cloud MongoDB Status on mount
        try {
          const mongoRes = await fetch(`${backendHost}/api/v1/mongodb/status`);
          if (mongoRes.ok) {
            const data = await mongoRes.json();
            if (data.uri) setMongoUri(data.uri);
            if (data.is_connected) {
              setMongoStatus('CONNECTED');
              setMongoLatency(data.latency_ms);
              setMongoCollections(data.collections || []);
              onMongoStatusChange?.(true, data.latency_ms);
            } else {
              setMongoStatus(data.status || 'NOT_CONFIGURED');
              setMongoLatency(null);
              setMongoCollections([]);
              onMongoStatusChange?.(false, null);
            }
          }
        } catch (err) {
          setMongoStatus('DISCONNECTED');
          setMongoLatency(null);
          onMongoStatusChange?.(false, null);
        }
      }
    };
    init();
  }, [onMongoStatusChange]);

  const testConnection = async () => {
    setApiStatus('testing');
    const start = performance.now();
    try {
      const res = await fetch(`${apiUrl}/health`);
      const elapsed = Math.round(performance.now() - start);
      if (res.ok) {
        setApiStatus('online');
        setLatencyMs(elapsed);
      } else {
        setApiStatus('offline');
        setLatencyMs(null);
      }
    } catch {
      setApiStatus('offline');
      setLatencyMs(null);
    }
  };

  const testMongoConnection = async () => {
    setMongoTesting(true);
    setMongoFeedback(null);
    try {
      // If user typed a URI, send it to /api/v1/mongodb/connect; otherwise check current status
      const trimmedUri = mongoUri.trim();
      const endpoint = trimmedUri ? `${apiUrl}/api/v1/mongodb/connect` : `${apiUrl}/api/v1/mongodb/status`;
      const options: RequestInit = trimmedUri 
        ? {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uri: trimmedUri })
          }
        : { method: 'GET' };

      const res = await fetch(endpoint, options);
      const data = await res.json();
      
      if (data.is_connected) {
        setMongoStatus('CONNECTED');
        setMongoLatency(data.latency_ms);
        setMongoCollections(data.collections || []);
        onMongoStatusChange?.(true, data.latency_ms);
        const colCount = data.collections?.length || 0;
        setMongoFeedback({
          message: `Connected successfully to Cloud MongoDB Atlas (${data.database || 'companyos'}). Latency: ${data.latency_ms}ms. Collections: ${colCount > 0 ? data.collections.join(', ') : 'None yet'}.`,
          isError: false
        });
      } else {
        setMongoStatus(data.status || 'DISCONNECTED');
        setMongoLatency(null);
        setMongoCollections([]);
        onMongoStatusChange?.(false, null);
        setMongoFeedback({
          message: data.error || 'Connection failed: Unable to connect to MongoDB cluster.',
          isError: true
        });
      }
    } catch (err: any) {
      setMongoStatus('DISCONNECTED');
      setMongoLatency(null);
      setMongoCollections([]);
      onMongoStatusChange?.(false, null);
      setMongoFeedback({
        message: `Network or backend error: ${err.message}`,
        isError: true
      });
    } finally {
      setMongoTesting(false);
    }
  };

  const fetchNvidiaModels = async (customEndpoint?: string, customKey?: string) => {
    setFetchingModels(true);
    setFetchModelsFeedback(null);
    try {
      const endpoint = customEndpoint !== undefined ? customEndpoint : settings.nvidia_nim_endpoint;
      const apiKey = customKey !== undefined ? customKey : settings.nvidia_api_key;

      const res = await fetch(`${apiUrl}/api/v1/models/nvidia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: endpoint || 'https://integrate.api.nvidia.com/v1',
          api_key: apiKey || ''
        })
      });

      const data = await res.json();
      if (data.status === 'success' && data.models && data.models.length > 0) {
        setNvidiaModels(data.models);
        setFetchModelsFeedback({
          message: `Successfully loaded ${data.count} models from ${data.endpoint}!`,
          isError: false
        });
        setTimeout(() => setFetchModelsFeedback(null), 6000);
      } else {
        setFetchModelsFeedback({
          message: data.error || 'Failed to fetch models from endpoint.',
          isError: true
        });
      }
    } catch (err: any) {
      setFetchModelsFeedback({
        message: `Network error: ${err.message}`,
        isError: true
      });
    } finally {
      setFetchingModels(false);
    }
  };

  const handleTestNvidia = async () => {
    if (!settings.nvidia_api_key.trim()) {
      alert('Please enter an NVIDIA API Key (nvapi-...) first.');
      return;
    }
    setTestingNvidia(true);
    setTestOutput(null);
    try {
      const res = await fetch(`${apiUrl}/api/v1/models/nvidia/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: settings.nvidia_nim_endpoint || 'https://integrate.api.nvidia.com/v1',
          api_key: settings.nvidia_api_key,
          model: testNvidiaModel || settings.default_model,
          prompt: testPrompt,
          enable_thinking: testEnableThinking,
          temperature: settings.temperature,
          max_tokens: 1024
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        setTestOutput({
          reasoning: data.reasoning || '',
          content: data.content || ''
        });
      } else {
        alert('NVIDIA inference test failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error testing NVIDIA NIM: ' + err.message);
    } finally {
      setTestingNvidia(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      const payloadToSave = {
        ...settings,
        mongodb_uri: mongoUri.trim()
      };
      const res = await fetch(`${apiUrl}/api/v1/companies/${companyId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSave)
      });

      if (res.ok) {
        setSaved(true);
        if (mongoStatus === 'CONNECTED') {
          onMongoStatusChange?.(true, mongoLatency);
        }
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Failed to save settings: " + (await res.text()));
      }
    } catch (err: any) {
      alert("Error saving settings to backend: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#0b0f19] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings & Model Router</h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure LLM inference providers, API credentials, Telegram gateway, and governance boundaries
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw size={15} className="animate-spin" />
              <span>Saving to PostgreSQL...</span>
            </>
          ) : saved ? (
            <>
              <CheckCircle2 size={15} className="text-emerald-300" />
              <span>Settings Saved & Applied</span>
            </>
          ) : (
            <>
              <Save size={15} />
              <span>Save Configurations</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="my-6 space-y-6 max-w-4xl">
        {/* Section 1: Model Router Settings */}
        <div className="bg-[#131722] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Cpu size={18} className="text-purple-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Multi-Model Router & Inference Gateway
              </h3>
            </div>
            <span className="text-[11px] font-mono text-gray-400">Dynamic Multi-Provider Fallback</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-gray-300">Primary Autonomous Model *</label>
                <button
                  type="button"
                  onClick={() => fetchNvidiaModels()}
                  disabled={fetchingModels}
                  className="text-[10px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <RefreshCw size={11} className={fetchingModels ? 'animate-spin' : ''} />
                  <span>{fetchingModels ? 'Fetching...' : `Sync Models (${nvidiaModels.length})`}</span>
                </button>
              </div>
              <select
                value={settings.default_model}
                onChange={(e) => {
                  const val = e.target.value;
                  setSettings({ ...settings, default_model: val });
                  if (val.includes('/') || val.includes('nemotron')) {
                    setTestNvidiaModel(val);
                  }
                }}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
              >
                {nvidiaModels.length > 0 ? (
                  <optgroup label={`NVIDIA NIM (build.nvidia.com) — ${nvidiaModels.length} Models`}>
                    {nvidiaModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.id} {m.supports_thinking ? '🧠 [Thinking / Reasoning]' : ''}
                      </option>
                    ))}
                  </optgroup>
                ) : (
                  <optgroup label="NVIDIA NIM (build.nvidia.com)">
                    <option value="nvidia/nemotron-3-ultra-550b-a55b">nvidia/nemotron-3-ultra-550b-a55b 🧠 [Thinking / Reasoning]</option>
                    <option value="meta/llama-3.3-70b-instruct">meta/llama-3.3-70b-instruct</option>
                    <option value="meta/llama-3.1-405b-instruct">meta/llama-3.1-405b-instruct</option>
                    <option value="deepseek-ai/deepseek-r1">deepseek-ai/deepseek-r1 🧠</option>
                    <option value="mistralai/mistral-large-2-instruct">mistralai/mistral-large-2-instruct</option>
                    <option value="qwen/qwen2.5-72b-instruct">qwen/qwen2.5-72b-instruct</option>
                  </optgroup>
                )}
                <optgroup label="Google Gemini">
                  <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Fast & Cost Efficient)</option>
                </optgroup>
                <optgroup label="Anthropic">
                  <option value="claude-3-5-sonnet-20241022">Anthropic Claude 3.5 Sonnet</option>
                </optgroup>
                <optgroup label="OpenAI">
                  <option value="gpt-4o">OpenAI GPT-4o</option>
                  <option value="gpt-4o-mini">OpenAI GPT-4o-mini</option>
                </optgroup>
                <optgroup label="Self-Hosted / Local">
                  <option value="local/vllm">Self-Hosted vLLM / Ollama</option>
                </optgroup>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-gray-300">Fallback Failover Model</label>
                <span className="text-[10px] text-gray-500 font-mono">Used if primary rate-limited</span>
              </div>
              <select
                value={settings.fallback_model}
                onChange={(e) => setSettings({ ...settings, fallback_model: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
              >
                {nvidiaModels.length > 0 && (
                  <optgroup label={`NVIDIA NIM — ${nvidiaModels.length} Models`}>
                    {nvidiaModels.slice(0, 15).map((m) => (
                      <option key={`fb-${m.id}`} value={m.id}>
                        {m.id}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="Standard Fallbacks">
                  <option value="gpt-4o-mini">OpenAI GPT-4o-mini</option>
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash</option>
                  <option value="meta-llama/Llama-3.1-8B-Instruct">NVIDIA NIM Llama 3.1 8B</option>
                  <option value="local/ollama">Local Ollama</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* API Keys Inputs with Eye toggle */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Provider API Keys</h4>
            
            {/* NVIDIA API Key */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-950/20 via-gray-900 to-gray-900 border border-emerald-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] rounded border border-emerald-500/30 font-mono">
                    NVIDIA NIM
                  </span>
                  <label className="text-xs font-semibold text-white">NVIDIA API Key (build.nvidia.com)</label>
                </div>
                <a
                  href="https://build.nvidia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Get Key on build.nvidia.com</span>
                  <ExternalLink size={11} />
                </a>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showNvidiaKey ? "text" : "password"}
                    placeholder="nvapi-..."
                    value={settings.nvidia_api_key}
                    onChange={(e) => setSettings({ ...settings, nvidia_api_key: e.target.value })}
                    className="w-full bg-black/50 border border-emerald-500/40 rounded-xl pl-3.5 pr-10 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNvidiaKey(!showNvidiaKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showNvidiaKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => fetchNvidiaModels()}
                  disabled={fetchingModels}
                  className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-colors"
                  title="Fetch all available models from NVIDIA NIM"
                >
                  <RefreshCw size={13} className={fetchingModels ? 'animate-spin' : ''} />
                  <span>{fetchingModels ? 'Discovering...' : 'Fetch 90+ Models'}</span>
                </button>
              </div>

              {fetchModelsFeedback && (
                <div className={`p-2 rounded-lg text-[11px] flex items-center gap-2 ${
                  fetchModelsFeedback.isError 
                    ? 'bg-rose-950/40 border border-rose-800/40 text-rose-300' 
                    : 'bg-emerald-950/40 border border-emerald-700/40 text-emerald-300'
                }`}>
                  {fetchModelsFeedback.isError ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />}
                  <span>{fetchModelsFeedback.message}</span>
                </div>
              )}
            </div>

            {/* Gemini */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Google Gemini API Key</label>
              <div className="relative">
                <input
                  type={showGeminiKey ? "text" : "password"}
                  placeholder="AIzaSy..."
                  value={settings.gemini_api_key}
                  onChange={(e) => setSettings({ ...settings, gemini_api_key: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-3.5 pr-10 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showGeminiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* OpenAI */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">OpenAI API Key</label>
              <div className="relative">
                <input
                  type={showOpenaiKey ? "text" : "password"}
                  placeholder="sk-proj-..."
                  value={settings.openai_api_key}
                  onChange={(e) => setSettings({ ...settings, openai_api_key: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-3.5 pr-10 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showOpenaiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Anthropic */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Anthropic Claude API Key</label>
              <div className="relative">
                <input
                  type={showAnthropicKey ? "text" : "password"}
                  placeholder="sk-ant-api03-..."
                  value={settings.anthropic_api_key}
                  onChange={(e) => setSettings({ ...settings, anthropic_api_key: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-3.5 pr-10 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showAnthropicKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Local / Private / NIM Endpoints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block font-medium text-gray-300 mb-1">
                NVIDIA NIM Inference Endpoint (OpenAI Compatible)
              </label>
              <input
                type="text"
                placeholder="https://integrate.api.nvidia.com/v1"
                value={settings.nvidia_nim_endpoint}
                onChange={(e) => setSettings({ ...settings, nvidia_nim_endpoint: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-gray-500 mt-1">Default: https://integrate.api.nvidia.com/v1</p>
            </div>

            <div>
              <label className="block font-medium text-gray-300 mb-1">Local Ollama / vLLM Endpoint</label>
              <input
                type="text"
                placeholder="http://localhost:11434"
                value={settings.ollama_vllm_url}
                onChange={(e) => setSettings({ ...settings, ollama_vllm_url: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-gray-500 mt-1">Self-hosted local fallback endpoint</p>
            </div>
          </div>

          {/* Hyperparameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <div className="flex justify-between font-medium text-gray-300 mb-1">
                <span>Reasoning Temperature</span>
                <span className="font-mono text-blue-400">{settings.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.temperature}
                onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                <span>0.0 (Deterministic)</span>
                <span>1.0 (Creative)</span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-300 mb-1">Max Generation Tokens</label>
              <input
                type="number"
                value={settings.max_tokens}
                onChange={(e) => setSettings({ ...settings, max_tokens: parseInt(e.target.value) || 4096 })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Dedicated NVIDIA NIM Inference & Reasoning Tester */}
          <div className="mt-4 p-4 bg-gray-900/60 border border-gray-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  NVIDIA NIM Model & Reasoning Live Tester
                </h4>
              </div>
              <label className="flex items-center gap-1.5 text-[11px] text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={testEnableThinking}
                  onChange={(e) => setTestEnableThinking(e.target.checked)}
                  className="rounded text-emerald-500 accent-emerald-500"
                />
                <span>Enable Thinking Trace (<code className="text-emerald-400 font-mono">enable_thinking: true</code>)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Target NIM Model</label>
                <select
                  value={testNvidiaModel}
                  onChange={(e) => setTestNvidiaModel(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                >
                  {nvidiaModels.length > 0 ? (
                    nvidiaModels.map((m) => (
                      <option key={`test-${m.id}`} value={m.id}>
                        {m.id} {m.supports_thinking ? '🧠' : ''}
                      </option>
                    ))
                  ) : (
                    <option value="nvidia/nemotron-3-ultra-550b-a55b">nvidia/nemotron-3-ultra-550b-a55b</option>
                  )}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] text-gray-400 mb-1">Prompt</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    className="flex-1 bg-[#0b0f19] border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Write a limerick about GPU computing..."
                  />
                  <button
                    type="button"
                    onClick={handleTestNvidia}
                    disabled={testingNvidia}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50"
                  >
                    {testingNvidia ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Inferring...</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} />
                        <span>Run Test</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {testOutput && (
              <div className="space-y-2 pt-2 border-t border-gray-800 animate-in fade-in duration-200">
                {testOutput.reasoning && (
                  <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400 font-mono">
                      <Brain size={13} />
                      <span>Reasoning / Thinking Process</span>
                    </div>
                    <p className="text-xs text-amber-200/90 whitespace-pre-wrap font-mono">
                      {testOutput.reasoning}
                    </p>
                  </div>
                )}

                {testOutput.content && (
                  <div className="p-3 bg-gray-950/80 border border-gray-700 rounded-xl space-y-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                      Completion Output
                    </div>
                    <p className="text-xs text-gray-200 whitespace-pre-wrap font-sans">
                      {testOutput.content}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Company Identity & Autonomous Governance */}
        <div className="bg-[#131722] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <DollarSign size={18} className="text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Company Governance & Economic Guardrails
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">Founder Absolute Authority</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-gray-300 mb-1">Company Operating Name</label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-300 mb-1">Operating Autonomy Level</label>
              <select
                value={settings.autonomous_mode}
                onChange={(e) => setSettings({ ...settings, autonomous_mode: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-white font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="HUMAN_LED">Human-Led (AI only responds)</option>
                <option value="AI_ASSISTED">AI-Assisted (Drafts only)</option>
                <option value="SUPERVISED">Supervised Autonomy (Approval on spend)</option>
                <option value="BOUNDED">Bounded Autonomy (Full autonomy below cap)</option>
                <option value="FULL_AUTONOMOUS">Autonomous Operation (Unrestricted)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Company Core Mission</label>
            <input
              type="text"
              value={settings.company_mission}
              onChange={(e) => setSettings({ ...settings, company_mission: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div>
              <label className="block font-medium text-gray-300 mb-1">Monthly Budget Cap</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="text"
                  value={settings.monthly_budget_cap}
                  onChange={(e) => setSettings({ ...settings, monthly_budget_cap: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-8 pr-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-300 mb-1">Human Sign-off Above</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="text"
                  value={settings.human_approval_threshold}
                  onChange={(e) => setSettings({ ...settings, human_approval_threshold: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-8 pr-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-300 mb-1">Emergency Spend Freeze</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="text"
                  value={settings.emergency_spend_limit}
                  onChange={(e) => setSettings({ ...settings, emergency_spend_limit: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-8 pr-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Telegram Message Gateway */}
        <div className="bg-[#131722] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Radio size={18} className="text-blue-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Telegram Message Gateway & Remote Control
              </h3>
            </div>
            <span className="text-[11px] font-mono text-blue-400">Founder Remote Hotline</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-gray-300 mb-1">Telegram Bot Token (From @BotFather)</label>
              <div className="relative">
                <input
                  type={showTelegramToken ? "text" : "password"}
                  placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ..."
                  value={settings.telegram_bot_token}
                  onChange={(e) => setSettings({ ...settings, telegram_bot_token: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-3.5 pr-10 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowTelegramToken(!showTelegramToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showTelegramToken ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-gray-300 mb-1">Allowed Telegram Usernames / Chat IDs</label>
                <input
                  type="text"
                  placeholder="@founder, @ceo, 987654321"
                  value={settings.telegram_allowed_users}
                  onChange={(e) => setSettings({ ...settings, telegram_allowed_users: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-300 mb-1">Gateway Connection Mode</label>
                <select
                  value={settings.telegram_mode}
                  onChange={(e) => setSettings({ ...settings, telegram_mode: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="polling">Long Polling (Recommended for self-hosted)</option>
                  <option value="webhook">Webhook (Requires HTTPS domain)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Cloud MongoDB Database Instance */}
        <div className="bg-[#131722] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Cloud MongoDB Database (Default Instance)
                </h3>
                <p className="text-[11px] text-gray-400">
                  Cloud MongoDB Atlas is active by default. No local MongoDB container needed in docker-compose.
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-mono px-2.5 py-1 rounded-md font-bold border ${
              mongoStatus === 'CONNECTED' 
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                : mongoStatus === 'NOT_CONFIGURED'
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            }`}>
              {mongoStatus === 'CONNECTED' ? 'CONNECTED' : mongoStatus === 'NOT_CONFIGURED' ? 'NOT CONFIGURED' : 'DISCONNECTED'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-gray-300 mb-1">
                Cloud MongoDB Connection String (Atlas URI)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showMongoUri ? "text" : "password"}
                    placeholder="mongodb+srv://<username>:<password>@cluster.mongodb.net/companyos?retryWrites=true&w=majority"
                    value={mongoUri}
                    onChange={(e) => setMongoUri(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-3.5 pr-10 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMongoUri(!showMongoUri)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showMongoUri ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={testMongoConnection}
                  disabled={mongoTesting}
                  className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl transition-colors flex items-center gap-1.5 active:scale-95 font-semibold"
                >
                  <RefreshCw size={13} className={mongoTesting ? 'animate-spin' : ''} />
                  <span>{mongoTesting ? 'Testing...' : 'Test / Connect Cloud Mongo'}</span>
                </button>
              </div>
            </div>

            {mongoFeedback && (
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                mongoFeedback.isError 
                  ? 'bg-rose-950/40 border-rose-800/40 text-rose-300' 
                  : 'bg-emerald-950/40 border-emerald-700/40 text-emerald-300'
              }`}>
                {mongoFeedback.isError ? (
                  <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                )}
                <span>{mongoFeedback.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-gray-900/60 border border-gray-800 rounded-xl">
                <div className="text-gray-500 text-[10px] uppercase font-semibold mb-0.5">Instance Type</div>
                <div className="text-white font-mono font-medium">Cloud MongoDB Atlas</div>
              </div>
              <div className="p-3 bg-gray-900/60 border border-gray-800 rounded-xl">
                <div className="text-gray-500 text-[10px] uppercase font-semibold mb-0.5">Collections</div>
                <div className="text-blue-400 font-mono text-[11px] font-medium truncate">
                  {mongoCollections.length > 0 ? mongoCollections.join(', ') : 'None (Cluster unconfigured or offline)'}
                </div>
              </div>
              <div className="p-3 bg-gray-900/60 border border-gray-800 rounded-xl">
                <div className="text-gray-500 text-[10px] uppercase font-semibold mb-0.5">Cloud Cluster Health</div>
                {mongoStatus === 'CONNECTED' && mongoLatency !== null ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active ({mongoLatency}ms)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-amber-400 font-mono font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>{mongoStatus === 'NOT_CONFIGURED' ? 'Unconfigured' : 'Offline'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Backend Connectivity */}
        <div className="bg-[#131722] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
            <Server size={18} className="text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Backend Server & WebSocket Bus</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-300 font-medium mb-1">FastAPI Backend URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={apiStatus === 'testing'}
                  className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl transition-colors flex items-center gap-1.5 active:scale-95"
                >
                  <RefreshCw size={13} className={apiStatus === 'testing' ? 'animate-spin' : ''} />
                  <span>Test</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">Health Status</label>
              <div className="flex items-center justify-between p-2.5 bg-gray-900 border border-gray-800 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    apiStatus === 'online' ? 'bg-emerald-400 animate-pulse' : apiStatus === 'testing' ? 'bg-amber-400' : 'bg-rose-500'
                  }`} />
                  <span className="font-mono text-xs capitalize text-gray-200">
                    {apiStatus === 'online' ? 'Connected (HTTP 200)' : apiStatus}
                  </span>
                </div>
                {latencyMs !== null && (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {latencyMs}ms
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Save Button at Bottom */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : saved ? (
              <>
                <CheckCircle2 size={16} className="text-emerald-300" />
                <span>Saved & Active!</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
