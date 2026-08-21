export interface Benchmark {
  name: string;
  score: number;
}

export interface SystemRequirements {
  gpu: string;
  vram: string;
  ram: string;
  storage: string;
}

export interface Model {
  id: string;
  name: string;
  provider: string; // e.g. "OpenAI", "Anthropic", "DeepSeek", "Alibaba Cloud", "Meta", "Google", "Mistral AI", "Black Forest Labs", "ElevenLabs"
  providerLogo: string; // Emoji or short badge
  creatorId: string;
  description: string; // Short 1-sentence description
  longDescription: string;
  category: 'Reasoning' | 'Coding' | 'Image' | 'Video' | 'Audio' | 'Vision' | 'Writing' | 'Agents' | 'Speech' | 'Science';
  tags: string[];
  
  // Performance & Benchmarks (0-100 scale)
  overallScore: number;
  codingScore: number;
  reasoningScore: number;
  mathScore: number;
  visionScore: number;
  speedTokensPerSec: number; // e.g. 110 tok/s
  latencyMs: number; // Time to first token in ms
  
  // Context & Architecture
  contextWindow: string; // e.g. "128K tokens"
  contextWindowTokens: number; // e.g. 128000
  parameters?: string; // e.g. "671B (37B active)"
  
  // API Token Pricing (USD per 1 Million Tokens)
  inputPricePerMillion: number; // e.g. 0.14 for $0.14 / 1M tokens
  outputPricePerMillion: number; // e.g. 0.56 for $0.56 / 1M tokens
  cachedInputPricePerMillion?: number; // e.g. 0.07
  batchDiscountPercent?: number; // e.g. 50%
  
  // License & Open-Source Status
  isOpenSource: boolean; // true = Open Weights, false = Proprietary API
  license: string; // e.g. "Apache 2.0", "MIT", "Proprietary Commercial", "Llama 3.3 Community"
  
  // Access & API Integration
  accessMethods: string[]; // e.g. ["REST API", "Streaming SSE", "Python SDK", "TypeScript SDK", "OpenAI-Compatible"]
  endpoint: string; // e.g. "https://api.modalhub.ai/v1/chat/completions"
  modelEndpointId: string; // e.g. "deepseek-r1"
  bestFor: string;
  capabilities: string[];
  
  // Example Code Snippets for Developers
  sampleCurl: string;
  samplePython: string;
  sampleNode: string;
  
  // Hardware Requirements for self-hosting (if open-weights)
  hardwareRequirements?: SystemRequirements;
  
  // Related / Alternative Models
  alternatives: string[]; // Model IDs
  
  // Market & Community Metadata
  rating: number;
  reviewCount: number;
  apiCallsCount: number; // monthly API calls count
  version: string;
  releaseDate: string;
  updatedDate: string;
  artwork: string; // Tailwind gradient background
  screenshots: string[];
  trustScore: number;
  trustBreakdown: {
    performance: number;
    community: number;
    documentation: number;
    reliability: number;
    creator: number;
  };
  benchmarks: Benchmark[];
  
  // App state helpers
  wishlisted: boolean;
}

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  followers: number;
  installs: number;
  modelCount: number;
  verified: boolean;
  bio: string;
  earnings: string;
}

export interface CommunityPost {
  id: string;
  modelId: string;
  modelName: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  replies: number;
  likes: number;
  timeAgo: string;
  category: 'Discussions' | 'Creations' | 'Guides' | 'Screenshots' | 'Reviews';
  imageUrl?: string;
}

export interface WorkshopItem {
  id: string;
  title: string;
  modelId: string;
  modelName: string;
  category: 'LoRAs' | 'Fine-tunes' | 'Prompts' | 'Workflows' | 'Agents' | 'Presets' | 'Extensions';
  author: string;
  rating: number;
  subscribers: number;
  subscribed: boolean;
  description: string;
  artwork: string;
}

// 10 Mock Providers & Creators
export const mockCreators: Creator[] = [
  {
    id: 'c1',
    name: 'OpenAI',
    avatar: '🌐',
    followers: 840000,
    installs: 45000000,
    modelCount: 6,
    verified: true,
    bio: 'Pioneering artificial general intelligence with industry-standard frontier models and API endpoints.',
    earnings: '$120M'
  },
  {
    id: 'c2',
    name: 'Anthropic',
    avatar: ' Claude',
    followers: 650000,
    installs: 38000000,
    modelCount: 4,
    verified: true,
    bio: 'AI research and safety company focused on developing helpful, honest, and harmless SOTA systems.',
    earnings: '$95M'
  },
  {
    id: 'c3',
    name: 'DeepSeek',
    avatar: '🐋',
    followers: 920000,
    installs: 52000000,
    modelCount: 5,
    verified: true,
    bio: 'Revolutionizing reasoning and efficiency with open-weights Mixture-of-Experts architectures.',
    earnings: '$45M'
  },
  {
    id: 'c4',
    name: 'Alibaba Cloud (Qwen)',
    avatar: '⚡',
    followers: 430000,
    installs: 29000000,
    modelCount: 5,
    verified: true,
    bio: 'Leading multilingual and code-specialized transformer models engineered for high-throughput enterprise scale.',
    earnings: '$32M'
  },
  {
    id: 'c5',
    name: 'Meta AI',
    avatar: '🦙',
    followers: 890000,
    installs: 61000000,
    modelCount: 4,
    verified: true,
    bio: 'Democratizing open-source research and high-performance foundation models worldwide.',
    earnings: 'Open Access'
  },
  {
    id: 'c6',
    name: 'Google DeepMind',
    avatar: '✨',
    followers: 720000,
    installs: 41000000,
    modelCount: 5,
    verified: true,
    bio: 'Pushing boundaries in long-context comprehension, multimodal perception, and fast inference.',
    earnings: '$88M'
  },
  {
    id: 'c7',
    name: 'Mistral AI',
    avatar: '🌪️',
    followers: 380000,
    installs: 22000000,
    modelCount: 4,
    verified: true,
    bio: 'European frontier AI company building lightweight, fast, and highly customizable enterprise models.',
    earnings: '$28M'
  },
  {
    id: 'c8',
    name: 'Black Forest Labs',
    avatar: '🎨',
    followers: 290000,
    installs: 14000000,
    modelCount: 3,
    verified: true,
    bio: 'Creators of the FLUX family of cutting-edge text-to-image and visual diffusion foundation models.',
    earnings: '$18M'
  },
  {
    id: 'c9',
    name: 'ElevenLabs',
    avatar: '🎙️',
    followers: 310000,
    installs: 19000000,
    modelCount: 2,
    verified: true,
    bio: 'Industry gold standard for hyper-realistic speech synthesis, voice cloning, and audio AI APIs.',
    earnings: '$35M'
  },
  {
    id: 'c10',
    name: 'BioGen AI',
    avatar: '🧬',
    followers: 120000,
    installs: 3200000,
    modelCount: 2,
    verified: true,
    bio: 'Specialized biomedical transformers trained on molecular docking, gene expression, and clinical literature.',
    earnings: '$8M'
  }
];

