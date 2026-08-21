import React from 'react';

interface ModelTagsProps {
  tags: string[];
  limit?: number;
  className?: string;
}

export const ModelTags: React.FC<ModelTagsProps> = ({ tags, limit, className = '' }) => {
  const visibleTags = limit ? tags.slice(0, limit) : tags;
  const remainingCount = Math.max(0, tags.length - visibleTags.length);

  if (tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {visibleTags.map((tag) => (
        <span
          key={tag}
          className="rounded border border-cyan-400/15 bg-cyan-400/5 px-1.5 py-0.5 font-sans text-[9px] font-medium text-cyan-300/80"
        >
          {tag}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-sans text-[9px] font-medium text-slate-500">
          +{remainingCount}
        </span>
      )}
    </div>
  );
};