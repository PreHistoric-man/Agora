import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Send,
  Trash,
  Sliders,
  Cpu,
  ChevronDown
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  content: string;
  timestamp: string;
  reasoningSteps?: string[];
  imageUrl?: string;
}

export const ModelLauncher: React.FC = () => {
  const {
    models,
    activeLaunchModelId,
    closeLauncher,
    addToast
  } = useApp();

  // Selected running model
  const [runningModelId, setRunningModelId] = useState<string>(activeLaunchModelId || 'codeforge-7b');
  const runningModel = models.find((m) => m.id === runningModelId) || models[0];

  // Chat conversation
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'model',
      content: `Hello! I am ${runningModel.name}, running locally on your hardware. How can I assist you with your project today?`,
      timestamp: '17:45'
    }
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isReplying, setIsReplying] = useState<boolean>(false);

  // Settings
  const [temperature, setTemperature] = useState<number>(0.7);
  const [systemPrompt, setSystemPrompt] = useState<string>('You are an expert AI assistant optimized for local execution.');
  const [selectedHardware, setSelectedHardware] = useState<string>('CUDA GPU (RTX 3070)');

  // Telemetry (fluctuating stats)
  const [gpuUsage, setGpuUsage] = useState<number>(45);
  const [vramUsage, setVramUsage] = useState<number>(6.8);
  const [tokensPerSec, setTokensPerSec] = useState<number>(42);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat log
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isReplying]);

  // Simulated telemetry spikes
  useEffect(() => {
    const interval = setInterval(() => {
      setGpuUsage(() => {
        const offset = isReplying ? Math.floor(Math.random() * 20) + 55 : Math.floor(Math.random() * 10) + 10;
        return Math.min(Math.max(offset, 5), 98);
      });
      setTokensPerSec(() => {
        if (!isReplying) return 0;
        const baseline = runningModel.category === 'Reasoning' ? 22 : 48;
        return Math.floor(baseline + (Math.random() * 8 - 4));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isReplying, runningModel]);

  // Switch model handler
  const handleModelSwitch = (mId: string) => {
    const targetModel = models.find((m) => m.id === mId);
    if (!targetModel) return;
    if (!targetModel.installed) {
      addToast(`Please install ${targetModel.name} from the library first.`, 'warning');
      return;
    }

    setRunningModelId(mId);
    setMessages([
      {
        id: `switch-${Date.now()}`,
        sender: 'model',
        content: `Hardware context re-allocated. ${targetModel.name} is online and initialized. how can I help?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    // Set matching default telemetry values
    const parseSize = parseFloat(targetModel.sizeOnDisk.split(' ')[0]);
    setVramUsage(Number((parseSize * 0.8 + 1).toFixed(1)));
    addToast(`Context re-allocated. Switched to ${targetModel.name}.`, 'success');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isReplying) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      content: inputVal,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsReplying(true);

    // Simulate reply generation delay
    setTimeout(() => {
      let replyContent = '';
      let steps: string[] = [];
      let imgUrl = '';

      // Custom specialty replies based on category
      if (runningModel.category === 'Coding') {
        replyContent = `Here is the requested module for your local application:\n\n\`\`\`typescript\n// Generated in real-time by ${runningModel.name}\nexport function optimizeTensorBuffers(vramSize: number): boolean {\n  const safetyMarginMB = 1024;\n  const totalAllocated = vramSize - safetyMarginMB;\n  \n  if (totalAllocated < 4096) {\n    console.warn("Insufficient VRAM buffers for high-precision quantization!");\n    return false;\n  }\n  return true;\n}\n\`\`\``;
      } else if (runningModel.category === 'Image') {
        replyContent = `I have run the latent diffusion pipeline locally. Here is your generated visual placeholder:`;
        imgUrl = 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80';
      } else if (runningModel.category === 'Reasoning') {
        steps = [
          'Deconstructing problem constraints...',
          'Loading context vectors for logical validation...',
          'Resolving conflict clauses...'
        ];
        replyContent = `Logical resolution verified. Total step sequences: 3. No conflicting dependencies identified.`;
      } else {
        replyContent = `This is a mock inference response from ${runningModel.name} running on local environment weights. Prompt successfully parsed.`;
      }

      const modelMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        sender: 'model',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reasoningSteps: steps.length > 0 ? steps : undefined,
        imageUrl: imgUrl || undefined
      };

      setMessages((prev) => [...prev, modelMsg]);
      setIsReplying(false);
    }, 1800);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `clear-${Date.now()}`,
        sender: 'model',
        content: `Chat history cleared. Context re-allocated.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Pre-load installed models for Switch list
  const installedModels = models.filter((m) => m.installed);

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen bg-[#07080b] text-slate-200 select-none animate-fade-in">
      {/* 1. LEFT CONTROLS/SETTINGS SIDEBAR */}
      <div className="w-80 border-r border-white/5 bg-[#0b0c10] flex flex-col justify-between shrink-0">
        <div className="flex flex-col gap-5 p-5 overflow-y-auto">
          {/* Back/Close Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-display text-xs font-black tracking-wider text-slate-400 uppercase">RUNNING ENVIRONMENT</span>
            </div>
            <button
              onClick={closeLauncher}
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-all"
              title="Close Workspace"
            >
              <X size={16} />
            </button>
          </div>

          {/* Model Switch Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[10px] text-slate-500 font-bold uppercase tracking-wider">Switch Model Workspace</label>
            <div className="relative">
              <select
                value={runningModelId}
                onChange={(e) => handleModelSwitch(e.target.value)}
                className="w-full appearance-none rounded-lg bg-slate-900 border border-white/10 pl-4 pr-10 py-2.5 font-display text-xs font-bold text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {installedModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.sizeOnDisk})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 text-slate-500 pointer-events-none" size={14} />
            </div>
          </div>

          {/* Local Hardware Configuration */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[10px] text-slate-500 font-bold uppercase tracking-wider">Inference Hardware Device</label>
            <select
              value={selectedHardware}
              onChange={(e) => setSelectedHardware(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2 font-sans text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="CUDA GPU (RTX 3070)">CUDA GPU (RTX 3070)</option>
              <option value="ROCm GPU (RX 6700 XT)">ROCm GPU (RX 6700 XT)</option>
              <option value="CPU Vector (x86 Threading)">CPU Vector (x86 Threading)</option>
              <option value="Metal Engine (Apple Silicon)">Metal Engine (Apple Silicon)</option>
            </select>
          </div>

          {/* Settings Sliders */}
          <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
            <span className="font-display text-xs font-black text-slate-300 flex items-center gap-1.5">
              <Sliders size={14} className="text-cyan-400" />
              Tuning Parameters
            </span>

            {/* Temperature */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-sans">
                <span className="text-slate-400 font-semibold">Temperature</span>
                <span className="font-bold text-cyan-400">{temperature}</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.5}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
              <p className="font-sans text-[9px] text-slate-500 leading-normal">
                Higher settings increase creative randomness; lower settings improve deterministic coding.
              </p>
            </div>

            {/* System Prompt */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[11px] text-slate-400 font-semibold">System Directives</label>
              <textarea
                rows={3}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="rounded-lg glass-input p-2 text-[10px] text-slate-200 font-sans leading-relaxed"
                placeholder="Direct system directives..."
              />
            </div>
          </div>
        </div>

        {/* Telemetry Footer Dashboard */}
        <div className="bg-slate-950 border-t border-white/5 p-5 flex flex-col gap-3.5 text-left shrink-0">
          <span className="font-display text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Cpu size={10} /> Local System Diagnostics
          </span>

          <div className="flex flex-col gap-2 font-sans text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>GPU Utilization:</span>
              <span className={`font-mono font-bold ${gpuUsage > 80 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                {gpuUsage}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${gpuUsage > 80 ? 'bg-red-400' : 'bg-cyan-400'}`}
                style={{ width: `${gpuUsage}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-slate-400 mt-1">
              <span>VRAM Buffers Draw:</span>
              <span className="font-mono font-bold text-slate-200">
                {vramUsage} / 16.0 GB
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-400 mt-1">
              <span>Speed Output Rate:</span>
              <span className="font-mono font-bold text-cyan-400">
                {isReplying ? `${tokensPerSec} t/s` : '0 t/s'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CHAT / TELEMETRY WORKSPACE AREA */}
      <div className="flex-grow flex flex-col justify-between bg-[#07080b] overflow-hidden relative">
        {/* Workspace Title Header */}
        <div className="border-b border-white/5 bg-[#0b0c10]/60 backdrop-blur-md px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-left">
            <h1 className="font-display text-base font-black text-white">{runningModel.name}</h1>
            <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-display text-[9px] font-bold text-emerald-400 uppercase">
              LOCAL READY
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-all"
            >
              <Trash size={12} />
              Reset Buffer
            </button>
          </div>
        </div>

        {/* Chat Conversation Scroll Area */}
        <div
          ref={scrollRef}
          className="flex-grow overflow-y-auto px-6 py-6 flex flex-col gap-6 relative"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-3xl animate-slide-up ${
                msg.sender === 'user' ? 'self-end flex-row-reverse text-right' : 'self-start text-left'
              }`}
            >
              {/* Avatar indicator */}
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm ring-1 ring-white/10 ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-br from-violet-600 to-pink-500'
                  : 'bg-[#252836]'
              }`}>
                {msg.sender === 'user' ? '🛸' : runningModel.category === 'Coding' ? '💻' : '🧠'}
              </div>

              {/* Message box */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 leading-none">
                  <span className="font-bold text-slate-400">
                    {msg.sender === 'user' ? 'You' : runningModel.name}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* reasoning steps for reasoning model replies */}
                {msg.reasoningSteps && (
                  <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 text-[10px] font-mono text-cyan-400 flex flex-col gap-1 max-w-lg">
                    <span className="font-display font-extrabold text-[8px] uppercase tracking-wider text-slate-500 mb-1">
                      Reasoning process
                    </span>
                    {msg.reasoningSteps.map((step, sIdx) => (
                      <div key={sIdx}>{step}</div>
                    ))}
                  </div>
                )}

                {/* Main bubble */}
                <div className={`rounded-2xl p-4 text-xs font-sans leading-relaxed shadow-lg max-w-xl ${
                  msg.sender === 'user'
                    ? 'bg-cyan-500/10 border border-cyan-500/20 text-slate-200 rounded-tr-none'
                    : 'bg-slate-900/60 border border-white/5 text-slate-300 rounded-tl-none'
                }`}>
                  {/* format rendering for codeblocks in chats */}
                  {msg.content.includes('```') ? (
                    <div className="flex flex-col gap-2">
                      {msg.content.split('```').map((part, pIdx) => {
                        if (pIdx % 2 === 1) {
                          // Clean off the language name if present
                          const cleanCode = part.replace(/^[a-zA-Z]+\n/, '');
                          return (
                            <pre
                              key={pIdx}
                              className="rounded-lg bg-black/60 p-3 font-mono text-[10px] text-emerald-400 overflow-x-auto leading-normal border border-white/5"
                            >
                              {cleanCode}
                            </pre>
                          );
                        }
                        return <span key={pIdx}>{part}</span>;
                      })}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}

                  {msg.imageUrl && (
                    <div className="w-64 aspect-video rounded-lg overflow-hidden border border-white/10 mt-3">
                      <img src={msg.imageUrl} alt="Generated visual output" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing state indicator */}
          {isReplying && (
            <div className="flex gap-4 self-start text-left max-w-xl animate-fade-in">
              <div className="h-8 w-8 rounded-full bg-[#252836] flex items-center justify-center text-sm shrink-0">
                🤖
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-sans text-[10px] text-slate-500 font-bold leading-none">{runningModel.name}</span>
                <div className="rounded-2xl p-4 bg-slate-900/60 border border-white/5 rounded-tl-none flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input Form Footer */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-white/5 bg-[#0b0c10]/60 backdrop-blur-md p-4 shrink-0 flex items-center gap-3"
        >
          <input
            type="text"
            placeholder={`Message ${runningModel.name}...`}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isReplying}
            className="flex-grow rounded-xl glass-input px-4 py-3 font-sans text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isReplying || !inputVal.trim()}
            className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 px-4 py-3 text-slate-950 font-display text-xs font-black flex items-center gap-1 cursor-pointer transition-all shrink-0"
          >
            Send
            <Send size={12} />
          </button>
        </form>
      </div>
    </div>
  );
};