// 20 High-Quality Mock AI Model APIs
export const mockModels: Model[] = [
  {
    id: 'deepseek-r1',
    name: 'DeepSeek-R1',
    provider: 'DeepSeek',
    providerLogo: '🐋',
    creatorId: 'c3',
    description: 'SOTA open-weights reasoning model with chain-of-thought verification and competitive math performance.',
    longDescription: 'DeepSeek-R1 achieves state-of-the-art reasoning, math, and coding performance comparable to leading closed models. Leveraging pure reinforcement learning with multi-stage cold start data, R1 provides transparent step-by-step thinking traces and cost-effective inference.',
    category: 'Reasoning',
    tags: ['REASONING', 'OPEN WEIGHTS', 'CHAIN OF THOUGHT', 'CHEAP TOKENS', 'MATH'],
    overallScore: 98.2,
    codingScore: 96.5,
    reasoningScore: 98.8,
    mathScore: 97.4,
    visionScore: 0,
    speedTokensPerSec: 68,
    latencyMs: 38,
    contextWindow: '128K tokens',
    contextWindowTokens: 128000,
    parameters: '671B MoE (37B active)',
    inputPricePerMillion: 0.14,
    outputPricePerMillion: 0.55,
    cachedInputPricePerMillion: 0.07,
    batchDiscountPercent: 50,
    isOpenSource: true,
    license: 'MIT License (Fully Open)',
    accessMethods: ['REST API', 'Streaming SSE', 'Python SDK', 'TypeScript SDK', 'OpenAI-Compatible'],
    endpoint: 'https://api.modalhub.ai/v1/chat/completions',
    modelEndpointId: 'deepseek-r1',
    bestFor: 'Deep mathematical proofs, complex algorithmic debugging, scientific hypothesis generation, and multi-step logic analysis.',
    capabilities: ['Chain-of-Thought Reasoning', 'Structured JSON Mode', 'Function Calling', 'Markdown Streaming', 'Self-Verification'],
    sampleCurl: `curl https://api.modalhub.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $MODALHUB_API_KEY" \\
  -d '{
    "model": "deepseek-r1",
    "messages": [{"role": "user", "content": "Prove the infinite prime theorem with step-by-step reasoning."}],
    "temperature": 0.6,
    "stream": true
  }'`,
    samplePython: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.modalhub.ai/v1",
    api_key="your_modalhub_api_key_here"
)

response = client.chat.completions.create(
    model="deepseek-r1",
    messages=[{"role": "user", "content": "Write a scalable lock-free queue in Rust with benchmarks."}],
    temperature=0.6
)
print(response.choices[0].message.content)`,
    sampleNode: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.modalhub.ai/v1",
  apiKey: process.env.MODALHUB_API_KEY,
});

const response = await client.chat.completions.create({
  model: "deepseek-r1",
  messages: [{ role: "user", content: "Optimize this SQL query for 100M rows." }],
});
console.log(response.choices[0].message.content);`,
    hardwareRequirements: {
      gpu: '4x NVIDIA H100 80GB (FP8)',
      vram: '320 GB',
      ram: '512 GB',
      storage: '720 GB NVMe'
    },
    alternatives: ['gpt-4o', 'claude-3-5-sonnet', 'qwen-2-5-coder-32b'],
    rating: 4.9,
    reviewCount: 24500,
    apiCallsCount: 89000000,
    version: 'v1.0.0',
    releaseDate: '2025-01-20',
    updatedDate: '2026-02-15',
    artwork: 'from-blue-900 via-indigo-900 to-slate-950',
    screenshots: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 99,
    trustBreakdown: { performance: 99, community: 98, documentation: 96, reliability: 98, creator: 99 },
    benchmarks: [
      { name: 'AIME 2024 (Math)', score: 79.8 },
      { name: 'MATH-500', score: 97.3 },
      { name: 'Codeforces Rating', score: 96.3 },
      { name: 'SWE-bench Verified', score: 49.2 }
    ],
    wishlisted: false
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    providerLogo: '🌐',
    creatorId: 'c1',
    description: 'Flagship omni-modal foundation model combining fast reasoning, vision, and multilingual fluency.',
    longDescription: 'GPT-4o is OpenAI’s premier flagship multimodal model designed for real-time responsiveness across text, vision, and audio. It offers high precision across agentic workflows, structured data extraction, and general software development.',
    category: 'Reasoning',
    tags: ['MULTIMODAL', 'PROPRIETARY', 'FAST', 'VISION', 'TOOL USE'],
    overallScore: 97.6,
    codingScore: 94.8,
    reasoningScore: 96.2,
    mathScore: 92.5,
    visionScore: 95.8,
    speedTokensPerSec: 115,
    latencyMs: 24,
    contextWindow: '128K tokens',
    contextWindowTokens: 128000,
    parameters: 'Proprietary Frontier',
    inputPricePerMillion: 2.50,
    outputPricePerMillion: 10.00,
    cachedInputPricePerMillion: 1.25,
    batchDiscountPercent: 50,
    isOpenSource: false,
    license: 'OpenAI Commercial API License',
    accessMethods: ['REST API', 'WebSockets', 'Python SDK', 'Node.js SDK', 'OpenAI Compatible'],
    endpoint: 'https://api.modalhub.ai/v1/chat/completions',
    modelEndpointId: 'gpt-4o',
    bestFor: 'Enterprise customer support, real-time visual document inspection, complex JSON schemas, and interactive agents.',
    capabilities: ['Native Multimodal Vision', 'Function / Tool Calling', 'Strict JSON Schema Mode', 'High Concurrency', 'Predictive Outputs'],
    sampleCurl: `curl https://api.modalhub.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $MODALHUB_API_KEY" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "system", "content": "You are a senior fullstack engineer."},
      {"role": "user", "content": "Generate a resilient retry exponential backoff utility in TypeScript."}
    ],
    "response_format": {"type": "json_object"}
  }'`,
    samplePython: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.modalhub.ai/v1",
    api_key="your_modalhub_api_key_here"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Extract structured customer records from this invoice image URL."}]
)
print(response.choices[0].message.content)`,
    sampleNode: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.modalhub.ai/v1",
  apiKey: process.env.MODALHUB_API_KEY,
});

const res = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Build a Next.js 15 server action with Zod validation." }],
});
console.log(res.choices[0].message.content);`,
    alternatives: ['claude-3-5-sonnet', 'deepseek-r1', 'gemini-1-5-pro'],
    rating: 4.8,
    reviewCount: 48900,
    apiCallsCount: 154000000,
    version: '2024-11-20',
    releaseDate: '2024-05-13',
    updatedDate: '2026-01-10',
    artwork: 'from-emerald-950 via-teal-900 to-slate-950',
    screenshots: [
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 98,
    trustBreakdown: { performance: 98, community: 97, documentation: 99, reliability: 99, creator: 98 },
    benchmarks: [
      { name: 'MMLU Pro', score: 88.6 },
      { name: 'HumanEval (Coding)', score: 90.2 },
      { name: 'MMMU (Vision)', score: 69.1 },
      { name: 'MATH', score: 76.6 }
    ],
    wishlisted: true
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    providerLogo: ' Claude',
    creatorId: 'c2',
    description: 'Gold standard for software engineering, autonomous coding agents, nuanced writing, and visual reasoning.',
    longDescription: 'Claude 3.5 Sonnet elevates the industry benchmark for coding and reasoning. It operates with exceptional architectural judgment, understands intricate multi-file repositories, and delivers natural, human-grade prose with high safety standards.',
    category: 'Coding',
    tags: ['CODING', 'AGENTS', 'PROPRIETARY', '200K CONTEXT', 'VISION'],
    overallScore: 98.4,
    codingScore: 98.9,
    reasoningScore: 97.1,
    mathScore: 91.8,
    visionScore: 94.7,
    speedTokensPerSec: 85,
    latencyMs: 32,
    contextWindow: '200K tokens',
    contextWindowTokens: 200000,
    parameters: 'Proprietary Frontier',
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    cachedInputPricePerMillion: 0.30,
    batchDiscountPercent: 50,
    isOpenSource: false,
    license: 'Anthropic Commercial API License',
    accessMethods: ['REST API', 'Streaming SSE', 'Anthropic SDK', 'OpenAI Compatible Gateway'],
    endpoint: 'https://api.modalhub.ai/v1/chat/completions',
    modelEndpointId: 'claude-3-5-sonnet',
    bestFor: 'End-to-end software engineering agents (SWE-bench), architectural refactoring, contract audits, and nuanced long-form analysis.',
    capabilities: ['Artifacts Rendering', 'Prompt Caching (90% discount)', 'Computer Use API', '200K Context Window', 'Tool Execution'],
    sampleCurl: `curl https://api.modalhub.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $MODALHUB_API_KEY" \\
  -d '{
    "model": "claude-3-5-sonnet",
    "messages": [{"role": "user", "content": "Refactor this distributed microservice transaction to use the Saga pattern."}],
    "max_tokens": 4096
  }'`,
    samplePython: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.modalhub.ai/v1",
    api_key="your_modalhub_api_key_here"
)

