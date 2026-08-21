import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Download,
  Share2,
  Bookmark,
  RotateCcw,
  Sliders,
  Play,
  Music,
  Split,
  ChevronDown
} from 'lucide-react';

interface TryModelProps {
  embedMode?: boolean;
  presetModelId?: string;
}

export const TryModel: React.FC<TryModelProps> = ({ embedMode = false, presetModelId }) => {
  const { models, selectedModelId, addToast } = useApp();

  // Model Selection
  const initialModelId = presetModelId || selectedModelId || 'pixelforge-xl';
  const [modelAId, setModelAId] = useState<string>(initialModelId);
  const [modelBId, setModelBId] = useState<string>('');
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);

  const modelA = models.find((m) => m.id === modelAId) || models[0];
  const modelB = models.find((m) => m.id === modelBId);

  // Parameter Settings
  const [prompt, setPrompt] = useState<string>('Cinematic portrait of a cyberpunk explorer standing in front of a glowing hologram display, neon rim lighting, 8k resolution');
  const [negativePrompt, setNegativePrompt] = useState<string>('bad anatomy, distorted face, low quality, blurry');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [style, setStyle] = useState<string>('Cinematic Photorealism');
  const [qualitySteps, setQualitySteps] = useState<number>(50);
  const [numOutputs, setNumOutputs] = useState<number>(4);

  // Generation status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [generationTime, setGenerationTime] = useState<number>(0);
  const [generationComplete, setGenerationComplete] = useState<boolean>(true);

  // Generated outputs
  const [outputImages, setOutputImages] = useState<string[]>([]);
  const [outputText, setOutputText] = useState<string>('');
  const [outputSteps, setOutputSteps] = useState<string[]>([]);

  // B outputs for compare mode
  const [outputImagesB, setOutputImagesB] = useState<string[]>([]);
  const [outputTextB, setOutputTextB] = useState<string>('');

  // Dropdown list for Model B (must match Model A's category for valid comparison)
  const comparableModels = models.filter((m) => m.category === modelA.category && m.id !== modelA.id);

  // Set default model B when compare mode is activated
  useEffect(() => {
    if (isCompareMode && comparableModels.length > 0 && !modelBId) {
      setModelBId(comparableModels[0].id);
    }
  }, [isCompareMode, modelA.category]);

  // Load initial model state
  useEffect(() => {
    if (presetModelId) {
      setModelAId(presetModelId);
    }
  }, [presetModelId]);

  // Set initial outputs on mount
  useEffect(() => {
    generateMockOutputs(true);
  }, [modelAId, modelBId]);

  const generateMockOutputs = (silent = false) => {
    // Return mock images based on prompt keyword matching or style
    let imagesA: string[] = [];
    let imagesB: string[] = [];
    let textA = '';
    let textB = '';
    let stepsA: string[] = [];

    const lowerPrompt = prompt.toLowerCase();

    if (modelA.category === 'Image') {
      if (lowerPrompt.includes('perfume') || lowerPrompt.includes('bottle')) {
        imagesA = [
          'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80'
        ];
        imagesB = [
          'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80'
        ];
      } else if (lowerPrompt.includes('portrait') || lowerPrompt.includes('explorer') || lowerPrompt.includes('face')) {
        imagesA = [
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80'
        ];
        imagesB = [
          'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80'
        ];
      } else {
        imagesA = [
          'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&auto=format&fit=crop&q=80'
        ];
        imagesB = [
          'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
        ];
      }
    } else if (modelA.category === 'Coding') {
      textA = `// Generated by ${modelA.name} in response to: "${prompt.substring(0, 30)}..."\n\ninterface Explorer {\n  id: string;\n  name: string;\n  specialty: string;\n}\n\nexport const fetchExplorers = async (regionId: string): Promise<Explorer[]> => {\n  console.log('Querying model database for region:', regionId);\n  const response = await fetch(\`/api/v1/regions/\${regionId}/explorers\`);\n  if (!response.ok) {\n    throw new Error('Inference node returned error: ' + response.statusText);\n  }\n  return await response.json();\n};`;
      textB = `// Generated by ${modelB?.name || 'Baseline'}\n\nfunction getExplorers(id) {\n  return fetch('/api/explorers/' + id)\n    .then(res => res.json())\n    .catch(err => console.error(err));\n}`;
    } else if (modelA.category === 'Reasoning') {
      stepsA = [
        '1. Deconstruct user request: "Determine prime factors of cryptographical public key..."',
        '2. Factorize integers using optimized trial bounds and quadratic sieve routines...',
        '3. Expose intermediate quotients and verify structural congruencies...',
        '4. Final synthesis: Found primes: P=641, Q=6700417.'
      ];
      textA = `The factoring sequence is successful. Primality test validated in 1.4 seconds.`;
      textB = `To resolve the factoring sequence, we deconstruct the composite integer and evaluate mathematical bounds. Factor quotients found: P=641, Q=6700417.`;
    } else {
      textA = `Synthesized audio stream containing procedurally computed harmonics matching prompt requests. Ready to export WAV format.`;
      textB = `Synthetic audio waveform initialized. Multi-channel mapping complete.`;
    }

    if (silent) {
      setOutputImages(imagesA.slice(0, numOutputs));
      setOutputImagesB(imagesB.slice(0, Math.min(numOutputs, 2)));
      setOutputText(textA);
      setOutputTextB(textB);
      setOutputSteps(stepsA);
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.floor(Math.random() * 20) + 10;
        if (next >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setGenerationComplete(true);
          setGenerationTime(Number((5.2 + Math.random() * 4).toFixed(1)));
          
          setOutputImages(imagesA.slice(0, numOutputs));
          setOutputImagesB(imagesB.slice(0, Math.min(numOutputs, 2)));
          setOutputText(textA);
          setOutputTextB(textB);
          setOutputSteps(stepsA);

          addToast('Sandbox generation completed!', 'success');
          return 100;
        }
        return next;
      });
    }, 150);
  };

  const handleGenerate = () => {
    generateMockOutputs();
  };

  const handleRemix = () => {
    setPrompt('Detailed architectural photography of a minimalist concrete villa nestled in foggy pine forest, early morning, soft diffusions');
    setStyle('Architectural Preset');
    addToast('Prompt remixed! Click Generate to see results.', 'info');
  };

  const costCalculation = () => {
    // Dynamic fake cost based on quality steps, outputs, and token rates
    const modelRate = modelA.inputPricePerMillion ? (modelA.inputPricePerMillion / 1000) : 0.002;
    return Number((modelRate * numOutputs * (qualitySteps / 50)).toFixed(4));
  };

  return (
    <div className={`w-full ${embedMode ? 'p-1' : 'mx-auto max-w-7xl px-4 py-8 md:px-6 animate-fade-in'}`}>
      {!embedMode && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-black text-white flex items-center gap-2">
              <Sparkles className="text-cyan-400" />
              Interactive Sandbox
            </h1>
            <p className="font-sans text-xs text-slate-400 mt-1">
              Test models, audit parameter variations, and benchmark performance in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Compare toggle */}
            <button
              onClick={() => setIsCompareMode(!isCompareMode)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-display text-xs font-bold border transition-all cursor-pointer ${
                isCompareMode
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Split size={14} />
              Compare Models
            </button>

            {/* Model Selector Dropdown A */}
            <div className="relative">
              <select
                value={modelAId}
                onChange={(e) => setModelAId(e.target.value)}
                className="appearance-none rounded-lg bg-slate-900 border border-white/10 pl-4 pr-10 py-2 font-display text-xs font-bold text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    Model A: {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-slate-500 pointer-events-none" size={14} />
            </div>

            {/* Model Selector Dropdown B (only in compare mode) */}
            {isCompareMode && (
              <div className="relative animate-fade-in">
                <select
                  value={modelBId}
                  onChange={(e) => setModelBId(e.target.value)}
                  className="appearance-none rounded-lg bg-slate-900 border border-white/10 pl-4 pr-10 py-2 font-display text-xs font-bold text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="">Select Model B...</option>
                  {comparableModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      Model B: {m.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-slate-500 pointer-events-none" size={14} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Parameters Panel */}
        <div className="rounded-2xl glass-panel p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Sliders size={16} className="text-cyan-400" />
            <h2 className="font-display text-sm font-black text-white">Parameters Config</h2>
          </div>

          {/* Model Selection in Embed Mode */}
          {embedMode && (
            <div className="flex flex-col gap-2">
              <label className="font-sans text-xs text-slate-400 font-semibold">Active Model</label>
              <div className="rounded-lg bg-white/5 border border-white/5 px-3 py-2 text-xs font-bold text-slate-200">
                {modelA.name}
              </div>
            </div>
          )}

          {/* Prompt */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs text-slate-400 font-semibold">Prompt Instructions</label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="rounded-lg glass-input p-3 text-xs text-slate-200 font-sans leading-relaxed"
              placeholder="What do you want to generate?..."
            />
          </div>

          {/* Negative Prompt (Only for image/video) */}
          {(modelA.category === 'Image' || modelA.category === 'Video') && (
            <div className="flex flex-col gap-2">
              <label className="font-sans text-xs text-slate-400 font-semibold">Negative Prompt</label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="rounded-lg glass-input px-3 py-2 text-xs text-slate-200 font-sans"
                placeholder="Undesired traits..."
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Aspect Ratio */}
            <div className="flex flex-col gap-2">
              <label className="font-sans text-xs text-slate-400 font-semibold">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="1:1">1:1 Square</option>
                <option value="16:9">16:9 Cinema</option>
                <option value="9:16">9:16 Portrait</option>
                <option value="4:3">4:3 Desktop</option>
                <option value="2:3">2:3 Classic</option>
              </select>
            </div>

            {/* Stylization Preset */}
            <div className="flex flex-col gap-2">
              <label className="font-sans text-xs text-slate-400 font-semibold">Style Preset</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="Cinematic Photorealism">Photorealism</option>
                <option value="Anime Vector">Anime Core</option>
                <option value="Dark Fantasy Concept">Dark Fantasy</option>
                <option value="Architectural Preset">Architecture</option>
                <option value="Minimal Vector Layout">Design layout</option>
                <option value="Oil Painting">Oil Painting</option>
              </select>
            </div>
          </div>

          {/* Quality Steps Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-sans text-slate-400 font-semibold">Quality Steps</span>
              <span className="font-display font-bold text-cyan-400">{qualitySteps} iterations</span>
            </div>
            <input
              type="range"
              min={20}
              max={120}
              step={10}
              value={qualitySteps}
              onChange={(e) => setQualitySteps(Number(e.target.value))}
              className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Outputs count */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs text-slate-400 font-semibold">Number of Outputs</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setNumOutputs(num)}
                  className={`py-1.5 rounded-lg border font-display text-xs font-bold cursor-pointer transition-all ${
                    numOutputs === num
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 mt-4 border-t border-white/5 pt-5">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 py-3.5 font-display text-sm font-black text-slate-950 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10 uppercase"
            >
              {isGenerating ? 'Running Inference...' : 'Run Generation'}
              {!isGenerating && <Play size={14} fill="currentColor" />}
            </button>
            
            <button
              type="button"
              onClick={handleRemix}
              className="w-full rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 py-2.5 font-display text-xs font-bold text-slate-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={12} />
              Remix Settings Example
            </button>
          </div>
        </div>

        {/* Right Side: Generated Outputs Display */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-2xl glass-panel p-6 flex flex-col flex-grow min-h-[480px]">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-4 mb-4 gap-2">
              <span className="font-display text-xs font-black text-white flex items-center gap-1.5">
                <Sparkles size={16} className="text-cyan-400" />
                Model Inference Output
              </span>
              
              {generationComplete && !isGenerating && (
                <div className="flex items-center gap-3 font-sans text-[10px] text-slate-500">
                  <span>Latency: <strong className="text-slate-300">{generationTime || '8.4'} sec</strong></span>
                  <span className="h-3 w-px bg-white/10"></span>
                  <span>Est. Charge: <strong className="text-slate-300">${costCalculation()}</strong></span>
                </div>
              )}
            </div>

            {/* Spinner loader state */}
            {isGenerating && (
              <div className="flex flex-col items-center justify-center flex-grow py-12">
                <div className="relative flex h-16 w-16 items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
                  <div className="absolute animate-pulse h-6 w-6 rounded-full bg-cyan-500/20"></div>
                </div>
                <span className="font-display text-sm font-bold text-slate-300">Inference active on node...</span>
                <p className="font-sans text-xs text-slate-500 mt-1">Generating weights ({progress}%)</p>
                <div className="w-48 h-1.5 rounded-full bg-white/5 mt-3 overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full transition-all duration-150" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            {/* Main content outputs */}
            {!isGenerating && generationComplete && (
              <div className="flex flex-col flex-grow">
                {/* Visual outputs grid */}
                {(modelA.category === 'Image') && (
                  <div className="flex flex-col gap-6">
                    {/* Compare Split Layout */}
                    {isCompareMode && modelB ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Model A Results */}
                        <div className="flex flex-col gap-2">
                          <span className="font-display text-[9px] font-black text-cyan-400 uppercase tracking-wider">{modelA.name} (A)</span>
                          <div className="grid grid-cols-1 gap-3">
                            {outputImages.slice(0, 1).map((img, i) => (
                              <div key={i} className="group relative aspect-video rounded-xl overflow-hidden glass-panel border border-white/5">
                                <img src={img} alt="output A" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                                  <button className="p-2 rounded bg-slate-900 text-slate-200 hover:text-white" title="Download"><Download size={14} /></button>
                                  <button className="p-2 rounded bg-slate-900 text-slate-200 hover:text-white" title="Remix"><RotateCcw size={14} /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <span className="font-sans text-[10px] text-slate-500 mt-1">Inference: 8.4s · Cost: ₹0.32</span>
                        </div>

                        {/* Model B Results */}
                        <div className="flex flex-col gap-2">
                          <span className="font-display text-[9px] font-black text-blue-400 uppercase tracking-wider">{modelB.name} (B)</span>
                          <div className="grid grid-cols-1 gap-3">
                            {outputImagesB.slice(0, 1).map((img, i) => (
                              <div key={i} className="group relative aspect-video rounded-xl overflow-hidden glass-panel border border-white/5">
                                <img src={img} alt="output B" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                                  <button className="p-2 rounded bg-slate-900 text-slate-200 hover:text-white" title="Download"><Download size={14} /></button>
                                  <button className="p-2 rounded bg-slate-900 text-slate-200 hover:text-white" title="Remix"><RotateCcw size={14} /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <span className="font-sans text-[10px] text-slate-500 mt-1">Inference: 1.2s · Cost: ₹0.08</span>
                        </div>
                      </div>
                    ) : (
                      /* Standard output images list */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {outputImages.map((img, idx) => (
                          <div key={idx} className="group relative aspect-video rounded-xl overflow-hidden glass-panel border border-white/5">
                            <img src={img} alt={`output-${idx}`} className="w-full h-full object-cover" />
                            
                            {/* hover actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                              <button
                                onClick={() => addToast('Image saved to library downloads', 'success')}
                                className="p-2 rounded-xl bg-slate-950/80 border border-white/10 hover:bg-slate-900 hover:scale-105 text-white transition-all cursor-pointer"
                                title="Save to gallery"
                              >
                                <Bookmark size={14} />
                              </button>
                              <button
                                onClick={() => addToast('Image exported to local downloads folder', 'success')}
                                className="p-2 rounded-xl bg-slate-950/80 border border-white/10 hover:bg-slate-900 hover:scale-105 text-white transition-all cursor-pointer"
                                title="Download image"
                              >
                                <Download size={14} />
                              </button>
                              <button
                                onClick={handleRemix}
                                className="p-2 rounded-xl bg-slate-950/80 border border-white/10 hover:bg-slate-900 hover:scale-105 text-white transition-all cursor-pointer"
                                title="Remix params"
                              >
                                <RotateCcw size={14} />
                              </button>
                              <button
                                onClick={() => addToast('Image shared to community hub!', 'success')}
                                className="p-2 rounded-xl bg-slate-950/80 border border-white/10 hover:bg-slate-900 hover:scale-105 text-white transition-all cursor-pointer"
                                title="Share to community"
                              >
                                <Share2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Text coding outputs */}
                {modelA.category === 'Coding' && (
                  <div className="flex flex-col gap-4 flex-grow">
                    {isCompareMode && modelB ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                        <div className="flex flex-col gap-2">
                          <span className="font-display text-[9px] font-black text-cyan-400 uppercase tracking-wider">{modelA.name}</span>
                          <pre className="rounded-xl bg-slate-950 p-4 border border-white/5 font-mono text-[10px] text-emerald-400 leading-relaxed overflow-x-auto min-h-[300px]">
                            {outputText}
                          </pre>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="font-display text-[9px] font-black text-blue-400 uppercase tracking-wider">{modelB.name}</span>
                          <pre className="rounded-xl bg-slate-950 p-4 border border-white/5 font-mono text-[10px] text-slate-300 leading-relaxed overflow-x-auto min-h-[300px]">
                            {outputTextB}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 flex-grow justify-between">
                        <pre className="rounded-xl bg-slate-950 p-4 border border-white/5 font-mono text-[11px] text-emerald-400 leading-relaxed overflow-x-auto min-h-[300px] flex-grow">
                          {outputText}
                        </pre>
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <button
                            onClick={() => addToast('Code copied to clipboard', 'success')}
                            className="rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 font-display text-[10px] font-bold text-slate-300 cursor-pointer"
                          >
                            Copy Code
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Reasoning outputs */}
                {modelA.category === 'Reasoning' && (
                  <div className="flex flex-col gap-4">
                    {/* Steps list */}
                    <div className="flex flex-col gap-2">
                      <span className="font-display text-[9px] font-black text-slate-500 uppercase tracking-wider">Thought Process Steps</span>
                      <div className="rounded-xl bg-white/[0.01] border border-white/5 p-4 flex flex-col gap-2">
                        {outputSteps.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {isCompareMode && modelB ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <span className="font-display text-[9px] font-black text-cyan-400">{modelA.name} (A)</span>
                          <div className="rounded-xl bg-slate-950 p-4 border border-white/5 text-xs text-slate-300 leading-relaxed">
                            {outputText}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="font-display text-[9px] font-black text-blue-400">{modelB.name} (B)</span>
                          <div className="rounded-xl bg-slate-950 p-4 border border-white/5 text-xs text-slate-300 leading-relaxed">
                            {outputTextB}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-slate-950 p-4 border border-white/5 text-xs text-slate-200 leading-relaxed">
                        {outputText}
                      </div>
                    )}
                  </div>
                )}

                {/* Audio outputs */}
                {(modelA.category === 'Audio' || modelA.category === 'Speech') && (
                  <div className="flex flex-col items-center justify-center py-12 bg-slate-950 rounded-xl border border-white/5 flex-grow">
                    <Music className="text-cyan-400 mb-4 animate-bounce" size={32} />
                    <span className="font-display text-sm font-bold text-slate-200">Synthetic Waveform Rendered</span>
                    <p className="font-sans text-xs text-slate-500 mt-1 max-w-sm text-center mb-6">
                      {outputText}
                    </p>

                    {/* Waveform graphic */}
                    <div className="flex items-center gap-1.5 h-12 w-64 mb-6">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-cyan-500/80 rounded-full"
                          style={{ height: `${20 + Math.sin(i * 0.5) * 80}%` }}
                        ></div>
                      ))}
                    </div>

                    <button
                      onClick={() => addToast('Audio file exported to desktop folder', 'success')}
                      className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display text-xs font-black px-6 py-2 cursor-pointer transition-all"
                    >
                      Export Wave Audio
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
