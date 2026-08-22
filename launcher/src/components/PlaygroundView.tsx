import React, { useState, useEffect, useRef } from 'react';
import { useRuntime } from '../context/RuntimeContext';
import { useLauncher } from '../context/LauncherContext';
import { resolveModelRuntime } from '../lib/modelCompatibility';
import { ollamaService } from '../lib/ollamaService';
import type { ChatMessage, ChatOptions } from '../types/runtime';
import {
  Sparkles,
  Send,
  Square,
  Trash2,
  Play,
  RotateCw,
  Cpu,
  Terminal,
  Settings2,
  Copy,
  Check,
  AlertTriangle,
  Layers,
  ChevronDown,
  Info,
} from 'lucide-react';

export const PlaygroundView: React.FC = () => {
  const {
    runtimeStatus,
    installedModels,
    runningModels,
    activeModelTag,
    setActiveModelTag,
    isModelRunning,
    startModel,
    stopModel,
    startingTags,
    refreshRuntime,
    endpoint,
  } = useRuntime();

  const { models, libraryItems, setActiveView, showToast } = useLauncher();

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Model Options
  const [temperature, setTemperature] = useState<number>(0.7);
  const [systemPrompt, setSystemPrompt] = useState<string>(
    'You are a helpful, brilliant, concise AI assistant running locally on Agora Launcher.'
  );

  const activeAbortController = useRef<AbortController | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // If no active model selected but models exist, pick first running or installed model
  useEffect(() => {
    if (!activeModelTag) {
      if (runningModels.length > 0) {
        setActiveModelTag(runningModels[0].model || runningModels[0].name);
      } else if (installedModels.length > 0) {
        setActiveModelTag(installedModels[0].model || installedModels[0].name);
      }
    }
  }, [activeModelTag, runningModels, installedModels, setActiveModelTag]);

  const currentRunning = activeModelTag ? isModelRunning(activeModelTag) : false;
  const isStartingCurrent = activeModelTag ? startingTags.has(activeModelTag) : false;

  // Find rich metadata for the current active tag
  const matchingAgoraModel = models.find((m) => {
    const comp = resolveModelRuntime(m);
    if (!comp.supported) return false;
    const cleanActive = (activeModelTag || '').toLowerCase().split(':')[0];
    const cleanTag = comp.ollamaTag.toLowerCase().split(':')[0];
    return cleanActive === cleanTag || (activeModelTag || '').toLowerCase().includes(m.id.toLowerCase());
  });

  const displayModelName = matchingAgoraModel?.name || activeModelTag || 'Local AI Model';

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    if (isGenerating && activeAbortController.current) {
      activeAbortController.current.abort();
      setIsGenerating(false);
    }
    setMessages([]);
  };

  const handleStopGeneration = () => {
    if (activeAbortController.current) {
      activeAbortController.current.abort();
      activeAbortController.current = null;
    }
    setIsGenerating(false);
  };

  const handleSendMessage = async (promptText?: string) => {
    const textToSend = (promptText || inputPrompt).trim();
    if (!textToSend || !activeModelTag || isGenerating) return;

    if (!runtimeStatus.available) {
      showToast('Ollama service is unreachable. Please start Ollama first.', 'error');
      return;
    }

    if (!currentRunning) {
      showToast(`Starting model ${activeModelTag}...`, 'info');
      const started = await startModel(activeModelTag);
      if (!started) {
        showToast(`Failed to start model ${activeModelTag}.`, 'error');
        return;
      }
    }

    const userMessageId = `user_${Date.now()}`;
    const assistantMessageId = `assistant_${Date.now()}`;

    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    const initialAssistantMsg: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const newHistory = [...messages, userMsg];
    setMessages([...newHistory, initialAssistantMsg]);
    setInputPrompt('');
    setIsGenerating(true);

    const controller = new AbortController();
    activeAbortController.current = controller;

    const chatHistoryPayload = newHistory.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const options: ChatOptions = {
      temperature,
      system_prompt: systemPrompt,
    };

    let accumulatedContent = '';

    try {
      await ollamaService.streamChat(
        activeModelTag,
        chatHistoryPayload,
        options,
        endpoint,
        (chunk) => {
          accumulatedContent += chunk.content;

          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === assistantMessageId) {
                return {
                  ...msg,
                  content: accumulatedContent,
                  tokens: chunk.tokens,
                  tokensPerSec: chunk.tokensPerSec,
                  durationMs: chunk.durationMs,
                  isStreaming: !chunk.done,
                };
              }
              return msg;
            })
          );
        },
        controller.signal
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, isStreaming: false }
              : msg
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content:
                    accumulatedContent ||
                    `Error communicating with Ollama: ${err.message || 'Unknown generation error'}`,
                  isStreaming: false,
                  error: true,
                }
              : msg
          )
        );
      }
    } finally {
      setIsGenerating(false);
      activeAbortController.current = null;
      // Auto-focus textarea for next response
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    'Explain recursion in C++ with clean syntax.',
    'Write a Python script to fetch JSON data from a REST API.',
    'Summarize the core difference between Transformer self-attention and RNNs.',
    'Draft a robust system design for high-concurrency order processing.',
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950/70 overflow-hidden">
      {/* Top Header Bar */}
      <div className="p-4 px-6 border-b border-white/10 bg-slate-950/90 flex flex-wrap items-center justify-between gap-4 shrink-0">
        {/* Left: Model Selector & Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              {/* Model Dropdown */}
              <div className="relative">
                <select
                  value={activeModelTag || ''}
                  onChange={(e) => setActiveModelTag(e.target.value)}
                  disabled={isGenerating}
                  className="bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-white text-xs font-bold rounded-lg px-2.5 py-1 pr-7 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                >
                  {installedModels.length === 0 ? (
                    <option value="">No models installed locally</option>
                  ) : (
                    installedModels.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} ({m.sizeFormatted})
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Status Badge */}
              {currentRunning ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Running
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-white/5">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  Stopped
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
              <span>Runtime: <strong className="text-slate-200">Ollama</strong></span>
              <span>•</span>
              <span className="text-slate-400">{endpoint}</span>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Launch / Stop Control */}
          {activeModelTag && (
            <>
              {currentRunning ? (
                <button
                  onClick={() => stopModel(activeModelTag)}
                  disabled={isGenerating}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Stop Model</span>
                </button>
              ) : (
                <button
                  onClick={() => startModel(activeModelTag)}
                  disabled={isStartingCurrent || isGenerating}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  {isStartingCurrent ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Model</span>
                    </>
                  )}
                </button>
              )}
            </>
          )}

          {/* Config Popover Toggle */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-2 rounded-lg border transition-colors ${
              showConfig
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border-white/10'
            }`}
            title="Model Parameters"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Clear Chat */}
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-white/10 transition-colors"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Model Parameters Panel */}
      {showConfig && (
        <div className="px-6 py-3 bg-slate-900 border-b border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-300 animate-fade-in shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-400">Temperature:</span>
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.05}
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-28 accent-cyan-500"
            />
            <span className="font-mono text-cyan-300">{temperature.toFixed(2)}</span>
          </div>

          <div className="flex-1 min-w-[240px] flex items-center gap-2">
            <span className="font-semibold text-slate-400 whitespace-nowrap">System Prompt:</span>
            <input
              type="text"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Instructions for the AI..."
              className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      )}

      {/* Main Chat Thread Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* State 1: Ollama Server Offline Notice */}
        {!runtimeStatus.available && (
          <div className="max-w-xl mx-auto p-5 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-3 text-center my-6">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Ollama Server Offline</h3>
              <p className="text-xs text-slate-400 mt-1">
                Agora cannot reach the local Ollama runtime at <code className="text-rose-300 font-mono">{endpoint}</code>.
              </p>
            </div>
            <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-white/5 text-left font-mono space-y-1">
              <div className="text-slate-500">// Start Ollama in terminal or launch Ollama app:</div>
              <div className="text-cyan-300">ollama serve</div>
            </div>
            <button
              onClick={() => refreshRuntime()}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs transition-all shadow-md inline-flex items-center gap-2"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {/* State 2: No Models Installed */}
        {runtimeStatus.available && installedModels.length === 0 && (
          <div className="max-w-md mx-auto p-8 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4 text-center my-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Cpu className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200">No Local Models Installed</h3>
              <p className="text-xs text-slate-400">
                You need at least one open-weights model in your local Ollama storage (e.g., Qwen 2.5 Coder, DeepSeek R1, Llama 3.2).
              </p>
            </div>
            <button
              onClick={() => setActiveView('library')}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 inline-flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Go to Library to Install</span>
            </button>
          </div>
        )}

        {/* State 3: Model Not Running Banner inside Playground */}
        {runtimeStatus.available && installedModels.length > 0 && !currentRunning && (
          <div className="max-w-2xl mx-auto p-4 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div>
                <div className="text-xs font-bold text-slate-200">
                  Model <span className="text-cyan-300">{displayModelName}</span> is currently stopped
                </div>
                <div className="text-[11px] text-slate-400">
                  Click start to load model weights into RAM/VRAM for instant generation.
                </div>
              </div>
            </div>
            <button
              onClick={() => activeModelTag && startModel(activeModelTag)}
              disabled={isStartingCurrent}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 shrink-0"
            >
              {isStartingCurrent ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Model</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Conversation Message List */}
        {messages.length === 0 && runtimeStatus.available && installedModels.length > 0 ? (
          <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                AI Inference Playground
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Chat directly with your local instance of <strong className="text-cyan-300">{displayModelName}</strong> via Ollama on <span className="font-mono text-slate-300">127.0.0.1:11434</span>. Zero cloud latency, 100% private.
              </p>
            </div>

            {/* Quick Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left max-w-xl mx-auto pt-2">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp)}
                  className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 hover:bg-slate-900 transition-all text-xs text-slate-300 text-left group flex items-start justify-between gap-2"
                >
                  <span className="group-hover:text-cyan-200 transition-colors leading-relaxed">{qp}</span>
                  <Send className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 shrink-0 mt-0.5" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 px-1 font-semibold uppercase tracking-wider">
                    {isUser ? (
                      <span>You</span>
                    ) : (
                      <span className="text-cyan-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {displayModelName}
                      </span>
                    )}
                    <span>•</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Bubble */}
                  <div
                    className={`relative p-4 rounded-2xl text-xs leading-relaxed max-w-[90%] whitespace-pre-wrap break-words ${
                      isUser
                        ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-slate-950 font-medium rounded-tr-none shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/90 border border-white/10 text-slate-200 rounded-tl-none font-normal shadow-lg'
                    }`}
                  >
                    {msg.content ? (
                      <div>{msg.content}</div>
                    ) : msg.isStreaming ? (
                      <div className="flex items-center gap-2 text-slate-400 italic">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        <span>Generating response...</span>
                      </div>
                    ) : null}

                    {/* Assistant Footer Telemetry */}
                    {!isUser && (msg.tokens || msg.tokensPerSec) && (
                      <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <div className="flex items-center gap-3">
                          {msg.tokens && <span>{msg.tokens} tokens</span>}
                          {msg.tokensPerSec && (
                            <span className="text-emerald-400 font-bold">
                              ⚡ {msg.tokensPerSec} tok/s
                            </span>
                          )}
                          {msg.durationMs && (
                            <span>{(msg.durationMs / 1000).toFixed(1)}s</span>
                          )}
                        </div>

                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>
        )}
      </div>

      {/* Bottom Input Field Container */}
      <div className="p-4 md:p-5 border-t border-white/10 bg-slate-950/90 shrink-0">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="relative rounded-2xl bg-slate-900 border border-white/10 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all p-2 flex items-end gap-2 shadow-2xl">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating || !runtimeStatus.available || installedModels.length === 0}
              placeholder={
                !runtimeStatus.available
                  ? 'Ollama is offline. Start Ollama to begin chatting...'
                  : installedModels.length === 0
                  ? 'No models installed. Download a model from your Library first.'
                  : `Ask ${displayModelName} something... (Enter to send, Shift+Enter for new line)`
              }
              className="w-full bg-transparent resize-none px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none leading-relaxed"
            />

            <div className="flex items-center gap-1.5 pb-1 pr-1">
              {isGenerating ? (
                <button
                  onClick={handleStopGeneration}
                  className="px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
                  title="Stop generating"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  onClick={() => handleSendMessage()}
                  disabled={
                    !inputPrompt.trim() ||
                    !runtimeStatus.available ||
                    installedModels.length === 0
                  }
                  className={`p-2.5 rounded-xl transition-all ${
                    inputPrompt.trim() && runtimeStatus.available && installedModels.length > 0
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 px-2 font-mono">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              <span>Native Local Ollama Engine</span>
            </span>
            <span>Shift + Enter for multi-line</span>
          </div>
        </div>
      </div>
    </div>
  );
};