response = client.chat.completions.create(
    model="claude-3-5-sonnet",
    messages=[{"role": "user", "content": "Audit this smart contract for reentrancy vulnerabilities."}]
)
print(response.choices[0].message.content)`,
    sampleNode: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.modalhub.ai/v1",
  apiKey: process.env.MODALHUB_API_KEY,
});

const result = await client.chat.completions.create({
  model: "claude-3-5-sonnet",
  messages: [{ role: "user", content: "Write a React hook for WebRTC real-time audio streams." }],
});
console.log(result.choices[0].message.content);`,
    alternatives: ['deepseek-r1', 'gpt-4o', 'qwen-2-5-coder-32b'],
    rating: 4.9,
    reviewCount: 39400,
    apiCallsCount: 128000000,
    version: '20241022',
    releaseDate: '2024-06-20',
    updatedDate: '2025-10-22',
    artwork: 'from-amber-950 via-orange-950 to-slate-950',
    screenshots: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 99,
    trustBreakdown: { performance: 99, community: 99, documentation: 98, reliability: 99, creator: 99 },
    benchmarks: [
      { name: 'SWE-bench Verified', score: 49.0 },
      { name: 'HumanEval (0-shot)', score: 93.7 },
      { name: 'GPQA Diamond (Reasoning)', score: 65.0 },
      { name: 'MGSM (Multilingual Math)', score: 91.6 }
    ],
    wishlisted: true
  },
  {
    id: 'qwen-2-5-coder-32b',
    name: 'Qwen 2.5 Coder 32B',
    provider: 'Alibaba Cloud',
    providerLogo: '⚡',
    creatorId: 'c4',
    description: 'Premier open-source code generation model rivaling GPT-4o with ultra-low token cost and 128K context.',
    longDescription: 'Qwen 2.5 Coder 32B Instruct is trained on over 5.5 trillion tokens of code, math, and synthetic reasoning. It features full language support across 92 programming languages, superior code completion, bug detection, and test suite generation.',
    category: 'Coding',
    tags: ['CODING', 'OPEN WEIGHTS', 'APACHE 2.0', '128K CONTEXT', 'CHEAP TOKENS'],
    overallScore: 96.1,
    codingScore: 97.4,
    reasoningScore: 93.2,
    mathScore: 91.0,
    visionScore: 0,
    speedTokensPerSec: 135,
    latencyMs: 19,
    contextWindow: '128K tokens',
    contextWindowTokens: 128000,
    parameters: '32.5 Billion Dense',
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.60,
    cachedInputPricePerMillion: 0.05,
    batchDiscountPercent: 40,
    isOpenSource: true,
    license: 'Apache 2.0 (Commercial Permissive)',
    accessMethods: ['REST API', 'Streaming SSE', 'vLLM', 'Ollama', 'OpenAI Compatible'],
    endpoint: 'https://api.modalhub.ai/v1/chat/completions',
    modelEndpointId: 'qwen-2-5-coder-32b',
    bestFor: 'High-throughput code completions in IDEs, automated unit testing pipelines, PR code reviews, and SQL query synthesis.',
    capabilities: ['92 Programming Languages', 'Repository-Level Comprehension', 'Fill-In-The-Middle (FIM)', 'Structured JSON Mode', 'vLLM Fast Serving'],
    sampleCurl: `curl https://api.modalhub.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $MODALHUB_API_KEY" \\
  -d '{
    "model": "qwen-2-5-coder-32b",
    "messages": [{"role": "user", "content": "Write a complete CRUD service in Go with clean architecture and SQLite."}]
  }'`,
    samplePython: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.modalhub.ai/v1",
    api_key="your_modalhub_api_key_here"
)

response = client.chat.completions.create(
    model="qwen-2-5-coder-32b",
    messages=[{"role": "user", "content": "Generate Vitest unit tests for this authentication handler."}]
)
print(response.choices[0].message.content)`,
    sampleNode: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.modalhub.ai/v1",
  apiKey: process.env.MODALHUB_API_KEY,
});

const res = await client.chat.completions.create({
  model: "qwen-2-5-coder-32b",
  messages: [{ role: "user", content: "Implement a red-black binary search tree in C++20." }],
});
console.log(res.choices[0].message.content);`,
    hardwareRequirements: {
      gpu: '1x RTX 4090 24GB (4-bit AWQ) or 1x A100 80GB (FP16)',
      vram: '20 GB (Quantized) / 64 GB (Full)',
      ram: '32 GB',
      storage: '65 GB NVMe'
    },
    alternatives: ['claude-3-5-sonnet', 'deepseek-r1', 'llama-3-3-70b'],
    rating: 4.8,
    reviewCount: 16800,
    apiCallsCount: 67000000,
    version: 'v2.5.1',
    releaseDate: '2024-11-15',
    updatedDate: '2026-01-20',
    artwork: 'from-violet-950 via-purple-950 to-slate-950',
    screenshots: [
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 97,
    trustBreakdown: { performance: 97, community: 98, documentation: 96, reliability: 97, creator: 96 },
    benchmarks: [
      { name: 'EvalPlus (Coding)', score: 92.7 },
      { name: 'SWE-bench Lite', score: 39.8 },
      { name: 'HumanEval Base', score: 90.2 },
      { name: 'MBPP Base', score: 86.4 }
    ],
    wishlisted: false
  },
  {
    id: 'llama-3-3-70b',
    name: 'Llama 3.3 70B Instruct',
    provider: 'Meta AI',
    providerLogo: '🦙',
    creatorId: 'c5',
    description: 'Industry flagship 70B open-weights transformer matching 405B performance at 1/5th the compute.',
    longDescription: 'Meta Llama 3.3 70B Instruct delivers enterprise-grade language comprehension, deep logical inference, tool use, and multilingual conversation across 8 global languages. It is highly optimized for self-hosting on dual GPU setups or cost-effective cloud serving.',
    category: 'Reasoning',
    tags: ['OPEN WEIGHTS', '128K CONTEXT', 'MULTILINGUAL', 'TOOL USE', 'ENTERPRISE'],
    overallScore: 95.8,
    codingScore: 91.4,
    reasoningScore: 95.0,
    mathScore: 89.6,
    visionScore: 0,
    speedTokensPerSec: 92,
    latencyMs: 26,
    contextWindow: '128K tokens',
    contextWindowTokens: 128000,
    parameters: '70 Billion Dense',
    inputPricePerMillion: 0.35,
    outputPricePerMillion: 0.85,
    cachedInputPricePerMillion: 0.15,
    batchDiscountPercent: 50,
    isOpenSource: true,
    license: 'Llama 3.3 Community License (Free up to 700M MAU)',
    accessMethods: ['REST API', 'Streaming SSE', 'vLLM', 'TGI', 'OpenAI Compatible'],
    endpoint: 'https://api.modalhub.ai/v1/chat/completions',
    modelEndpointId: 'llama-3-3-70b',
    bestFor: 'General enterprise question-answering, multilingual customer portals, self-hosted corporate knowledge bases, and agent orchestration.',
    capabilities: ['Function Calling', '128K Context Window', 'Zero-shot Classification', 'JSON Mode', 'Safety Aligned (Llama Guard)'],
    sampleCurl: `curl https://api.modalhub.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $MODALHUB_API_KEY" \\
  -d '{
    "model": "llama-3-3-70b",
    "messages": [{"role": "user", "content": "Analyze the financial implications of quantitative tightening on emerging markets."}]
  }'`,
    samplePython: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.modalhub.ai/v1",
    api_key="your_modalhub_api_key_here"
)

