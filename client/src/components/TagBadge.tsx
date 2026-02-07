/**
 * TagBadge - Etiquetas personalizadas para leads
 * Cores conforme solicitado pelo cliente
 */

import type { LeadTag } from '@/types';

interface TagBadgeProps {
  tag: LeadTag;
  size?: 'sm' | 'md';
}

const tagConfig: Record<LeadTag, { label: string; bgColor: string; textColor: string }> = {
  orcamento: {
    label: 'Orçamento',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  venda_fechada: {
    label: 'Venda Fechada',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  amsterda: {
    label: 'Amsterdã',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
  },
  royale: {
    label: 'Royale',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
  },
};

export function TagBadge({ tag, size = 'sm' }: TagBadgeProps) {
  const config = tagConfig[tag];
  if (!config) return null;

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}

export function TagSelector({
  selectedTags,
  onChange,
}: {
  selectedTags: LeadTag[];
  onChange: (tags: LeadTag[]) => void;
}) {
  const allTags: LeadTag[] = ['orcamento', 'venda_fechada', 'amsterda', 'royale'];

  const toggleTag = (tag: LeadTag) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {allTags.map((tag) => {
        const config = tagConfig[tag];
        const isSelected = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={`inline-flex items-center rounded-full text-sm px-3 py-1 font-medium transition-all ${
              isSelected
                ? `${config.bgColor} ${config.textColor} ring-2 ring-offset-1 ring-current`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
