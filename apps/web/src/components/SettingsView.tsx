import React, { useState, useEffect } from 'react';
import { Settings, Cpu, Shield, Save, CheckCircle2, Sliders, Radio, AlertCircle } from 'lucide-react';

export default function SettingsView({
  orgId = 'acme_ai_labs',
  apiBase,
}: {
  orgId?: string;
  apiBase: string;
}) {
  const [provider, setProvider] = useState('OpenAI');
  const [model, setModel] = useState('gpt-4o');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [governanceThreshold, setGovernanceThreshold] = useState(80);
  const [escalationChannel, setEscalationChannel] = useState('telegram');
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [autoResolve, setAutoResolve] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`${apiBase}/api/v1/settings/${orgId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (data.default_provider) setProvider(data.default_provider);
          if (data.default_model) setModel(data.default_model);
          if (data.temperature !== undefined) setTemperature(data.temperature);
          if (data.max_tokens !== undefined) setMaxTokens(data.max_tokens);
          if (data.governance_threshold !== undefined) setGovernanceThreshold(data.governance_threshold);
          if (data.escalation_channel) setEscalationChannel(data.escalation_channel);
          if (data.telegram_bot_token) setTelegramToken(data.telegram_bot_token);
          if (data.telegram_chat_id) setTelegramChatId(data.telegram_chat_id);
          if (data.auto_resolve_frictions !== undefined) setAutoResolve(data.auto_resolve_frictions);
        }
      })
      .catch(() => {});
  }, [apiBase, orgId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch(`${apiBase}/api/v1/settings/${orgId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          default_provider: provider,
          default_model: model,
          temperature,
          max_tokens: maxTokens,
          governance_threshold: governanceThreshold,
          escalation_channel: escalationChannel,
          telegram_bot_token: telegramToken,
          telegram_chat_id: telegramChatId,
          auto_resolve_frictions: autoResolve,
        }),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-950 text-white max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-800 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System & Model Settings</h1>
          <p className="text-xs text-gray-400 mt-1">Configure CompanyOS model routing, authority policies, and external gateways</p>
        </div>
        {isSaved && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
            <CheckCircle2 size={14} /> Settings Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Model Router Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-gray-800 pb-3">
            <Cpu size={16} className="text-blue-400" />
            <span>Model Router Configuration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Default Provider
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="OpenAI">OpenAI</option>
                <option value="Anthropic">Anthropic</option>
                <option value="Google">Google Gemini</option>
                <option value="NVIDIA">NVIDIA NIM</option>
                <option value="Ollama">Local Ollama / vLLM</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Default Model
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. gpt-4o, claude-3-5-sonnet"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                <span>Sampling Temperature</span>
                <span className="font-mono text-blue-400">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Max Output Tokens
              </label>
              <input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2048)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Governance & Guardrails */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-gray-800 pb-3">
            <Shield size={16} className="text-amber-400" />
            <span>Autonomous Governance & Authority</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                <span>Authority Threshold for Auto-Execution</span>
                <span className="font-mono text-amber-400">{governanceThreshold}/100</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={governanceThreshold}
                onChange={(e) => setGovernanceThreshold(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-gray-500 mt-1">Actions requiring higher authority must be approved by human.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Escalation Channel
              </label>
              <select
                value={escalationChannel}
                onChange={(e) => setEscalationChannel(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="telegram">Telegram Direct Message</option>
                <option value="dashboard">Web Command Center Only</option>
                <option value="email">Email Notification</option>
              </select>
            </div>
          </div>
        </div>

        {/* Telegram Gateway Settings */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-gray-800 pb-3">
            <Radio size={16} className="text-emerald-400" />
            <span>Telegram Human-in-the-Loop Gateway</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Bot Token
              </label>
              <input
                type="password"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                placeholder="123456789:ABCDefgh..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Target Chat / Admin ID
              </label>
              <input
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="e.g. 987654321"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <Save size={14} />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