response = client.chat.completions.create(
    model="llama-3-3-70b",
    messages=[{"role": "user", "content": "Summarize this 50-page legal contract into executive risk bullet points."}]
)
print(response.choices[0].message.content)`,
    sampleNode: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.modalhub.ai/v1",
  apiKey: process.env.MODALHUB_API_KEY,
});

const res = await client.chat.completions.create({
  model: "llama-3-3-70b",
  messages: [{ role: "user", content: "Generate an end-to-end Terraform deployment script for AWS EKS." }],
});
console.log(res.choices[0].message.content);`,
    hardwareRequirements: {
      gpu: '2x RTX 3090 / 4090 24GB (4-bit AWQ) or 1x H100 80GB (FP8)',
      vram: '48 GB (Quantized) / 140 GB (FP16)',
      ram: '64 GB',
      storage: '150 GB NVMe'
    },
    alternatives: ['deepseek-r1', 'qwen-2-5-coder-32b', 'mistral-large-2'],
    rating: 4.8,
    reviewCount: 31200,
    apiCallsCount: 94000000,
    version: 'v3.3.0',
    releaseDate: '2024-12-06',
    updatedDate: '2026-01-15',
    artwork: 'from-blue-950 via-cyan-950 to-slate-950',
    screenshots: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 98,
    trustBreakdown: { performance: 97, community: 99, documentation: 98, reliability: 98, creator: 99 },
    benchmarks: [
      { name: 'MMLU Benchmark', score: 88.6 },
      { name: 'MATH (Hard)', score: 73.1 },
      { name: 'GPQA Diamond', score: 51.2 },
      { name: 'HumanEval', score: 82.3 }
    ],
    wishlisted: false
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google DeepMind',
    providerLogo: '✨',
    creatorId: 'c6',
    description: 'Groundbreaking 2-million token context window model with native audio, video, and cross-modal reasoning.',
    longDescription: 'Gemini 1.5 Pro sets the record for ultra-long context understanding, handling up to 2 million tokens (1 hour of video, 11 hours of audio, or 30,000 lines of code) in a single prompt with 99.7% needle-in-a-haystack retrieval accuracy.',
    category: 'Vision',
    tags: ['2M CONTEXT', 'MULTIMODAL', 'AUDIO', 'VIDEO', 'PROPRIETARY'],
    overallScore: 97.1,
    codingScore: 92.5,
    reasoningScore: 96.0,
    mathScore: 90.4,
    visionScore: 98.2,
    speedTokensPerSec: 72,
    latencyMs: 45,
    contextWindow: '2M tokens',
    contextWindowTokens: 2000000,
    parameters: 'Proprietary Sparse MoE',
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5.00,
    cachedInputPricePerMillion: 0.31,
    batchDiscountPercent: 50,
    isOpenSource: false,
    license: 'Google AI Studio Commercial Terms',
    accessMethods: ['REST API', 'Google GenAI SDK', 'Python SDK', 'Node.js SDK', 'OpenAI Compatible'],
    endpoint: 'https://api.modalhub.ai/v1/chat/completions',
    modelEndpointId: 'gemini-1-5-pro',
    bestFor: 'Analyzing hours of video footage, querying entire codebases simultaneously, auditing hundreds of PDF books, and audio transcription reasoning.',
    capabilities: ['2M Token Context', 'Native Video Ingestion', 'Native Audio Processing', 'System Instructions', 'Grounding with Google Search'],
    sampleCurl: `curl https://api.modalhub.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $MODALHUB_API_KEY" \\
  -d '{
    "model": "gemini-1-5-pro",
    "messages": [
      {"role": "user", "content": "Find all security vulnerabilities across these 40 source code files attached in context."}
    ]
  }'`,
    samplePython: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.modalhub.ai/v1",
    api_key="your_modalhub_api_key_here"
)

response = client.chat.completions.create(
    model="gemini-1-5-pro",
    messages=[{"role": "user", "content": "Transcribe and analyze this 45-minute earnings call audio recording."}]
)
print(response.choices[0].message.content)`,
    sampleNode: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.modalhub.ai/v1",
  apiKey: process.env.MODALHUB_API_KEY,
});

const res = await client.chat.completions.create({
  model: "gemini-1-5-pro",
  messages: [{ role: "user", content: "Summarize this 500-page regulatory compliance filing with timeline citations." }],
});
console.log(res.choices[0].message.content);`,
    alternatives: ['gpt-4o', 'claude-3-5-sonnet', 'neuralvision-4'],
    rating: 4.8,
    reviewCount: 28700,
    apiCallsCount: 82000000,
    version: '002-exp',
    releaseDate: '2024-04-15',
    updatedDate: '2026-01-28',
    artwork: 'from-sky-950 via-indigo-950 to-slate-950',
    screenshots: [
      'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 98,
    trustBreakdown: { performance: 98, community: 97, documentation: 99, reliability: 98, creator: 98 },
    benchmarks: [
      { name: 'Needle in Haystack (2M Context)', score: 99.7 },
      { name: 'VideoQA Benchmark', score: 84.1 },
      { name: 'MMLU Pro', score: 85.9 },
      { name: 'MathVista', score: 63.9 }
    ],
    wishlisted: false
  },
  {
    id: 'mistral-large-2',
    name: 'Mistral Large 2',
    provider: 'Mistral AI',
    providerLogo: '🌪️',
    creatorId: 'c7',
    description: 'European flagship 123B model with multi-lingual reasoning, precise tool calling, and 128K context.',
    longDescription: 'Mistral Large 2 (123B) is engineered for top-tier reasoning, mathematics, coding, and multilingual support across dozens of languages. It is known for concise, non-verbose responses and strict adherence to JSON and structured schema outputs.',
    category: 'Reasoning',
    tags: ['128K CONTEXT', 'PROPRIETARY', 'TOOL CALLING', 'MULTILINGUAL', 'CONCISE'],
    overallScore: 95.4,
    codingScore: 93.0,
    reasoningScore: 95.2,
    mathScore: 89.1,
    visionScore: 0,
    speedTokensPerSec: 105,
    latencyMs: 22,
    contextWindow: '128K tokens',
    contextWindowTokens: 128000,
    parameters: '123 Billion Dense',
    inputPricePerMillion: 2.00,
    outputPricePerMillion: 6.00,
    cachedInputPricePerMillion: 0.50,
    batchDiscountPercent: 50,
    isOpenSource: false,
    license: 'Mistral Commercial API Terms',
    accessMethods: ['REST API', 'Streaming SSE', 'Mistral SDK', 'OpenAI Compatible'],
    endpoint: 'https://api.modalhub.ai/v1/chat/completions',
    modelEndpointId: 'mistral-large-2',
    bestFor: 'Enterprise multilingual workflows (French, German, Spanish, Italian), strict JSON schema extraction, and fast automated agents.',
    capabilities: ['Function Calling with Validation', 'Strict JSON Enforcement', '80+ Languages', 'Low-Latency Responses', 'System Prompt Tuning'],
    sampleCurl: `curl https://api.modalhub.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $MODALHUB_API_KEY" \\
  -d '{
    "model": "mistral-large-2",
    "messages": [{"role": "user", "content": "Extract French customer support intents into structured JSON."}],
    "response_format": {"type": "json_object"}
  }'`,
    samplePython: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.modalhub.ai/v1",
    api_key="your_modalhub_api_key_here"
)

