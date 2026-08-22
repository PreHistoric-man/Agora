import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Trash2,
  X,
  ExternalLink,
  Plus,
  Check,
  Rocket,
  Scale,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export interface AssistantSuggestedModel {
  id: string;
  name: string;
  provider: string;
  category: string;
  rating: number;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  contextWindow: string;
  parameters?: string;
  isOpenSource: boolean;
  runtime?: string;
  description: string;
  tags: string[];
}

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedModels?: AssistantSuggestedModel[];
}

const STARTER_PROMPTS = [
  { label: '🔎 Find a model', query: 'What models are available for general reasoning and analysis on Agora?' },
  { label: '💻 Best coding models', query: 'Which AI models on Agora are best for coding, refactoring, and TypeScript?' },
  { label: '🖼️ Image generation', query: 'What image generation models do you have on Agora?' },
  { label: '⚖️ Compare models', query: 'Compare DeepSeek-R1 with Claude 3.5 Sonnet in terms of speed, price, and reasoning.' },
  { label: '📚 In my library?', query: "What models are in my library and what can I do with them?" },
  { label: '🚀 Help me deploy', query: 'How do I deploy an AI model to AWS or run it locally in the Agora Launcher?' }
];

export const AgoraAssistant: React.FC = () => {
  const {
    setView,
    setSelectedModelId,
    addToLibrary,
    isModelInLibrary,
    openDeploymentWizard,
    addToCompare,
    libraryModelIds,
    deployments,
    addToast
  } = useApp();

  const { isAuthenticated, user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      content:
        "👋 Hi! I'm **Agora Assistant**, your guide to the AI model marketplace.\n\nI can help you find models for coding, reasoning, or vision, compare token pricing and benchmarks, check your library, or guide you through AWS and local launcher deployments.\n\nWhat would you like to explore today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation payload for backend
      const conversationHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content
      }));

      const userContextPayload = {
        isAuthenticated: Boolean(isAuthenticated),
        userId: user?.id,
        userEmail: user?.email,
        libraryModelIds: Array.from(libraryModelIds || []),
        deploymentsSummary: (deployments || []).map((d) => ({
          id: d.id,
          modelId: d.model_id,
          status: d.status,
          provider: d.provider
        }))
      };

      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          userContext: userContextPayload
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: ChatMessageItem = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.message || "I'm sorry, I couldn't generate a response. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedModels: data.suggestedModels || []
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('[Agora Assistant Chat Error]:', err);
      const errorMessage: ChatMessageItem = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          "Sorry, I had trouble reaching the AI service right now. You can try asking again, or click one of the quick topics below.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content:
          "Chat history cleared. How can I help you discover or deploy AI models today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleViewModel = (modelId: string) => {
    setSelectedModelId(modelId);
    setView('model-detail');
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  const handleAddToLibrary = async (modelId: string, modelName: string) => {
    const res = await addToLibrary(modelId);
    if (res.success) {
      if (res.alreadyInLibrary) {
        addToast(`${modelName} is already in your library`, 'info');
      } else {
        addToast(`Added ${modelName} to your library!`, 'success');
      }
    } else {
      addToast(res.error || 'Could not add to library', 'error');
    }
  };

  const handleDeploy = (modelId: string) => {
    openDeploymentWizard(modelId);
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  const handleCompare = (modelId: string) => {
    addToCompare(modelId);
    setView('compare');
    addToast('Added model to comparison table', 'info');
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  // Helper to render markdown-like formatting in messages (bold, bullet points, code)
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');

    return lines.map((line, lIdx) => {
      // Bullet list item
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const itemContent = line.trim().replace(/^([•\-*])\s*/, '');
        return (
          <div key={lIdx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-cyan-400 font-bold leading-relaxed">•</span>
            <span className="flex-1 leading-relaxed">{formatInline(itemContent)}</span>
          </div>
        );
      }

      // Empty line / paragraph break
      if (!line.trim()) {
        return <div key={lIdx} className="h-2" />;
      }

      return (
        <p key={lIdx} className="my-0.5 leading-relaxed">
          {formatInline(line)}
        </p>
      );
    });
  };

  const formatInline = (str: string) => {
    // Split by markdown bold (**text**)
    const parts = str.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const clean = part.slice(2, -2);
        return (
          <strong key={pIdx} className="font-semibold text-slate-100">
            {clean}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        const codeClean = part.slice(1, -1);
        return (
          <code key={pIdx} className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-900/80 border border-slate-700 text-cyan-300 font-mono text-xs">
            {codeClean}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Trigger Button on bottom-right */}
      {!isOpen && (
        <button
          id="agora-assistant-trigger-btn"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 px-4 py-3.5 rounded-full bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium shadow-2xl shadow-cyan-950/60 border border-cyan-400/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          aria-label="Open Agora Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-5 h-5 text-cyan-100 group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0b0c10] animate-pulse" />
          </div>
          <span className="text-sm font-semibold tracking-wide flex items-center gap-1.5">
            Agora Assistant
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
          </span>
        </button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div
          id="agora-assistant-panel"
          className="fixed sm:bottom-6 sm:right-6 bottom-0 right-0 z-50 w-full sm:w-[440px] h-[100dvh] sm:h-[620px] max-h-[100dvh] sm:max-h-[88vh] flex flex-col bg-[#0f131d]/98 sm:rounded-2xl rounded-none border border-slate-700/70 shadow-2xl shadow-cyan-950/80 backdrop-blur-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-[#141a29] to-[#121622] border-b border-slate-800/80 select-none">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-900/40 border border-cyan-400/30">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#121622]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">Agora Assistant</h3>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    AI Marketplace
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-tight">Your AI model marketplace assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                id="assistant-clear-history-btn"
                onClick={handleClearHistory}
                title="Clear conversation"
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                id="assistant-close-btn"
                onClick={() => setIsOpen(false)}
                title="Close assistant"
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Message Bubble */}
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-md transition-all ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-xs'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-xs'
                  }`}
                >
                  <div className="text-sm font-normal">
                    {renderFormattedText(msg.content)}
                  </div>
                  <span className={`block text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-cyan-100/70 text-right' : 'text-slate-500'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {/* Suggested Model Action Cards */}
                {msg.role === 'assistant' && msg.suggestedModels && msg.suggestedModels.length > 0 && (
                  <div className="w-full mt-2.5 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-cyan-400" />
                      Agora Marketplace Models
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {msg.suggestedModels.map((m) => {
                        const inLibrary = isModelInLibrary(m.id);

                        return (
                          <div
                            key={m.id}
                            className="p-3 rounded-xl bg-slate-900/95 border border-slate-800/80 hover:border-cyan-500/40 transition-all shadow-md group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                                    {m.name}
                                  </h4>
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                    {m.category}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                  {m.provider} • ★ {m.rating.toFixed(1)} • ${m.inputPricePerMillion}/1M in • {m.contextWindow}
                                </p>
                              </div>

                              <button
                                onClick={() => handleViewModel(m.id)}
                                className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="View Model Details"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-800/60">
                              <button
                                onClick={() => handleViewModel(m.id)}
                                className="flex-1 min-w-[70px] text-center px-2 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
                              >
                                View Model
                              </button>

                              <button
                                onClick={() => handleAddToLibrary(m.id, m.name)}
                                className={`flex items-center justify-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                                  inLibrary
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-600/40'
                                }`}
                              >
                                {inLibrary ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    In Library
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    Library
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleDeploy(m.id)}
                                className="flex items-center justify-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-600/40 transition-colors cursor-pointer"
                                title="Deploy to AWS or Local"
                              >
                                <Rocket className="w-3 h-3" />
                                Deploy
                              </button>

                              <button
                                onClick={() => handleCompare(m.id)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Add to comparison"
                              >
                                <Scale className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Thinking / Loading State */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-xs bg-slate-900/90 border border-slate-800 text-slate-300 text-xs flex items-center gap-2">
                  <span className="text-slate-400">Agora Assistant is thinking</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Chips */}
          <div className="px-3 py-2 bg-[#0c0f17] border-t border-slate-800/80 overflow-x-auto scrollbar-none flex items-center gap-1.5">
            {STARTER_PROMPTS.map((starter, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(starter.query)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer disabled:opacity-50"
              >
                {starter.label}
              </button>
            ))}
          </div>

          {/* Message Input Form */}
          <div className="p-3 bg-[#0d1018] border-t border-slate-800/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                id="agora-assistant-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about AI models..."
                disabled={isLoading}
                className="flex-1 bg-slate-900/90 text-sm text-slate-100 placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-700/70 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
              <button
                id="agora-assistant-send-btn"
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center shadow-md shadow-cyan-950"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
