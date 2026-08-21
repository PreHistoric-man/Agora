import React from 'react';
import {
  Brain,
  Code,
  Image as ImageIcon,
  Mic,
  Eye,
  Sparkles,
  Bot,
  Layers,
  Globe,
  Dna,
  Zap,
  Cpu,
  Boxes,
  Waves
} from 'lucide-react';

interface ModelLogoProps {
  modelId?: string;
  provider?: string;
  category?: string;
  className?: string;
  size?: number;
}

export const ModelLogo: React.FC<ModelLogoProps> = ({
  modelId = '',
  provider = '',
  category = '',
  className = '',
  size = 18
}) => {
  const p = (provider || '').toLowerCase();
  const id = (modelId || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  // Distinct clean geometric SVG vector icon badges based on model or provider
  if (id.includes('deepseek')) {
    return (
      <span className={`inline-flex items-center justify-center text-cyan-400 ${className}`}>
        <Brain size={size} strokeWidth={2.2} />
      </span>
    );
  }

  if (p.includes('openai') || id.includes('gpt') || id.includes('whisper') || id.includes('o1') || id.includes('o3')) {
    return (
      <span className={`inline-flex items-center justify-center text-emerald-400 ${className}`}>
        <Bot size={size} strokeWidth={2.2} />
      </span>
    );
  }

  if (p.includes('anthropic') || id.includes('claude')) {
    return (
      <span className={`inline-flex items-center justify-center text-amber-400 ${className}`}>
        <Sparkles size={size} strokeWidth={2.2} />
      </span>
    );
  }

  if (p.includes('alibaba') || id.includes('qwen')) {
    return (
      <span className={`inline-flex items-center justify-center text-purple-400 ${className}`}>
        <Zap size={size} strokeWidth={2.2} />
      </span>
    );
  }

  if (p.includes('meta') || id.includes('llama')) {
    return (
      <span className={`inline-flex items-center justify-center text-blue-400 ${className}`}>
        <Cpu size={size} strokeWidth={2.2} />
      </span>
    );
  }

  if (p.includes('google') || id.includes('gemini')) {
    return (
      <span className={`inline-flex items-center justify-center text-sky-400 ${className}`}>
        <Globe size={size} strokeWidth={2.2} />
      </span>
    );
  }

  if (p.includes('mistral')) {
    return (
      <span className={`inline-flex items-center justify-center text-orange-400 ${className}`}>
        <Waves size={size} strokeWidth={2.2} />
      </span>
    );
  }

  if (p.includes('black forest') || id.includes('flux')) {
    return (
      <span className={`inline-flex items-center justify-center text-rose-400 ${className}`}>
        <ImageIcon size={size} strokeWidth={2.2} />
      </span>
    );
  }

  if (p.includes('elevenlabs') || id.includes('eleven')) {
    return (
      <span className={`inline-flex items-center justify-center text-fuchsia-400 ${className}`}>
        <Mic size={size} strokeWidth={2.2} />
      </span>
    );
  }

  if (p.includes('biogen') || id.includes('biomed')) {
    return (
      <span className={`inline-flex items-center justify-center text-teal-400 ${className}`}>
        <Dna size={size} strokeWidth={2.2} />
      </span>
    );
  }

  if (id.includes('pixelforge')) {
    return (
      <span className={`inline-flex items-center justify-center text-pink-400 ${className}`}>
        <Boxes size={size} strokeWidth={2.2} />
      </span>
    );
  }

  if (id.includes('neuralvision') || cat.includes('vision')) {
    return (
      <span className={`inline-flex items-center justify-center text-teal-400 ${className}`}>
        <Eye size={size} strokeWidth={2.2} />
      </span>
    );
  }

  // Fallback by category
  if (cat.includes('coding') || cat.includes('code')) {
    return (
      <span className={`inline-flex items-center justify-center text-indigo-400 ${className}`}>
        <Code size={size} strokeWidth={2.2} />
      </span>
    );
  }

  if (cat.includes('reasoning')) {
    return (
      <span className={`inline-flex items-center justify-center text-cyan-400 ${className}`}>
        <Brain size={size} strokeWidth={2.2} />
      </span>
    );
  }

  if (cat.includes('image')) {
    return (
      <span className={`inline-flex items-center justify-center text-rose-400 ${className}`}>
        <ImageIcon size={size} strokeWidth={2.2} />
      </span>
    );
  }

  if (cat.includes('speech') || cat.includes('audio')) {
    return (
      <span className={`inline-flex items-center justify-center text-purple-400 ${className}`}>
        <Mic size={size} strokeWidth={2.2} />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center justify-center text-cyan-400 ${className}`}>
      <Layers size={size} strokeWidth={2.2} />
    </span>
  );
};