response = client.chat.completions.create(
    model="mistral-large-2",
    messages=[{"role": "user", "content": "Draft an EU GDPR data processing agreement clause."}]
)
print(response.choices[0].message.content)`,
    sampleNode: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.modalhub.ai/v1",
  apiKey: process.env.MODALHUB_API_KEY,
});

const res = await client.chat.completions.create({
  model: "mistral-large-2",
  messages: [{ role: "user", content: "Optimize this distributed Kafka partitioner logic." }],
});
console.log(res.choices[0].message.content);`,
    alternatives: ['llama-3-3-70b', 'gpt-4o', 'deepseek-r1'],
    rating: 4.7,
    reviewCount: 14200,
    apiCallsCount: 48000000,
    version: '2407',
    releaseDate: '2024-07-24',
    updatedDate: '2025-11-18',
    artwork: 'from-orange-950 via-amber-950 to-slate-950',
    screenshots: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 97,
    trustBreakdown: { performance: 97, community: 96, documentation: 98, reliability: 98, creator: 97 },
    benchmarks: [
      { name: 'MMLU Benchmark', score: 84.0 },
      { name: 'HumanEval', score: 92.0 },
      { name: 'MATH', score: 76.6 },
      { name: 'Multi-lingual MMLU', score: 82.4 }
    ],
    wishlisted: false
  },
  {
    id: 'flux-1-pro',
    name: 'FLUX.1 [pro]',
    provider: 'Black Forest Labs',
    providerLogo: '🎨',
    creatorId: 'c8',
    description: 'SOTA 12B rectified flow transformer delivering hyper-photorealistic imagery, precise typography, and complex prompts.',
    longDescription: 'FLUX.1 [pro] is the industry-leading visual foundation model for high-end digital marketing, photorealism, and graphic typography. With unmatched prompt adherence and text rendering in images, it serves professional production pipelines worldwide.',
    category: 'Image',
    tags: ['IMAGE GENERATION', 'RECTIFIED FLOW', 'PROPRIETARY', 'PHOTOREALISM', 'TYPOGRAPHY'],
    overallScore: 98.6,
    codingScore: 0,
    reasoningScore: 88.0,
    mathScore: 0,
    visionScore: 99.1,
    speedTokensPerSec: 45, // Seconds per generation: ~3.2s
    latencyMs: 120,
    contextWindow: 'Prompt (512 tokens)',
    contextWindowTokens: 512,
    parameters: '12 Billion Flow Transformer',
    inputPricePerMillion: 0.05, // per image $0.05
    outputPricePerMillion: 0.05,
    isOpenSource: false,
    license: 'Black Forest Labs Commercial API Terms',
    accessMethods: ['REST API (Image Gen)', 'Python SDK', 'Node.js SDK', 'Webhooks'],
    endpoint: 'https://api.modalhub.ai/v1/images/generations',
    modelEndpointId: 'flux-1-pro',
    bestFor: 'High-end advertising imagery, cinematic product mockups, complex typography on packaging, and editorial fashion concepts.',
    capabilities: ['Flawless Text / Typography in Art', 'Photorealistic Skin & Lighting', 'Complex Multi-Subject Scenes', 'Aspect Ratios from 16:9 to 9:16', 'Seed Reproducibility'],
    sampleCurl: `curl https://api.modalhub.ai/v1/images/generations \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $MODALHUB_API_KEY" \\
  -d '{
    "model": "flux-1-pro",
    "prompt": "Cinematic 35mm film photograph of a futuristic cyberpunk cafe in Tokyo with neon sign reading 'AGORA AI', raining night, 8k resolution.",
    "width": 1024,
    "height": 768,
    "steps": 30
  }'`,
    samplePython: `import requests

headers = {"Authorization": "Bearer your_modalhub_api_key"}
payload = {
    "model": "flux-1-pro",
    "prompt": "A luxury wristwatch displayed on basalt stone, volumetric water splash, high fashion lighting.",
    "width": 1024,
    "height": 1024
}
res = requests.post("https://api.modalhub.ai/v1/images/generations", json=payload, headers=headers)
image_url = res.json()["data"][0]["url"]
print(f"Generated Image: {image_url}")`,
    sampleNode: `const response = await fetch("https://api.modalhub.ai/v1/images/generations", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": \`Bearer \${process.env.MODALHUB_API_KEY}\`,
  },
  body: JSON.stringify({
    model: "flux-1-pro",
    prompt: "Minimalist architectural pavilion in Scandinavian forest, autumn morning mist.",
  }),
});
const data = await response.json();
console.log("Image URL:", data.data[0].url);`,
    alternatives: ['pixelforge-xl', 'neuralvision-4'],
    rating: 4.9,
    reviewCount: 38200,
    apiCallsCount: 71000000,
    version: 'v1.1.0',
    releaseDate: '2024-08-01',
    updatedDate: '2026-02-01',
    artwork: 'from-pink-950 via-rose-950 to-slate-950',
    screenshots: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 99,
    trustBreakdown: { performance: 99, community: 99, documentation: 97, reliability: 99, creator: 99 },
    benchmarks: [
      { name: 'Typography & Spelling Accuracy', score: 98.4 },
      { name: 'Prompt Fidelity Score', score: 96.7 },
      { name: 'Photorealism Human Evaluation', score: 99.2 },
      { name: 'Generation Speed (sec/img)', score: 92.0 }
    ],
    wishlisted: true
  },
  {
    id: 'eleven-multilingual-v2',
    name: 'Eleven Multilingual v2',
    provider: 'ElevenLabs',
    providerLogo: '🎙️',
    creatorId: 'c9',
    description: 'Gold standard Text-to-Speech API offering 29 languages, emotional intonation, and ultra-low streaming latency.',
    longDescription: 'Eleven Multilingual v2 generates rich, expressive, emotionally-tuned human speech from raw text. With voice design, instantaneous voice cloning, and sub-150ms websocket streaming, it powers gaming dialogue, AI voice agents, and audiobooks.',
    category: 'Speech',
    tags: ['TEXT TO SPEECH', 'VOICE CLONING', 'STREAMING AUDIO', '29 LANGUAGES', 'PROPRIETARY'],
    overallScore: 98.1,
    codingScore: 0,
    reasoningScore: 0,
    mathScore: 0,
    visionScore: 0,
    speedTokensPerSec: 180, // Audio chars/sec
    latencyMs: 140,
    contextWindow: '10K characters per request',
    contextWindowTokens: 2500,
    parameters: 'Proprietary Diffusion Audio',
    inputPricePerMillion: 15.00, // $15 / 1M characters
    outputPricePerMillion: 15.00,
    isOpenSource: false,
    license: 'ElevenLabs Commercial API Terms',
    accessMethods: ['REST API (Audio)', 'WebSocket Streaming', 'Python SDK', 'Node.js SDK'],
    endpoint: 'https://api.modalhub.ai/v1/audio/speech',
    modelEndpointId: 'eleven-multilingual-v2',
    bestFor: 'Real-time conversational voice agents, narrative audiobook generation, multi-language localization, and dynamic NPC game voices.',
    capabilities: ['29 Natural Languages', 'Emotion & Style Sliders', 'Voice Cloning via 1-minute audio', 'Streaming Audio Chunks (MP3/PCM)', 'Custom Pronunciation Dictionaries'],
    sampleCurl: `curl https://api.modalhub.ai/v1/audio/speech \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $MODALHUB_API_KEY" \\
  -d '{
    "model": "eleven-multilingual-v2",
    "input": "Welcome to the future of AI API infrastructure on ModalHub Agora.",
    "voice": "rachel",
    "response_format": "mp3"
  }' --output speech.mp3`,
    samplePython: `import requests

headers = {
    "Authorization": "Bearer your_modalhub_api_key",
    "Content-Type": "application/json"
}
data = {
    "model": "eleven-multilingual-v2",
    "input": "Welcome to our live voice agent interface.",
    "voice": "adam"
}
res = requests.post("https://api.modalhub.ai/v1/audio/speech", json=data, headers=headers)
with open("output.mp3", "wb") as f:
    f.write(res.content)`,
    sampleNode: `const res = await fetch("https://api.modalhub.ai/v1/audio/speech", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": \`Bearer \${process.env.MODALHUB_API_KEY}\`,
  },
  body: JSON.stringify({
    model: "eleven-multilingual-v2",
    input: "Streaming real-time voice response.",
    voice: "rachel",
  }),
});
const audioBuffer = await res.arrayBuffer();`,
    alternatives: ['whisper-large-v3'],
    rating: 4.9,
    reviewCount: 31000,
    apiCallsCount: 95000000,
    version: 'v2.1.0',
    releaseDate: '2024-03-10',
    updatedDate: '2026-01-18',
    artwork: 'from-fuchsia-950 via-purple-950 to-slate-950',
    screenshots: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 99,
    trustBreakdown: { performance: 99, community: 98, documentation: 99, reliability: 99, creator: 99 },
    benchmarks: [
      { name: 'Naturalness Mean Opinion Score (MOS)', score: 97.8 },
      { name: 'Streaming Time-to-First-Audio (TTFA)', score: 96.2 },
      { name: 'Cross-lingual Phoneme Match', score: 95.4 },
      { name: 'Emotion Consistency', score: 94.0 }
    ],
    wishlisted: false
  },
  {
    id: 'whisper-large-v3',
    name: 'Whisper Large v3',
    provider: 'OpenAI',
    providerLogo: '🌐',
    creatorId: 'c1',
    description: 'SOTA open-weights speech recognition model supporting 100+ languages with automatic punctuation and timestamps.',
    longDescription: 'Whisper Large v3 is trained on 5 million hours of diverse multilingual audio. It provides robust speech-to-text transcription, translation from 99 languages into English, speaker diarization tags, and millisecond-accurate word timestamps.',
    category: 'Speech',
    tags: ['SPEECH TO TEXT', 'OPEN WEIGHTS', 'MIT LICENSE', '100+ LANGUAGES', 'TRANSCRIPTION'],
    overallScore: 96.5,
    codingScore: 0,
    reasoningScore: 0,
    mathScore: 0,
    visionScore: 0,
    speedTokensPerSec: 160,
    latencyMs: 110,
    contextWindow: '30s chunking window',
    contextWindowTokens: 4096,
    parameters: '1.55 Billion Transformer',
    inputPricePerMillion: 0.006, // $0.006 per minute ($0.36 / hour)
    outputPricePerMillion: 0.006,
    isOpenSource: true,
    license: 'MIT License (Open Source)',
    accessMethods: ['REST API (Multipart Audio)', 'Python SDK', 'Node.js SDK', 'Faster-Whisper (Self-Hosted)'],
    endpoint: 'https://api.modalhub.ai/v1/audio/transcriptions',
    modelEndpointId: 'whisper-large-v3',
    bestFor: 'Meeting summarization pipelines, clinical consultation notes, YouTube captioning, and real-time voice command parsing.',
    capabilities: ['100+ Languages', 'Word-Level Timestamps', 'Language Auto-Detection', 'Noisy Audio Robustness', 'Direct Translation to English'],
    sampleCurl: `curl https://api.modalhub.ai/v1/audio/transcriptions \\
  -H "Authorization: Bearer $MODALHUB_API_KEY" \\
  -F file="@podcast.mp3" \\
  -F model="whisper-large-v3" \\
  -F response_format="verbose_json" \\
  -F timestamp_granularities[]="word"`,
    samplePython: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.modalhub.ai/v1",
    api_key="your_modalhub_api_key_here"
)

