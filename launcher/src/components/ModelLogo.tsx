import React from 'react';

interface ModelLogoProps {
  logo?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ModelLogo: React.FC<ModelLogoProps> = ({ logo, name, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs rounded-md',
    md: 'w-10 h-10 text-lg rounded-xl',
    lg: 'w-14 h-14 text-2xl rounded-2xl',
  };

  const getFallbackEmoji = (modelName: string): string => {
    const lower = modelName.toLowerCase();
    if (lower.includes('deepseek')) return '🐋';
    if (lower.includes('qwen')) return '👑';
    if (lower.includes('llama') || lower.includes('meta')) return '🦙';
    if (lower.includes('mistral')) return '🌪️';
    if (lower.includes('claude') || lower.includes('anthropic')) return '🎭';
    if (lower.includes('gpt') || lower.includes('openai')) return '✨';
    if (lower.includes('flux') || lower.includes('image')) return '🎨';
    if (lower.includes('whisper') || lower.includes('audio') || lower.includes('speech')) return '🎙️';
    if (lower.includes('code') || lower.includes('coder')) return '💻';
    return '🧠';
  };

  const displayLogo = logo || getFallbackEmoji(name);

  return (
    <div
      className={`flex items-center justify-center font-bold shrink-0 bg-slate-800/90 border border-white/10 text-white shadow-inner ${sizeClasses[size]}`}
    >
      <span>{displayLogo}</span>
    </div>
  );
};
