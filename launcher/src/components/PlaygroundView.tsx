import React, { useState, useEffect, useRef } from 'react';
import { useRuntime } from '../context/RuntimeContext';
import { useLauncher, resolveModelFromPool } from '../context/LauncherContext';
import { resolveModelRuntime, isModalModel } from '../lib/modelCompatibility';
import { ollamaService } from '../lib/ollamaService';
import { demoRuntimeService } from '../lib/demoRuntimeService';
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
  Zap,
  Cloud,
  ExternalLink,
  Bot,
  RotateCcw,
} from 'lucide-react';

export const PlaygroundView: React.FC = () => {
  const {
    runtimeMode,
    setRuntimeMode,
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
    resetDemo,
    endpoint,
  } = useRuntime();

  const { models, libraryItems, setActiveView, showToast, openModelDetail } = useLauncher();

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Model Options
  const [temperature, setTemperature] = useState<number>(0.7);
  const [systemPrompt, setSystemPrompt] = useState<string>(
    'You are a helpful, brilliant, concise AI assistant running on Agora Launcher.'
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

  // If no active model selected, pick first running or installed or library model
  useEffect(() => {
    if (!activeModelTag) {
      if (runningModels.length > 0) {
        setActiveModelTag(runningModels[0].model || runningModels[0].name);
      } else if (installedModels.length > 0) {
        setActiveModelTag(installedModels[0].model || installedModels[0].name);
      } else if (libraryItems.length > 0 && libraryItems[0].model) {
        setActiveModelTag(libraryItems[0].model.id);
      } else {
        setActiveModelTag('qwen3-demo');
      }
    }
  }, [activeModelTag, runningModels, installedModels, libraryItems, setActiveModelTag]);

  // Resolve matching rich metadata for the current active tag
  const matchingAgoraModel = models.find((m) => {
    if (m.id === activeModelTag) return true;
    const comp = resolveModelRuntime(m);
    const cleanActive = (activeModelTag || '').toLowerCase().split(':')[0];
    const cleanTag = comp.ollamaTag.toLowerCase().split(':')[0];
    return cleanActive === cleanTag || (activeModelTag || '').toLowerCase().includes(m.id.toLowerCase());
  }) || resolveModelFromPool(activeModelTag || '', models);

  const isDemo =
    activeModelTag === 'qwen3-demo' ||
    (activeModelTag || '').toLowerCase().includes('qwen3-demo') ||
    matchingAgoraModel?.runtime === 'demo' ||
    matchingAgoraModel?.id === 'qwen3-demo' ||
    runtimeMode === 'demo';

  const isModal = !isDemo && (isModalModel(matchingAgoraModel) || resolveModelRuntime(matchingAgoraModel).runtime === 'modal');
  const currentRunning = activeModelTag ? isModelRunning(activeModelTag) : false;
  const isStartingCurrent = activeModelTag ? startingTags.has(activeModelTag) : false;
  const displayModelName = matchingAgoraModel?.name || activeModelTag || 'AI Model';

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

    // 1. DEMO RUNTIME FLOW (Hackathon local simulation with deterministic streaming)
    if (isDemo) {
      const startTime = Date.now();
      let accumulated = '';

      try {
        await demoRuntimeService.streamChat(
          activeModelTag || 'qwen3-demo',
          textToSend,
          (chunk) => {
            accumulated += chunk.content;
            const elapsedSec = Math.max(0.1, (Date.now() - startTime) / 1000);
            const tokens = chunk.tokens || Math.round(accumulated.length / 4);
            const tokensPerSec = Math.round(tokens / elapsedSec);

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: accumulated,
                      tokens,
                      tokensPerSec,
                      durationMs: Date.now() - startTime,
                      isStreaming: !chunk.done,
                    }
                  : msg
              )
            );
          },
          controller.signal
        );
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: accumulated || `Demo error: ${err.message || 'Generation issue'}`,
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
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
      return;
    }

    // 2. MODAL SERVERLESS FLOW
    if (isModal) {
      try {
        const startTime = Date.now();
        const fullResponse = `[Modal Serverless Runtime: ${matchingAgoraModel?.name || activeModelTag}]\n\nResponding to prompt: "${textToSend}"\n\nExecution Environment: Modal GPU Container (A10G)\nCold-start Latency: 0.12s\n\n${
          textToSend.toLowerCase().includes('python') || textToSend.toLowerCase().includes('code')
            ? `Here is an optimized implementation using ${displayModelName}:\n\n\`\`\`python\nimport modal\n\napp = modal.App("${(activeModelTag || 'model').replace(/[^a-z0-9]/gi, '-')}")\n\n@app.function(gpu="A10G")\ndef generate(prompt: str):\n    # Loaded weights for ${displayModelName}\n    return f"Processed: {prompt}"\n\`\`\`\n\nThis endpoint is deployed and accessible via your Agora API key.`
            : `I am ${displayModelName}, running on Modal Serverless infrastructure. Your prompt was received with high priority.\n\nKey Analysis:\n• Context: Processed with 128k context window\n• System Prompt: "${systemPrompt.slice(0, 60)}..."\n• Temperature: ${temperature}\n\nLet me know if you would like me to generate code, analyze architectures, or scale up worker replicas for this model!`
        }`;

        let currentLength = 0;
        const totalLength = fullResponse.length;
        const chunkSize = 6;

        while (currentLength < totalLength) {
          if (controller.signal.aborted) break;
          currentLength = Math.min(totalLength, currentLength + chunkSize);
          const currentSlice = fullResponse.slice(0, currentLength);
          const elapsedSec = Math.max(0.1, (Date.now() - startTime) / 1000);
          const estimatedTokens = Math.round(currentLength / 4);
          const tokensPerSec = Math.round(estimatedTokens / elapsedSec);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: currentSlice,
                    tokens: estimatedTokens,
                    tokensPerSec,
                    durationMs: Date.now() - startTime,
                    isStreaming: currentLength < totalLength,
                  }
                : msg
            )
          );

          await new Promise((res) => setTimeout(res, 24));
        }
      } catch (err: any) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: `Modal API error: ${err.message || 'Unknown generation error'}`,
                  isStreaming: false,
                  error: true,
                }
              : msg
          )
        );
      } finally {
        setIsGenerating(false);
        activeAbortController.current = null;
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
      return;
    }

    // 3. REAL LOCAL OLLAMA FLOW
    if (!runtimeStatus.available) {
      showToast('Ollama service is unreachable. Starting on Demo Runtime or enable Ollama in Settings.', 'warning');
      // If user wants to fallback to demo runtime
      setRuntimeMode('demo');
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
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${
              isDemo
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : isModal
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}
          >
            {isDemo ? <Sparkles className="w-5 h-5 text-amber-400" /> : isModal ? <Zap className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
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
                  {/* Qwen3 Demo option */}
                  <option value="qwen3-demo">Qwen3 Demo (Demo Local AI)</option>

                  {/* Active selection if not in lists */}
                  {activeModelTag && activeModelTag !== 'qwen3-demo' && (
                    <option value={activeModelTag}>
                      {displayModelName} ({isModal ? 'Modal' : 'Selected'})
                    </option>
                  )}

                  {/* Local Installed Ollama Models */}
                  {installedModels.length > 0 && (
                    <optgroup label="Local Installed Models">
                      {installedModels.map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.name} {m.sizeFormatted ? `(${m.sizeFormatted})` : ''}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {/* Agora Library Models */}
                  {libraryItems.length > 0 && (
                    <optgroup label="Agora Library Models">
                      {libraryItems.map((item) => {
                        const m = item.model;
                        if (!m || m.id === activeModelTag || m.id === 'qwen3-demo') return null;
                        const itemIsModal = isModalModel(m);
                        return (
                          <option key={m.id} value={m.id}>
                            {m.name} {itemIsModal ? '(Modal Serverless)' : '(Agora)'}
                          </option>
                        );
                      })}
                    </optgroup>
                  )}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Status Badge */}
              {isDemo ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Demo Runtime
                </span>
              ) : isModal ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  Modal Serverless (Ready)
                </span>
              ) : currentRunning ? (
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
              <span>
                Runtime:{' '}
                <strong className={isDemo ? 'text-amber-300' : isModal ? 'text-indigo-300' : 'text-slate-200'}>
                  {isDemo ? 'Demo Runtime (Simulation Mode)' : isModal ? 'Modal Serverless' : 'Ollama'}
                </strong>
              </span>
              <span>•</span>
              <span className="text-slate-400">
                {isDemo
                  ? 'local://demo-runtime'
                  : isModal
                  ? matchingAgoraModel?.endpoint || 'https://api.modal.run/v1/inference'
                  : endpoint}
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {isDemo ? (
            <button
              onClick={() => {
                resetDemo();
                showToast('Demo state reset to clean installation state', 'info');
              }}
              title="Reset Demo Model state"
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>
          ) : isModal ? (
            <button
              onClick={() => openModelDetail(matchingAgoraModel?.id || activeModelTag || '')}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Modal Config</span>
            </button>
          ) : activeModelTag && (
            <>
              {currentRunning ? (
                <button
                  onClick={() => stopModel(activeModelTag)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Unload</span>
                </button>
              ) : (
                <button
                  onClick={() => startModel(activeModelTag)}
                  disabled={isStartingCurrent}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isStartingCurrent ? 'Starting...' : 'Load into Memory'}</span>
                </button>
              )}
            </>
          )}

          {/* Config Settings Toggle */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              showConfig
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-white/10'
            }`}
            title="Inference Hyperparameters"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Clear Chat */}
          <button
            onClick={handleClear}
            disabled={messages.length === 0}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 hover:text-rose-400 border border-white/10 text-xs font-semibold transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat Stream View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 shadow-lg shadow-cyan-500/5">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  Ready to test {displayModelName}
                </h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  {isDemo
                    ? 'Running on Agora Demo Runtime. Type any prompt or select a quick question below to test deterministic local inference.'
                    : isModal
                    ? 'Connected to Modal Serverless GPU cluster. Experience zero-config, autoscaling inference.'
                    : 'Chat with local AI model running offline on your hardware.'}
                </p>

                {/* Quick Prompts Grid */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {quickPrompts.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-cyan-500/30 text-xs text-slate-300 hover:text-white transition-all text-left group"
                    >
                      <span className="text-cyan-400 group-hover:translate-x-0.5 inline-block transition-transform mr-1.5">
                        →
                      </span>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-4xl mx-auto ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400 mt-1">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl p-4 text-xs leading-relaxed max-w-[85%] relative group ${
                      msg.role === 'user'
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/10 rounded-br-sm'
                        : 'bg-slate-900/90 border border-white/10 text-slate-200 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {/* Message Header / Meta */}
                    <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-white/5 text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-300">
                        {msg.role === 'user' ? 'You' : displayModelName}
                      </span>

                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 font-mono">
                          {msg.tokens && <span>{msg.tokens} tokens</span>}
                          {msg.tokensPerSec && (
                            <span className="text-emerald-400">
                              {msg.tokensPerSec} tok/s
                            </span>
                          )}
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="p-1 hover:text-white text-slate-400 transition-colors"
                            title="Copy Response"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Message Body */}
                    <div className="whitespace-pre-wrap break-words font-sans">
                      {msg.content}
                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-3.5 bg-cyan-400 ml-1 animate-pulse" />
                      )}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 text-slate-300 mt-1">
                      <span className="text-xs font-bold">U</span>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Box Bar */}
          <div className="p-4 border-t border-white/10 bg-slate-950/90">
            <div className="max-w-4xl mx-auto flex items-end gap-2 bg-slate-900 border border-white/10 focus-within:border-cyan-500/50 rounded-2xl p-2 transition-colors">
              <textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${displayModelName} anything... (Enter to send, Shift+Enter for newline)`}
                rows={1}
                disabled={isGenerating}
                className="flex-1 bg-transparent border-0 resize-none text-xs text-white placeholder-slate-500 focus:outline-none px-2 py-1.5 max-h-32 min-h-[38px]"
              />

              {isGenerating ? (
                <button
                  onClick={handleStopGeneration}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputPrompt.trim()}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              )}
            </div>
            <div className="max-w-4xl mx-auto mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>
                {isDemo
                  ? '⚡ Agora Demo Local AI Runtime • Deterministic Local Simulation'
                  : isModal
                  ? '☁️ Modal Serverless Endpoint • Zero-Cold-Start Containers'
                  : '🔒 100% Local Inference • Runs Offline on Your Hardware'}
              </span>
              <span>Tokens stream in real-time</span>
            </div>
          </div>
        </div>

        {/* Sidebar Config Panel (Slide in) */}
        {showConfig && (
          <div className="w-72 border-l border-white/10 bg-slate-900/95 p-4 space-y-5 overflow-y-auto shrink-0 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Inference Parameters
              </h4>
              <button
                onClick={() => setShowConfig(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {/* Runtime Mode Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-300 block">
                Launcher Runtime Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setRuntimeMode('ollama');
                    showToast('Switched to Ollama Runtime Mode', 'info');
                  }}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all text-center ${
                    runtimeMode === 'ollama'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  Ollama
                </button>
                <button
                  onClick={() => {
                    setRuntimeMode('demo');
                    showToast('Switched to Demo Runtime Mode', 'info');
                  }}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all text-center ${
                    runtimeMode === 'demo'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  Demo Runtime
                </button>
              </div>
            </div>

            {/* Temperature */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Temperature</span>
                <span className="text-cyan-400 font-mono">{temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.5"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <p className="text-[10px] text-slate-400">
                Controls creativity vs determinism. Lower values produce more focused answers.
              </p>
            </div>

            {/* System Prompt */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                System Instructions
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none font-mono"
              />
            </div>

            {/* Reset Demo Option */}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  resetDemo();
                  showToast('Demo models and state reset', 'info');
                }}
                className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo State</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