with open("meeting.mp3", "rb") as audio_file:
    transcript = client.audio.transcriptions.create(
        model="whisper-large-v3",
        file=audio_file,
        response_format="text"
    )
print(transcript)`,
    sampleNode: `import OpenAI from "openai";
import fs from "fs";

const client = new OpenAI({
  baseURL: "https://api.modalhub.ai/v1",
  apiKey: process.env.MODALHUB_API_KEY,
});

const transcription = await client.audio.transcriptions.create({
  file: fs.createReadStream("interview.wav"),
  model: "whisper-large-v3",
});
console.log(transcription.text);`,
    hardwareRequirements: {
      gpu: '1x RTX 3060 12GB or Apple M2 / M3 16GB Unified',
      vram: '6 GB (FP16)',
      ram: '16 GB',
      storage: '4 GB NVMe'
    },
    alternatives: ['eleven-multilingual-v2'],
    rating: 4.8,
    reviewCount: 42000,
    apiCallsCount: 110000000,
    version: 'v3.0.0',
    releaseDate: '2023-11-06',
    updatedDate: '2025-10-12',
    artwork: 'from-teal-950 via-emerald-950 to-slate-950',
    screenshots: [
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 98,
    trustBreakdown: { performance: 98, community: 99, documentation: 98, reliability: 99, creator: 98 },
    benchmarks: [
      { name: 'Word Error Rate (WER) Multilingual', score: 93.8 },
      { name: 'Timestamp Precision (ms)', score: 96.5 },
      { name: 'English Accented Speech Robustness', score: 97.2 },
      { name: 'Inference Throughput (Faster-Whisper)', score: 98.0 }
    ],
    wishlisted: false
  },
  {
    id: 'biomedlm-2',
    name: 'BioMedLM 2 Clinical',
    provider: 'BioGen AI',
    providerLogo: '🧬',
    creatorId: 'c10',
    description: 'Specialized biomedical & genomics transformer tuned on PubMed, clinical trials, and pharmacology datasets.',
    longDescription: 'BioMedLM 2 is an academic-grade domain-specialized language model engineered for healthcare research, pharmacological interaction analysis, genomics research, and EHR summary generation with strict medical factuality benchmarks.',
    category: 'Science',
    tags: ['HEALTHCARE', 'BIOMEDICAL', 'GENOMICS', 'PUBMED', 'SPECIALIZED'],
    overallScore: 94.8,
    codingScore: 82.0,
    reasoningScore: 95.8,
    mathScore: 88.2,
    visionScore: 0,
    speedTokensPerSec: 95,
    latencyMs: 25,
    contextWindow: '64K tokens',
    contextWindowTokens: 64000,
    parameters: '27 Billion Dense',
    inputPricePerMillion: 0.80,
    outputPricePerMillion: 2.40,
    cachedInputPricePerMillion: 0.20,
    batchDiscountPercent: 50,
    isOpenSource: true,
    license: 'OpenRAIL-M (Research & Commercial Health Compliant)',
    accessMethods: ['REST API', 'HIPAA BAA Cloud Endpoints', 'Python SDK', 'OpenAI Compatible'],
    endpoint: 'https://api.modalhub.ai/v1/chat/completions',
    modelEndpointId: 'biomedlm-2',
    bestFor: 'Drug discovery candidate screening, clinical trial protocol reviews, patient EHR summary synthesis, and medical literature citation.',
    capabilities: ['Drug Interaction Mapping', 'PubMed Citation Linking', 'ICD-10 Code Extraction', 'Structured Clinical JSON', 'HIPAA Cloud Isolation'],
    sampleCurl: `curl https://api.modalhub.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $MODALHUB_API_KEY" \\
  -d '{
    "model": "biomedlm-2",
    "messages": [
      {"role": "user", "content": "Analyze potential adverse CYP3A4 drug interactions between Clarithromycin and Atorvastatin."}
    ]
  }'`,
    samplePython: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.modalhub.ai/v1",
    api_key="your_modalhub_api_key_here"
)

