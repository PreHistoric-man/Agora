import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ModelLogo } from './ModelLogo';
import {
  CheckCircle2,
  Key,
  Copy,
  Check,
  Terminal,
  ArrowRight,
  Zap,
  Box
} from 'lucide-react';

export const CheckoutSuccess: React.FC = () => {
  const { lastCheckoutResult, setView, addToast } = useApp();
  const [copiedKeyIndex, setCopiedKeyIndex] = useState<number | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'python' | 'node'>('python');

  if (!lastCheckoutResult || lastCheckoutResult.provisionedApis.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center animate-fade-in">
        <h2 className="font-display text-2xl font-black text-white mb-3">No Active Checkout Session</h2>
        <p className="text-slate-400 text-xs mb-6">You can manage your existing API endpoints in the My APIs dashboard.</p>
        <button
          onClick={() => setView('my-apis')}
          className="px-6 py-2.5 rounded-xl bg-cyan-500 text-white font-display text-xs font-bold uppercase cursor-pointer"
        >
          Go to My APIs
        </button>
      </div>
    );
  }

  const { provisionedApis, models, organizationName, orderNumber } = lastCheckoutResult;

  const handleCopyKey = (key: string, index: number) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyIndex(index);
    addToast('Demo API Key copied to clipboard!', 'success');
    setTimeout(() => setCopiedKeyIndex(null), 2000);
  };

  const sampleModel = models[0] || { name: 'DeepSeek-R1', modelEndpointId: 'deepseek-r1' };
  const sampleKey = provisionedApis[0]?.apiKey || 'mh_live_demo_sk_94a8f219b48e426cb78912aa';

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 md:py-14 animate-fade-in text-left">
      {/* Success Celebration Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950/60 via-indigo-950/50 to-purple-950/60 border border-cyan-500/30 p-8 md:p-10 shadow-2xl mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/20 shrink-0">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-display text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
                  Provisioned & Ready
                </span>
                <span className="text-xs text-slate-400 font-mono">Ref: {orderNumber}</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-black tracking-wide text-white">
                API Access Added Successfully
              </h1>
              <p className="font-sans text-xs text-slate-300 mt-1 max-w-xl">
                Your AI model API credentials for <span className="text-cyan-300 font-semibold">{organizationName}</span> have been provisioned in demo sandbox mode and added to your <span className="text-cyan-300 font-semibold">Model Library</span>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => setView('library')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 font-display text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <Box size={15} />
              Go to My Library
            </button>
            <button
              onClick={() => setView('my-apis')}
              className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-display text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              My APIs Dashboard
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setView('try')}
              className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-display text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Zap size={14} className="text-cyan-400" />
              Playground
            </button>
          </div>
        </div>
      </div>

      {/* Demo / Placeholder Badge Alert */}
      <div className="mb-8 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-center justify-between gap-4 text-xs text-amber-200">
        <div className="flex items-center gap-2.5">
          <span className="rounded-md bg-amber-500/20 px-2 py-0.5 font-display text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-500/30">
            Demo / Placeholder Mode
          </span>
          <span className="font-sans">
            These endpoints and credentials are simulated for the hackathon demonstration. No real charges will occur.
          </span>
        </div>
        <span className="text-[11px] font-mono text-amber-300/80 font-bold shrink-0">
          $50.00 Sandbox Quota Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Provisioned API Credentials Card */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h2 className="font-display text-base font-black text-white flex items-center gap-2">
            <Key size={16} className="text-cyan-400" /> Provisioned AI Model Endpoints ({provisionedApis.length})
          </h2>

          <div className="flex flex-col gap-3.5">
            {provisionedApis.map((api, index) => {
              const model = models.find((m) => m.id === api.modelId);
              if (!model) return null;
              const isCopied = copiedKeyIndex === index;

              return (
                <div
                  key={api.id}
                  className="rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/10 p-5 shadow-lg flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10 shrink-0">
                        <ModelLogo modelId={model.id} provider={model.provider} category={model.category} size={15} />
                      </span>
                      <div>
                        <h3 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                          {model.name}
                          <span className="text-[10px] font-normal text-slate-400 font-sans">
                            ({model.provider})
                          </span>
                        </h3>
                        <span className="text-[10px] text-cyan-400 font-mono">
                          ID: {model.modelEndpointId}
                        </span>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Status: Active
                    </span>
                  </div>

                  {/* API Endpoint Box */}
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="text-[10px] text-slate-400 font-medium">Standard REST Endpoint:</span>
                    <div className="flex items-center justify-between bg-black/50 p-2 rounded-lg border border-white/5 font-mono text-[11px] text-slate-200">
                      <span className="truncate">{api.endpoint}</span>
                      <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-sans">
                        POST
                      </span>
                    </div>
                  </div>

                  {/* API Key Box with Copy */}
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Key size={11} className="text-amber-400" /> Demo API Key:
                    </span>
                    <div className="flex items-center justify-between bg-black/60 p-2 rounded-lg border border-white/10 font-mono text-xs text-amber-300">
                      <span className="truncate">{api.apiKey}</span>
                      <button
                        onClick={() => handleCopyKey(api.apiKey, index)}
                        className="ml-2 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-sans font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                      >
                        {isCopied ? (
                          <>
                            <Check size={12} className="text-emerald-400" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy Key
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Usage & SLA info */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[10px] text-slate-400">
                    <div>
                      <span className="block text-slate-500">Rate Limit</span>
                      <span className="font-bold text-slate-200">{api.rateLimitRpm} RPM</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Token Limit</span>
                      <span className="font-bold text-slate-200">{api.rateLimitTpm / 1000}K TPM</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Demo Credit</span>
                      <span className="font-bold text-emerald-400">${api.quotaUsd}.00</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Code Quickstart */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h2 className="font-display text-base font-black text-white flex items-center gap-2">
            <Terminal size={16} className="text-cyan-400" /> Quickstart Integration Code
          </h2>

          <div className="rounded-2xl glass-panel-heavy border border-white/10 overflow-hidden shadow-2xl flex flex-col">
            {/* Tab Selector */}
            <div className="flex items-center justify-between bg-black/50 px-4 py-2.5 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('python')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-display font-semibold transition-colors cursor-pointer ${
                    activeCodeTab === 'python'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Python SDK
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('node')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-display font-semibold transition-colors cursor-pointer ${
                    activeCodeTab === 'node'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Node.js / TS
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('curl')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-display font-semibold transition-colors cursor-pointer ${
                    activeCodeTab === 'curl'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  cURL
                </button>
              </div>

              <button
                onClick={() => {
                  let text = '';
                  if (activeCodeTab === 'python') {
                    text = `from openai import OpenAI\n\nclient = OpenAI(\n    base_url="https://api.modalhub.ai/v1",\n    api_key="${sampleKey}"\n)\n\nresponse = client.chat.completions.create(\n    model="${sampleModel.modelEndpointId || 'deepseek-r1'}",\n    messages=[{"role": "user", "content": "Hello AI API!"}]\n)\nprint(response.choices[0].message.content)`;
                  } else if (activeCodeTab === 'node') {
                    text = `import OpenAI from "openai";\n\nconst client = new OpenAI({\n  baseURL: "https://api.modalhub.ai/v1",\n  apiKey: "${sampleKey}",\n});\n\nconst res = await client.chat.completions.create({\n  model: "${sampleModel.modelEndpointId || 'deepseek-r1'}",\n  messages: [{ role: "user", content: "Hello AI API!" }],\n});\nconsole.log(res.choices[0].message.content);`;
                  } else {
                    text = `curl https://api.modalhub.ai/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer ${sampleKey}" \\\n  -d '{\n    "model": "${sampleModel.modelEndpointId || 'deepseek-r1'}",\n    "messages": [{"role": "user", "content": "Hello AI API!"}]\n  }'`;
                  }
                  navigator.clipboard.writeText(text);
                  addToast('Sample code copied to clipboard!', 'success');
                }}
                className="text-slate-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
              >
                <Copy size={12} /> Copy
              </button>
            </div>

            {/* Code Body */}
            <div className="p-4 bg-black/80 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-[380px]">
              {activeCodeTab === 'python' && (
                <pre className="text-cyan-300">
{`from openai import OpenAI

# Initialize client pointing to ModalHub endpoint
client = OpenAI(
    base_url="https://api.modalhub.ai/v1",
    api_key="${sampleKey}"
)

# Call ${sampleModel.name}
response = client.chat.completions.create(
    model="${sampleModel.modelEndpointId || 'deepseek-r1'}",
    messages=[
        {"role": "system", "content": "You are an expert AI assistant."},
        {"role": "user", "content": "Explain quantum superposition with code."}
    ],
    temperature=0.7,
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")`}
                </pre>
              )}

              {activeCodeTab === 'node' && (
                <pre className="text-emerald-300">
{`import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.modalhub.ai/v1",
  apiKey: "${sampleKey}",
});

async function main() {
  const stream = await client.chat.completions.create({
    model: "${sampleModel.modelEndpointId || 'deepseek-r1'}",
    messages: [{ role: "user", content: "Write a high-speed Redis queue." }],
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }
}

main();`}
                </pre>
              )}

              {activeCodeTab === 'curl' && (
                <pre className="text-amber-300">
{`curl https://api.modalhub.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${sampleKey}" \\
  -d '{
    "model": "${sampleModel.modelEndpointId || 'deepseek-r1'}",
    "messages": [
      {"role": "user", "content": "Benchmark test prompt."}
    ],
    "temperature": 0.6
  }'`}
                </pre>
              )}
            </div>

            {/* Footer notice */}
            <div className="p-3 bg-white/[0.02] border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
              <span>OpenAI SDK Compatible Gateway</span>
              <button
                onClick={() => setView('discover')}
                className="text-cyan-400 hover:underline font-sans cursor-pointer"
              >
                Browse All Models →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
