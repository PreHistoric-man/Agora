import type { Model } from '../types';

export interface ModelRuntimeCompatibility {
  supported: boolean;
  runtime: 'ollama' | 'demo' | 'modal' | 'hosted' | 'none';
  ollamaTag: string;
  recommendedTag: string;
  availableTags: string[];
  reason?: string;
  defaultVramRequirement?: string;
  defaultRamRequirement?: string;
}

// Helper to test if a model is deployed on Modal Serverless
export function isModalModel(model?: Model | null): boolean {
  if (!model) return false;
  const runtime = (model.runtime || '').toLowerCase();
  const provider = (model.provider || '').toLowerCase();
  const endpoint = (model.endpoint || '').toLowerCase();
  const tags = (model.tags || []).map((t) => t.toLowerCase());
  return (
    runtime === 'modal' ||
    provider.includes('modal') ||
    endpoint.includes('modal.run') ||
    tags.includes('modal') ||
    tags.includes('serverless')
  );
}

// Known mappings for Agora models to Ollama model tags
const OLLAMA_MODEL_TAG_MAP: Record<
  string,
  {
    tag: string;
    availableTags: string[];
    vram?: string;
    ram?: string;
  }
> = {
  'deepseek-r1': {
    tag: 'deepseek-r1:8b',
    availableTags: ['deepseek-r1:1.5b', 'deepseek-r1:7b', 'deepseek-r1:8b', 'deepseek-r1:14b', 'deepseek-r1:32b', 'deepseek-r1:70b'],
    vram: '6 GB',
    ram: '16 GB'
  },
  'qwen-2-5-coder-7b': {
    tag: 'qwen2.5-coder:7b',
    availableTags: ['qwen2.5-coder:1.5b', 'qwen2.5-coder:7b', 'qwen2.5-coder:14b'],
    vram: '5 GB',
    ram: '16 GB'
  },
  'qwen-2-5-coder-32b': {
    tag: 'qwen2.5-coder:32b',
    availableTags: ['qwen2.5-coder:7b', 'qwen2.5-coder:14b', 'qwen2.5-coder:32b'],
    vram: '20 GB',
    ram: '32 GB'
  },
  'llama-3-3-70b': {
    tag: 'llama3.3:70b',
    availableTags: ['llama3.3:70b', 'llama3.1:8b'],
    vram: '40 GB',
    ram: '64 GB'
  },
  'llama-3-2-3b': {
    tag: 'llama3.2:3b',
    availableTags: ['llama3.2:1b', 'llama3.2:3b'],
    vram: '2.5 GB',
    ram: '8 GB'
  },
  'mistral-nemo': {
    tag: 'mistral-nemo:12b',
    availableTags: ['mistral-nemo:12b', 'mistral:7b'],
    vram: '8 GB',
    ram: '16 GB'
  },
  'deepseek-v3': {
    tag: 'deepseek-v3',
    availableTags: ['deepseek-v3', 'deepseek-r1:8b'],
    vram: '32 GB',
    ram: '64 GB'
  },
  'phi-4': {
    tag: 'phi4:14b',
    availableTags: ['phi4:14b', 'phi3.5:3.8b'],
    vram: '10 GB',
    ram: '16 GB'
  },
  'gemma-2-9b': {
    tag: 'gemma2:9b',
    availableTags: ['gemma2:2b', 'gemma2:9b', 'gemma2:27b'],
    vram: '6 GB',
    ram: '16 GB'
  }
};

/**
 * Determines whether a given Agora Model can be run locally via Ollama.
 * Prioritizes the `runtime_model_id` field defined in the model schema/database.
 */
export function resolveModelRuntime(model?: Model | null): ModelRuntimeCompatibility {
  if (!model) {
    return {
      supported: false,
      runtime: 'none',
      ollamaTag: '',
      recommendedTag: '',
      availableTags: [],
      reason: 'No model specified'
    };
  }

  // 0. Demo runtime model (Hackathon Demo Mode)
  if (model.id === 'qwen3-demo' || model.runtime === 'demo' || model.runtime_model_id === 'qwen3-demo') {
    return {
      supported: true,
      runtime: 'demo',
      ollamaTag: 'qwen3-demo',
      recommendedTag: 'qwen3-demo',
      availableTags: ['qwen3-demo'],
      defaultVramRequirement: '500 MB',
      defaultRamRequirement: '1 GB'
    };
  }

  // 1. Direct runtime_model_id from model database schema (Highest Priority)
  const runtimeModelId = (model.runtime_model_id || model.runtimeModelId || '').trim();
  if (runtimeModelId) {
    return {
      supported: true,
      runtime: 'ollama',
      ollamaTag: runtimeModelId,
      recommendedTag: runtimeModelId,
      availableTags: [runtimeModelId],
      defaultVramRequirement: '4 GB',
      defaultRamRequirement: '8 GB'
    };
  }

  // 2. If runtime explicitly marked as ollama without specific tag
  if (model.runtime?.toLowerCase() === 'ollama') {
    const defaultTag = model.modelEndpointId || model.id;
    return {
      supported: true,
      runtime: 'ollama',
      ollamaTag: defaultTag,
      recommendedTag: defaultTag,
      availableTags: [defaultTag],
      defaultVramRequirement: '6 GB',
      defaultRamRequirement: '16 GB'
    };
  }

  // 3. Check explicit map
  const mapped = OLLAMA_MODEL_TAG_MAP[model.id];
  if (mapped) {
    return {
      supported: true,
      runtime: 'ollama',
      ollamaTag: mapped.tag,
      recommendedTag: mapped.tag,
      availableTags: mapped.availableTags,
      defaultVramRequirement: mapped.vram,
      defaultRamRequirement: mapped.ram
    };
  }

  // 4. If model specifies open-source or open weights
  if (model.isOpenSource || model.tags?.some((t) => t.toUpperCase().includes('OPEN WEIGHT') || t.toUpperCase().includes('OPEN-SOURCE'))) {
    // Generate clean tag slug
    const cleanTag = model.id
      .toLowerCase()
      .replace(/-3-3-/, '3.3:')
      .replace(/-3-2-/, '3.2:')
      .replace(/-2-5-/, '2.5:')
      .replace(/-v/, ':v');

    const formattedTag = cleanTag.includes(':') ? cleanTag : `${cleanTag}:latest`;

    return {
      supported: true,
      runtime: 'ollama',
      ollamaTag: formattedTag,
      recommendedTag: formattedTag,
      availableTags: [formattedTag],
      defaultVramRequirement: '8 GB',
      defaultRamRequirement: '16 GB'
    };
  }

  // 5. Check if it is a Modal Serverless Model
  if (isModalModel(model)) {
    return {
      supported: false,
      runtime: 'modal',
      ollamaTag: '',
      recommendedTag: '',
      availableTags: [],
      reason: 'This model is hosted on Modal Serverless infrastructure. Run in Cloud Playground or call via REST / Python API.'
    };
  }

  // 6. Proprietary / Closed API models (e.g. OpenAI, Anthropic hosted models)
  return {
    supported: false,
    runtime: 'hosted',
    ollamaTag: '',
    recommendedTag: '',
    availableTags: [],
    reason: `This model runs as a hosted API service (${model.provider}).`
  };
}

/**
 * Format raw byte size into human-readable string (e.g. 4.72 GB)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