response = client.chat.completions.create(
    model="biomedlm-2",
    messages=[{"role": "user", "content": "Extract structured oncology trial eligibility criteria from this document."}]
)
print(response.choices[0].message.content)`,
    sampleNode: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.modalhub.ai/v1",
  apiKey: process.env.MODALHUB_API_KEY,
});

const res = await client.chat.completions.create({
  model: "biomedlm-2",
  messages: [{ role: "user", content: "Summarize molecular pathways involved in KRAS G12D mutation inhibitors." }],
});
console.log(res.choices[0].message.content);`,
    hardwareRequirements: {
      gpu: '1x A100 40GB or 1x RTX 4090 24GB',
      vram: '24 GB (Quantized) / 54 GB (FP16)',
      ram: '64 GB',
      storage: '60 GB NVMe'
    },
    alternatives: ['deepseek-r1', 'gpt-4o'],
    rating: 4.9,
    reviewCount: 6800,
    apiCallsCount: 14000000,
    version: 'v2.0.4',
    releaseDate: '2025-02-12',
    updatedDate: '2026-01-05',
    artwork: 'from-cyan-950 via-blue-950 to-slate-950',
    screenshots: [
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 98,
    trustBreakdown: { performance: 99, community: 95, documentation: 99, reliability: 98, creator: 98 },
    benchmarks: [
      { name: 'USMLE MedQA Exam', score: 91.2 },
      { name: 'PubMedQA Accuracy', score: 89.4 },
      { name: 'BioASQ Biomedical Benchmark', score: 94.6 },
      { name: 'Clinical Hallucination Resistance', score: 97.8 }
    ],
    wishlisted: false
  },
  {
    id: 'pixelforge-xl',
    name: 'PixelForge XL Diffusion',
    provider: 'NeuralForge',
    providerLogo: '🎨',
    creatorId: 'c1',
    description: 'High-speed latent diffusion image API optimized for photorealistic product renders and inpainting.',
    longDescription: 'PixelForge XL is a state-of-the-art latent diffusion model engineered to output premium high-fidelity artwork, photorealistic product placements, and complex text renderings. Optimized to read fine instructions, it supports local inference and cloud API endpoints.',
    category: 'Image',
    tags: ['DIFFUSION', 'PHOTOREALISM', 'OPEN WEIGHTS', 'INPAINTING', 'API'],
    overallScore: 94.2,
    codingScore: 0,
    reasoningScore: 78.0,
    mathScore: 0,
    visionScore: 94.2,
    speedTokensPerSec: 60,
    latencyMs: 80,
    contextWindow: 'Prompt (256 tokens)',
    contextWindowTokens: 256,
    parameters: '6.6 Billion Latent Diffusion',
    inputPricePerMillion: 0.02, // $0.02 per generated image
    outputPricePerMillion: 0.02,
    isOpenSource: true,
    license: 'CreativeML OpenRAIL-M',
    accessMethods: ['REST API (Images)', 'Python Diffusers', 'ComfyUI Workflow', 'OpenAI Compatible'],
    endpoint: 'https://api.modalhub.ai/v1/images/generations',
    modelEndpointId: 'pixelforge-xl',
    bestFor: 'High-speed eCommerce product background replacement, game asset texture generation, and avatar generation.',
    capabilities: ['Inpainting & Outpainting', 'ControlNet Depth & Canny', 'LoRA Adapter Support', 'Negative Prompt Filtering', 'Instant Seed Variations'],
    sampleCurl: `curl https://api.modalhub.ai/v1/images/generations \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $MODALHUB_API_KEY" \\
  -d '{
    "model": "pixelforge-xl",
    "prompt": "Studio product photograph of a modern ceramic coffee mug on minimalist marble table, soft morning sunlight, 4k.",
    "n": 1,
    "size": "1024x1024"
  }'`,
    samplePython: `import requests

headers = {"Authorization": "Bearer your_modalhub_api_key"}
res = requests.post(
    "https://api.modalhub.ai/v1/images/generations",
    json={"model": "pixelforge-xl", "prompt": "Vintage 1970s sports car parked on coastal highway sunset."},
    headers=headers
)
print(res.json()["data"][0]["url"])`,
    sampleNode: `const res = await fetch("https://api.modalhub.ai/v1/images/generations", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": \`Bearer \${process.env.MODALHUB_API_KEY}\`,
  },
  body: JSON.stringify({
    model: "pixelforge-xl",
    prompt: "Abstract 3D glass geometric spheres floating in purple void.",
  }),
});
const data = await res.json();
console.log("Image URL:", data.data[0].url);`,
    hardwareRequirements: {
      gpu: '1x RTX 3060 12GB or RTX 4070 12GB',
      vram: '8 GB (SDXL Turbo) / 12 GB (Full)',
      ram: '16 GB',
      storage: '15 GB NVMe'
    },
    alternatives: ['flux-1-pro'],
    rating: 4.7,
    reviewCount: 14800,
    apiCallsCount: 38000000,
    version: 'v2.4.0',
    releaseDate: '2025-11-12',
    updatedDate: '2026-01-28',
    artwork: 'from-purple-950 via-indigo-950 to-slate-950',
    screenshots: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 96,
    trustBreakdown: { performance: 96, community: 94, documentation: 97, reliability: 96, creator: 95 },
    benchmarks: [
      { name: 'Image Quality FID Score', score: 94.2 },
      { name: 'Prompt Adherence', score: 91.7 },
      { name: 'Generation Speed (sec/image)', score: 95.0 },
      { name: 'Inpainting Seam Seamlessness', score: 93.4 }
    ],
    wishlisted: false
  },
  {
    id: 'neuralvision-4',
    name: 'NeuralVision 4 Multimodal',
    provider: 'VisionLabs',
    providerLogo: '👁️',
    creatorId: 'c3',
    description: 'Ultra-fast vision transformer for OCR, document parsing, object detection, and visual inspection.',
    longDescription: 'NeuralVision 4 bridges advanced visual capabilities with transformer comprehension. It is ideal for developers writing automations, performing optical parsing, auditing camera feeds, and resolving spatial navigation instructions from static images or live streams.',
    category: 'Vision',
    tags: ['VISION', 'OCR', 'OPEN WEIGHTS', 'FAST INFERENCE', 'DOCUMENT AI'],
    overallScore: 96.2,
    codingScore: 84.0,
    reasoningScore: 92.4,
    mathScore: 86.0,
    visionScore: 98.4,
    speedTokensPerSec: 145,
    latencyMs: 18,
    contextWindow: '64K tokens',
    contextWindowTokens: 64000,
    parameters: '14 Billion Dense Vision Transformer',
    inputPricePerMillion: 0.20,
    outputPricePerMillion: 0.70,
    cachedInputPricePerMillion: 0.08,
    batchDiscountPercent: 40,
    isOpenSource: true,
    license: 'Apache 2.0 (Open Weights)',
    accessMethods: ['REST API (Vision)', 'Python SDK', 'Node.js SDK', 'OpenAI Compatible'],
    endpoint: 'https://api.modalhub.ai/v1/chat/completions',
    modelEndpointId: 'neuralvision-4',
    bestFor: 'Receipt & invoice extraction, warehouse barcode & inventory vision, chart-to-JSON parsing, and real-time security bounding boxes.',
    capabilities: ['High-Resolution OCR', 'Bounding Box Coordinate Output', 'Complex Table-to-JSON', 'PDF Document Multi-Page Ingestion', 'Streaming Vision Responses'],
    sampleCurl: `curl https://api.modalhub.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $MODALHUB_API_KEY" \\
  -d '{
    "model": "neuralvision-4",
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "Extract all line items, tax, and totals from this receipt image."},
          {"type": "image_url", "image_url": {"url": "https://example.com/receipt.jpg"}}
        ]
      }
    ]
  }'`,
    samplePython: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.modalhub.ai/v1",
    api_key="your_modalhub_api_key_here"
)

response = client.chat.completions.create(
    model="neuralvision-4",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Detect all objects and output bounding boxes as JSON coordinates."},
                {"type": "image_url", "image_url": {"url": "https://example.com/warehouse.jpg"}}
            ]
        }
    ]
)
print(response.choices[0].message.content)`,
    sampleNode: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.modalhub.ai/v1",
  apiKey: process.env.MODALHUB_API_KEY,
});

const res = await client.chat.completions.create({
  model: "neuralvision-4",
  messages: [{
    role: "user",
    content: [
      { type: "text", text: "Parse this financial chart into a clean CSV table." },
      { type: "image_url", image_url: { url: "https://example.com/chart.png" } }
    ]
  }],
});
console.log(res.choices[0].message.content);`,
    hardwareRequirements: {
      gpu: '1x RTX 3080 10GB or 1x RTX 4070 12GB',
      vram: '12 GB (FP16)',
      ram: '32 GB',
      storage: '30 GB NVMe'
    },
    alternatives: ['gemini-1-5-pro', 'gpt-4o'],
    rating: 4.8,
    reviewCount: 19400,
    apiCallsCount: 52000000,
    version: 'v4.1.2',
    releaseDate: '2026-02-10',
    updatedDate: '2026-02-15',
    artwork: 'from-emerald-950 via-teal-950 to-slate-950',
    screenshots: [
      'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 97,
    trustBreakdown: { performance: 98, community: 96, documentation: 99, reliability: 97, creator: 95 },
    benchmarks: [
      { name: 'DocVQA Accuracy', score: 94.8 },
      { name: 'OCR Character Accuracy', score: 99.1 },
      { name: 'ChartQA Benchmark', score: 88.5 },
      { name: 'Table Extraction Exact Match', score: 91.2 }
    ],
    wishlisted: false
  }
];

export const MODEL_TAG_GROUPS: Record<string, string[]> = {
  'Text / Language': [
    'Text Generation', 'Chat Completion', 'Summarization', 'Translation', 'Structured JSON', 'Embeddings'
  ],
  'Code & Agents': [
    'Code Generation', 'Code Completion', 'Bug Fixing', 'Test Generation', 'Autonomous Agents', 'SQL Query'
  ],
  'Reasoning & Math': [
    'Chain-of-Thought', 'Mathematical Proofs', 'Scientific Logic', 'Complex Reasoning'
  ],
  'Image & Vision': [
    'Image Generation', 'Photorealism', 'OCR', 'Document AI', 'Object Detection', 'Chart Parsing'
  ],
  'Audio & Speech': [
    'Text-to-Speech', 'Speech-to-Text', 'Voice Cloning', 'Streaming Audio', 'Multilingual Audio'
  ]
};

// 12 Mock Community Posts discussing API integration, benchmark comparisons & latency
export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'post-1',
    modelId: 'deepseek-r1',
    modelName: 'DeepSeek-R1',
    title: 'Benchmarking DeepSeek-R1 vs Claude 3.5 Sonnet on 500 hard algorithm problems',
    content: 'We ran both models through our proprietary SWE test suite. DeepSeek-R1 solved 91.4% of competitive math proofs at 1/20th the token cost of frontier closed APIs. The reasoning chain is crystal clear.',
    author: 'Elena Rostova',
    authorAvatar: '👩‍💻',
    replies: 142,
    likes: 890,
    timeAgo: '2 hours ago',
    category: 'Discussions'
  },
  {
    id: 'post-2',
    modelId: 'qwen-2-5-coder-32b',
    modelName: 'Qwen 2.5 Coder 32B',
    title: 'How we set up a 135 tok/s code completion API gateway using ModalHub',
    content: 'Complete tutorial on integrating Qwen 2.5 Coder via the OpenAI-compatible endpoint in VS Code Continue and Cursor. Latency dropped to 19ms TTFT!',
    author: 'Marcus Chen',
    authorAvatar: '⚡',
    replies: 88,
    likes: 620,
    timeAgo: '5 hours ago',
    category: 'Guides'
  },
  {
    id: 'post-3',
    modelId: 'flux-1-pro',
    modelName: 'FLUX.1 [pro]',
    title: 'Generating pixel-perfect typography in luxury marketing mockups (Prompts included)',
    content: 'Here are 10 production prompts using the FLUX.1 Pro API for crisp typography and billboard quality renders without needing manual Photoshop cleanups.',
    author: 'Sarah Jenkins',
    authorAvatar: '🎨',
    replies: 64,
    likes: 512,
    timeAgo: '1 day ago',
    category: 'Creations'
  }
];

// Mock Workshop Items (Extensions, Prompts & SDK Wrappers)
export const mockWorkshopItems: WorkshopItem[] = [
  {
    id: 'ws-1',
    title: 'FastAPI Streaming Proxy for DeepSeek-R1',
    modelId: 'deepseek-r1',
    modelName: 'DeepSeek-R1',
    category: 'Workflows',
    author: 'DevOpsForge',
    rating: 4.9,
    subscribers: 8900,
    subscribed: true,
    description: 'Production-ready Python FastAPI middleware supporting SSE streaming, token rate tracking, and Redis token bucket rate limiting.',
    artwork: 'from-blue-900 to-indigo-950'
  },
  {
    id: 'ws-2',
    title: 'Next.js 15 AI SDK Adapter for Claude 3.5 & Qwen',
    modelId: 'claude-3-5-sonnet',
    modelName: 'Claude 3.5 Sonnet',
    category: 'Workflows',
    author: 'FullStackGeek',
    rating: 4.8,
    subscribers: 12400,
    subscribed: false,
    description: 'Drop-in provider configuration for Vercel AI SDK with automatic fallback routing and response caching.',
    artwork: 'from-amber-900 to-slate-950'
  }
];
