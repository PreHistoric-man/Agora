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
  creatorId: string;
  description: string;
  longDescription: string;
  category: 'Reasoning' | 'Coding' | 'Image' | 'Video' | 'Audio' | 'Vision' | 'Writing' | 'Agents' | 'Speech' | 'Science';
  tags: string[];
  rating: number;
  reviewCount: number;
  installCount: number;
  price: number; // in INR, 0 means Free/Dynamic depending on pricingType
  originalPrice?: number; // Price before discount
  discountPercent?: number; // e.g. 40, 50, 60
  discountEndsIn?: string; // e.g. "18h 42m", "Ends in 2d"
  isDiscounted?: boolean;
  discountBadge?: string; // e.g. "Flash Deal - 40% OFF"
  pricingType: 'free' | 'cloud-only' | 'local-free-cloud-paid' | 'paid' | 'subscription';
  pricingDetails: {
    local: string;
    cloud: string;
    pro?: string;
  };
  version: string;
  releaseDate: string;
  updatedDate: string;
  artwork: string; // Tailwind gradient background name or mock image path
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
  systemRequirements: {
    minimum: SystemRequirements;
    recommended: SystemRequirements;
  };
  installed: boolean;
  owned?: boolean;
  wishlisted: boolean;
  sizeOnDisk: string; // e.g. "12.8 GB"
  hardwareStatus?: string; // e.g., "Ready"
}

export const MODEL_TAG_GROUPS: Record<string, string[]> = {
  'Text / Language': [
    'Text Generation', 'Text Classification', 'Token Classification', 'Question Answering',
    'Summarization', 'Translation', 'Fill Mask', 'Zero-Shot Classification',
    'Sentence Similarity', 'Feature Extraction', 'Text-to-Text Generation', 'Chat Completion', 'Ranking'
  ],
  'Image / Computer Vision': [
    'Image Classification', 'Image Segmentation', 'Object Detection', 'Image-to-Image',
    'Image-to-Text', 'Text-to-Image', 'Zero-Shot Image Classification', 'Zero-Shot Object Detection'
  ],
  Video: ['Text-to-Video', 'Image-to-Video', 'Video Classification', 'Video-to-Text'],
  'Audio / Speech': [
    'Audio Classification', 'Automatic Speech Recognition', 'Text-to-Speech', 'Audio-to-Audio',
    'Text-to-Audio', 'Audio-to-Text', 'Zero-Shot Audio Classification'
  ],
  Multimodal: [
    'Image-Text-to-Text', 'Visual Question Answering', 'Document Question Answering',
    'Any-to-Any', 'Image-Text-to-Image'
  ],
  Tabular: ['Tabular Classification', 'Tabular Regression'],
  'Embeddings / Retrieval': ['Feature Extraction', 'Sentence Similarity', 'Ranking'],
  'Specialized NLP': [
    'Language Modeling', 'Masked Language Modeling', 'Question Answering', 'Conversational', 'Text2Text Generation'
  ],
  'Generative / Creative': [
    'Text-to-Image', 'Text-to-Video', 'Text-to-Speech', 'Text-to-Audio',
    'Image-to-Image', 'Image-to-Video', 'Audio-to-Audio'
  ],
  'Other / Specialized': [
    'Reinforcement Learning', 'Graph Machine Learning', 'Robotics', 'Time Series',
    'Geospatial', 'Tabular'
  ]
};

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  followers: number;
  installs: number;
  modelCount: number;
  verified: boolean;
  bio: string;
  earnings: string; // in INR format, e.g. "₹8.4L"
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

// 10 Mock Creators
export const mockCreators: Creator[] = [
  {
    id: 'c1',
    name: 'NeuralForge',
    avatar: '🎨',
    followers: 42300,
    installs: 1200000,
    modelCount: 4,
    verified: true,
    bio: 'Building open and accessible AI tools for digital artists, creators, and visual professionals.',
    earnings: '₹8.4L'
  },
  {
    id: 'c2',
    name: 'CodeSmiths',
    avatar: '💻',
    followers: 89000,
    installs: 2100000,
    modelCount: 3,
    verified: true,
    bio: 'Pioneering local-first, highly-optimized developer models that run efficiently on consumer GPUs.',
    earnings: '₹14.2L'
  },
  {
    id: 'c3',
    name: 'VisionLabs',
    avatar: '👁️',
    followers: 51000,
    installs: 780000,
    modelCount: 2,
    verified: true,
    bio: 'Next-generation multimodal reasoning and complex spatial-visual recognition networks.',
    earnings: '₹5.6L'
  },
  {
    id: 'c4',
    name: 'DeepMindset',
    avatar: '🧠',
    followers: 120000,
    installs: 1800000,
    modelCount: 3,
    verified: true,
    bio: 'SOTA reasoning, logical extraction, and advanced mathematics orchestration systems.',
    earnings: '₹22.5L'
  },
  {
    id: 'c5',
    name: 'SynthAudio',
    avatar: '🎵',
    followers: 28000,
    installs: 450000,
    modelCount: 3,
    verified: false,
    bio: 'Generative musicianship, synthetic ambient design, and hyper-realistic multi-instrument output.',
    earnings: '₹2.1L'
  },
  {
    id: 'c6',
    name: 'Speechify',
    avatar: '🔊',
    followers: 34000,
    installs: 640000,
    modelCount: 2,
    verified: true,
    bio: 'Ultra-low latency text-to-speech and emotional voice conversion for games and audiobooks.',
    earnings: '₹3.9L'
  },
  {
    id: 'c7',
    name: 'LangArchitects',
    avatar: '✍️',
    followers: 45000,
    installs: 920000,
    modelCount: 2,
    verified: true,
    bio: 'Empowering software agents and creative writing loops with optimized context retrieval.',
    earnings: '₹7.8L'
  },
  {
    id: 'c8',
    name: 'MotionVids',
    avatar: '🎬',
    followers: 67000,
    installs: 890000,
    modelCount: 2,
    verified: true,
    bio: 'Pushing the frontiers of physics-guided diffusion systems for cinematic video production.',
    earnings: '₹18.9L'
  },
  {
    id: 'c9',
    name: 'PromptCrafters',
    avatar: '🤖',
    followers: 19000,
    installs: 210000,
    modelCount: 1,
    verified: false,
    bio: 'Curation and fine-tuning of narrative structures and story-guided dialog systems.',
    earnings: '₹0.9L'
  },
  {
    id: 'c10',
    name: 'BioGen AI',
    avatar: '🧬',
    followers: 73000,
    installs: 320000,
    modelCount: 2,
    verified: true,
    bio: 'Academic-grade transformer systems trained on structural biology, chemical bonds, and genomics.',
    earnings: '₹25.0L'
  }
];

// 20 Mock AI Models
export const mockModels: Model[] = [
  {
    id: 'pixelforge-xl',
    name: 'PixelForge XL',
    creatorId: 'c1',
    description: 'Photorealistic image generation model for creators and professionals.',
    longDescription: 'PixelForge XL is a state-of-the-art latent diffusion model engineered to output premium high-fidelity artwork, photorealistic product placements, and complex text renderings. Optimized to read fine instructions, it supports local inference and image-to-image blending out-of-the-box.',
    category: 'Image',
    tags: ['DIFFUSION', 'PHOTOREALISM', 'IMAGE-TO-IMAGE', 'PREMIUM'],
    rating: 4.7,
    reviewCount: 4280,
    installCount: 842000,
    price: 299,
    originalPrice: 499,
    discountPercent: 40,
    isDiscounted: true,
    discountEndsIn: '18h 42m',
    discountBadge: '⚡ Flash Deal - 40% OFF',
    pricingType: 'local-free-cloud-paid',
    pricingDetails: {
      local: 'Free',
      cloud: '₹0.08 / generation',
      pro: '₹799 / month'
    },
    version: 'v2.4.0',
    releaseDate: '2025-11-12',
    updatedDate: '2026-07-28',
    artwork: 'from-purple-800 to-indigo-900',
    screenshots: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 94,
    trustBreakdown: {
      performance: 96,
      community: 92,
      documentation: 95,
      reliability: 94,
      creator: 93
    },
    benchmarks: [
      { name: 'Image Quality', score: 94.2 },
      { name: 'Prompt Adherence', score: 91.7 },
      { name: 'Text Rendering', score: 88.3 },
      { name: 'Speed (Inference)', score: 87.1 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'RTX 3060 / RX 6600',
        vram: '8 GB',
        ram: '16 GB',
        storage: '12 GB'
      },
      recommended: {
        gpu: 'RTX 4090 / RX 7900 XTX',
        vram: '24 GB',
        ram: '32 GB',
        storage: '20 GB'
      }
    },
    installed: true,
    wishlisted: false,
    sizeOnDisk: '12.8 GB',
    hardwareStatus: 'Ready'
  },
  {
    id: 'neuralvision-4',
    name: 'NeuralVision 4',
    creatorId: 'c3',
    description: 'Next-generation multimodal vision model for OCR, classification, and complex spatial queries.',
    longDescription: 'NeuralVision 4 bridges advanced visual capabilities with transformer comprehension. It is ideal for developers writing automations, performing optical parsing, auditing camera feeds, and resolving spatial navigation instructions from static images or live streams.',
    category: 'Vision',
    tags: ['VISION', 'MULTIMODAL', 'FAST', 'OPEN WEIGHTS'],
    rating: 4.8,
    reviewCount: 18400,
    installCount: 284000,
    price: 0,
    pricingType: 'free',
    pricingDetails: {
      local: 'Free (Open Source)',
      cloud: '₹0.01 / 100 queries'
    },
    version: 'v4.1.2',
    releaseDate: '2026-02-10',
    updatedDate: '2026-08-15',
    artwork: 'from-emerald-800 to-teal-900',
    screenshots: [
      'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 97,
    trustBreakdown: {
      performance: 98,
      community: 96,
      documentation: 99,
      reliability: 97,
      creator: 95
    },
    benchmarks: [
      { name: 'OCR Accuracy', score: 98.4 },
      { name: 'Spatial Parsing', score: 94.6 },
      { name: 'Real-time Latency', score: 96.1 },
      { name: 'Classification', score: 97.8 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'RTX 2060 / RX 5600',
        vram: '6 GB',
        ram: '12 GB',
        storage: '6.4 GB'
      },
      recommended: {
        gpu: 'RTX 3080 / RX 6800',
        vram: '12 GB',
        ram: '16 GB',
        storage: '8 GB'
      }
    },
    installed: false,
    wishlisted: false,
    sizeOnDisk: '7.2 GB'
  },
  {
    id: 'codeforge-7b',
    name: 'CodeForge 7B',
    creatorId: 'c2',
    description: 'Coding assistant optimized for local consumer GPUs, supporting 32 programming languages.',
    longDescription: 'CodeForge 7B is a developer-centric model optimized for code autocomplete, complex debugging, refactoring, and shell commands. Running comfortably within 8GB VRAM budgets, it delivers near-SOTA developer speed directly on your local system.',
    category: 'Coding',
    tags: ['DEVELOPER', 'LOCAL-GPU', 'AUTOCOMPLETE', 'FAST'],
    rating: 4.8,
    reviewCount: 31200,
    installCount: 1200000,
    price: 0,
    pricingType: 'free',
    pricingDetails: {
      local: 'Free (Apache 2.0)',
      cloud: 'Not Offered'
    },
    version: 'v3.2.1',
    releaseDate: '2025-06-20',
    updatedDate: '2026-08-01',
    artwork: 'from-blue-800 to-indigo-950',
    screenshots: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 98,
    trustBreakdown: {
      performance: 98,
      community: 99,
      documentation: 97,
      reliability: 98,
      creator: 98
    },
    benchmarks: [
      { name: 'HumanEval Pass@1', score: 84.5 },
      { name: 'MultiPL-E passing', score: 81.2 },
      { name: 'Reasoning speed', score: 94.0 },
      { name: 'JSON formatting', score: 98.7 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'RTX 3060 / GTX 1080 Ti',
        vram: '8 GB',
        ram: '16 GB',
        storage: '8.4 GB'
      },
      recommended: {
        gpu: 'RTX 4070 / RX 7700 XT',
        vram: '12 GB',
        ram: '16 GB',
        storage: '10 GB'
      }
    },
    installed: true,
    wishlisted: false,
    sizeOnDisk: '8.4 GB',
    hardwareStatus: 'Ready'
  },
  {
    id: 'audionova',
    name: 'AudioNova',
    creatorId: 'c6',
    description: 'Natural speech and conversational voice generator with real-time emotion blending.',
    longDescription: 'AudioNova creates high-fidelity synthetic voices with dynamic pitch, pacing, and human-like emotional inflections. Perfect for game dialog pipelines, virtual agents, and premium narrations.',
    category: 'Speech',
    tags: ['SPEECH', 'SYNTHESIS', 'EMOTION', 'API-READY'],
    rating: 4.6,
    reviewCount: 1420,
    installCount: 391000,
    price: 0,
    pricingType: 'cloud-only',
    pricingDetails: {
      local: 'Not Available',
      cloud: '₹0.02 / minute',
      pro: '₹499 / month (10k min)'
    },
    version: 'v1.8.0',
    releaseDate: '2026-01-15',
    updatedDate: '2026-05-18',
    artwork: 'from-orange-800 to-amber-950',
    screenshots: [
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 89,
    trustBreakdown: {
      performance: 91,
      community: 85,
      documentation: 93,
      reliability: 88,
      creator: 90
    },
    benchmarks: [
      { name: 'MOS (Mean Opinion Score)', score: 92.4 },
      { name: 'Emotion accuracy', score: 86.8 },
      { name: 'Synthesis speed', score: 94.0 },
      { name: 'Word error rate', score: 97.2 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'RTX 2060',
        vram: '6 GB',
        ram: '8 GB',
        storage: '4 GB'
      },
      recommended: {
        gpu: 'RTX 3070',
        vram: '8 GB',
        ram: '16 GB',
        storage: '5 GB'
      }
    },
    installed: false,
    wishlisted: true,
    sizeOnDisk: '3.8 GB'
  },
  {
    id: 'reasonx-32b',
    name: 'ReasonX 32B',
    creatorId: 'c4',
    description: 'Advanced reasoning, step-by-step logic extraction, and math formulation.',
    longDescription: 'ReasonX 32B is an industrial-strength reasoning engine optimized to break complex scientific, engineering, and coding queries into explicit chains of logic before providing final synthesis.',
    category: 'Reasoning',
    tags: ['REASONING', 'LOGIC-CHAIN', 'MATH', 'SOTA'],
    rating: 4.9,
    reviewCount: 3890,
    installCount: 512000,
    price: 449,
    originalPrice: 899,
    discountPercent: 50,
    isDiscounted: true,
    discountEndsIn: '3d 06h',
    discountBadge: '🧠 Super Logic - 50% OFF',
    pricingType: 'paid',
    pricingDetails: {
      local: '₹449 (Deal License)',
      cloud: '₹0.15 / token query',
      pro: '₹1499 / month (Enterprise)'
    },
    version: 'v1.0.4',
    releaseDate: '2026-05-01',
    updatedDate: '2026-08-10',
    artwork: 'from-red-800 to-rose-950',
    screenshots: [
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 96,
    trustBreakdown: {
      performance: 99,
      community: 93,
      documentation: 98,
      reliability: 95,
      creator: 97
    },
    benchmarks: [
      { name: 'MMLU Accuracy', score: 91.2 },
      { name: 'GSM8K Math passing', score: 95.4 },
      { name: 'GPQA Reasoning', score: 86.8 },
      { name: 'Code Generation', score: 92.0 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'RTX 4070 Ti / RX 7800 XT',
        vram: '16 GB',
        ram: '32 GB',
        storage: '28 GB'
      },
      recommended: {
        gpu: 'RTX 4090 / RTX A6000',
        vram: '24 GB',
        ram: '64 GB',
        storage: '35 GB'
      }
    },
    installed: false,
    wishlisted: false,
    sizeOnDisk: '24.5 GB'
  },
  {
    id: 'vidcraft',
    name: 'VidCraft',
    creatorId: 'c8',
    description: 'High-fidelity cinematic text-to-video generation.',
    longDescription: 'VidCraft renders short, dramatic, highly physical movie-like animations and cinematic clips from direct text commands. Includes support for camera pans, custom aspect ratios, and speed settings.',
    category: 'Video',
    tags: ['VIDEO-DIFFUSION', 'CINEMATIC', 'TEXT-TO-VIDEO', 'PRO'],
    rating: 4.5,
    reviewCount: 920,
    installCount: 217000,
    price: 299,
    originalPrice: 599,
    discountPercent: 50,
    isDiscounted: true,
    discountEndsIn: '1d 08h',
    discountBadge: '🎬 Geek Fest - 50% OFF',
    pricingType: 'paid',
    pricingDetails: {
      local: '₹299 Lifetime',
      cloud: '₹1.20 / sec video'
    },
    version: 'v0.9.5',
    releaseDate: '2026-03-05',
    updatedDate: '2026-07-20',
    artwork: 'from-pink-800 to-purple-950',
    screenshots: [
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 91,
    trustBreakdown: {
      performance: 92,
      community: 89,
      documentation: 90,
      reliability: 92,
      creator: 94
    },
    benchmarks: [
      { name: 'Motion Consistency', score: 89.2 },
      { name: 'Photorealism Index', score: 92.4 },
      { name: 'Generation Speed', score: 79.1 },
      { name: 'Prompt Fidelity', score: 88.5 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'RTX 3080 / RX 6800 XT',
        vram: '12 GB',
        ram: '32 GB',
        storage: '25 GB'
      },
      recommended: {
        gpu: 'RTX 4090 / RX 7900 XTX',
        vram: '24 GB',
        ram: '64 GB',
        storage: '35 GB'
      }
    },
    installed: false,
    wishlisted: false,
    sizeOnDisk: '22.0 GB'
  },
  {
    id: 'codeforge-lite',
    name: 'CodeForge Lite',
    creatorId: 'c2',
    description: 'Ultra-fast autocomplete coding assistant for lighter machines.',
    longDescription: 'A compressed, high-performance variant of CodeForge engineered strictly for real-time cursor autocomplete, simple debugging, and syntax checks, ideal for running on laptops or low-end desktops.',
    category: 'Coding',
    tags: ['AUTOCOMPLETE', 'TINY', 'CPU-FRIENDLY'],
    rating: 4.4,
    reviewCount: 8900,
    installCount: 600000,
    price: 0,
    pricingType: 'free',
    pricingDetails: {
      local: 'Free (Open Weights)',
      cloud: 'Not Offered'
    },
    version: 'v1.4.0',
    releaseDate: '2025-08-11',
    updatedDate: '2026-03-12',
    artwork: 'from-blue-700 to-cyan-900',
    screenshots: [],
    trustScore: 94,
    trustBreakdown: {
      performance: 90,
      community: 95,
      documentation: 96,
      reliability: 95,
      creator: 98
    },
    benchmarks: [
      { name: 'Latency (ms)', score: 98.2 },
      { name: 'Autocomplete Pass', score: 72.4 },
      { name: 'Context Accuracy', score: 85.0 },
      { name: 'Memory Footprint', score: 99.1 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'CPU Only Compatible / GTX 1060',
        vram: '3 GB',
        ram: '8 GB',
        storage: '2.8 GB'
      },
      recommended: {
        gpu: 'RTX 2060 / Apple M1',
        vram: '6 GB',
        ram: '16 GB',
        storage: '4 GB'
      }
    },
    installed: true,
    wishlisted: false,
    sizeOnDisk: '2.8 GB',
    hardwareStatus: 'Ready'
  },
  {
    id: 'pixelforge-fast',
    name: 'PixelForge Fast',
    creatorId: 'c1',
    description: 'Real-time image generation model rendering high-quality outputs in under 1 second.',
    longDescription: 'PixelForge Fast uses adversarial consistency distilling (ADD) to output visual assets, web designs, and interface mockups with single-step inference, making it incredibly responsive.',
    category: 'Image',
    tags: ['REALTIME', 'FAST', 'DIFFUSION', 'STYLIZED'],
    rating: 4.5,
    reviewCount: 3100,
    installCount: 450000,
    price: 0,
    pricingType: 'free',
    pricingDetails: {
      local: 'Free (Creative Commons)',
      cloud: '₹0.02 / generation'
    },
    version: 'v1.2.0',
    releaseDate: '2026-02-28',
    updatedDate: '2026-06-14',
    artwork: 'from-purple-600 to-pink-900',
    screenshots: [],
    trustScore: 90,
    trustBreakdown: {
      performance: 95,
      community: 88,
      documentation: 92,
      reliability: 89,
      creator: 93
    },
    benchmarks: [
      { name: 'Inference Speed', score: 99.4 },
      { name: 'Image Fidelity', score: 82.1 },
      { name: 'Text Embedding', score: 78.4 },
      { name: 'Diverse Styles', score: 91.0 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'RTX 3050',
        vram: '4 GB',
        ram: '8 GB',
        storage: '5.2 GB'
      },
      recommended: {
        gpu: 'RTX 3070 / Apple M2',
        vram: '8 GB',
        ram: '16 GB',
        storage: '6 GB'
      }
    },
    installed: false,
    wishlisted: true,
    sizeOnDisk: '5.2 GB'
  },
  {
    id: 'soundscape',
    name: 'SoundScape',
    creatorId: 'c5',
    description: 'Interactive synthesizers and procedural background score creator.',
    longDescription: 'SoundScape takes prompt cues and creates multi-layered synth pads, ambient gaming tracks, sound effects, or loops. Highly customizable for indie developers and sound engineers.',
    category: 'Audio',
    tags: ['MUSIC', 'SOUNDFX', 'PROCEDURAL', 'INDIE'],
    rating: 4.7,
    reviewCount: 680,
    installCount: 180000,
    price: 179,
    originalPrice: 299,
    discountPercent: 40,
    isDiscounted: true,
    discountEndsIn: '1d 19h',
    discountBadge: '🎵 Indie Sound - 40% OFF',
    pricingType: 'paid',
    pricingDetails: {
      local: '₹299 One-time',
      cloud: 'Not Offered'
    },
    version: 'v2.0.1',
    releaseDate: '2025-10-05',
    updatedDate: '2026-04-12',
    artwork: 'from-yellow-800 to-orange-950',
    screenshots: [],
    trustScore: 92,
    trustBreakdown: {
      performance: 94,
      community: 90,
      documentation: 95,
      reliability: 91,
      creator: 88
    },
    benchmarks: [
      { name: 'Instrument Clarity', score: 94.8 },
      { name: 'Rhythm Syncing', score: 96.2 },
      { name: 'Ambient Diversity', score: 90.0 },
      { name: 'Export Latency', score: 88.0 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'GTX 1060 / Apple M1',
        vram: '3 GB',
        ram: '8 GB',
        storage: '3.5 GB'
      },
      recommended: {
        gpu: 'RTX 2060 / RX 5600',
        vram: '6 GB',
        ram: '16 GB',
        storage: '4 GB'
      }
    },
    installed: false,
    wishlisted: false,
    sizeOnDisk: '3.5 GB'
  },
  {
    id: 'talksync',
    name: 'TalkSync',
    creatorId: 'c6',
    description: 'Real-time localized speech translator and dynamic voice cloner.',
    longDescription: 'TalkSync translates and streams spoken audio between 42 languages within 200ms, preserving the speaker\'s original vocal characteristics, accent, and dynamic resonance.',
    category: 'Speech',
    tags: ['TRANSLATION', 'SPEECH-TO-SPEECH', 'REALTIME', 'VOICE-CLONE'],
    rating: 4.6,
    reviewCount: 940,
    installCount: 250000,
    price: 0,
    pricingType: 'free',
    pricingDetails: {
      local: 'Free Personal Use',
      cloud: '₹0.04 / request'
    },
    version: 'v1.1.0',
    releaseDate: '2026-04-01',
    updatedDate: '2026-07-15',
    artwork: 'from-amber-700 to-yellow-900',
    screenshots: [],
    trustScore: 88,
    trustBreakdown: {
      performance: 90,
      community: 84,
      documentation: 91,
      reliability: 87,
      creator: 90
    },
    benchmarks: [
      { name: 'Translation Accuracy', score: 93.4 },
      { name: 'Vocal Match Index', score: 89.2 },
      { name: 'Latency (ms)', score: 97.0 },
      { name: 'Background Noise Fil.', score: 85.0 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'RTX 2060',
        vram: '6 GB',
        ram: '8 GB',
        storage: '4.8 GB'
      },
      recommended: {
        gpu: 'RTX 3060',
        vram: '8 GB',
        ram: '16 GB',
        storage: '6 GB'
      }
    },
    installed: false,
    wishlisted: false,
    sizeOnDisk: '4.8 GB'
  },
  {
    id: 'logicpro-70b',
    name: 'LogicPro 70B',
    creatorId: 'c4',
    description: 'Flagship open reasoning and text parsing system for scientific synthesis.',
    longDescription: 'With 70 Billion parameters, LogicPro is trained specifically to dissect advanced math proofs, legal definitions, scientific data sheets, and multi-agent strategies with absolute detail.',
    category: 'Reasoning',
    tags: ['HEAVY-WEIGHT', 'REASONING', 'ACADEMIC', '70B'],
    rating: 4.9,
    reviewCount: 1950,
    installCount: 310000,
    price: 899,
    originalPrice: 1499,
    discountPercent: 40,
    isDiscounted: true,
    discountEndsIn: '16h 45m',
    discountBadge: '⚡ 70B Heavyweight - 40% OFF',
    pricingType: 'paid',
    pricingDetails: {
      local: '₹899 (Agora Special License)',
      cloud: '₹0.22 / token query',
      pro: '₹2499 / month'
    },
    version: 'v3.0.0',
    releaseDate: '2026-06-25',
    updatedDate: '2026-08-20',
    artwork: 'from-rose-800 to-red-950',
    screenshots: [],
    trustScore: 97,
    trustBreakdown: {
      performance: 99,
      community: 95,
      documentation: 96,
      reliability: 97,
      creator: 98
    },
    benchmarks: [
      { name: 'MMLU Hard math', score: 94.6 },
      { name: 'Logical Deduction', score: 97.4 },
      { name: 'Coding Synthesis', score: 91.2 },
      { name: 'Text Summary API', score: 98.0 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'RTX A5000 / RTX 4090 x2',
        vram: '48 GB',
        ram: '64 GB',
        storage: '62 GB'
      },
      recommended: {
        gpu: 'Nvidia A100 / RTX 8000 x2',
        vram: '80 GB',
        ram: '128 GB',
        storage: '75 GB'
      }
    },
    installed: false,
    wishlisted: false,
    sizeOnDisk: '62.4 GB'
  },
  {
    id: 'scribeai',
    name: 'ScribeAI',
    creatorId: 'c7',
    description: 'Creative drafting agent for screenwriters, copy editors, and long-form narrative authors.',
    longDescription: 'ScribeAI includes special memory vectors designed to trace characters, plot arcs, and brand tones across continuous 128k token context windows. Perfect for authors planning major publications.',
    category: 'Writing',
    tags: ['WRITING', 'NARRATIVE', '128K-CONTEXT', 'CREATIVE'],
    rating: 4.5,
    reviewCount: 4600,
    installCount: 620000,
    price: 0,
    pricingType: 'free',
    pricingDetails: {
      local: 'Free (Apache 2.0)',
      cloud: '₹0.02 / 100 words'
    },
    version: 'v2.1.0',
    releaseDate: '2025-09-14',
    updatedDate: '2026-02-18',
    artwork: 'from-teal-800 to-cyan-950',
    screenshots: [],
    trustScore: 93,
    trustBreakdown: {
      performance: 92,
      community: 94,
      documentation: 95,
      reliability: 92,
      creator: 93
    },
    benchmarks: [
      { name: 'Plot Consistency', score: 91.5 },
      { name: 'Style Customization', score: 95.0 },
      { name: 'Context Retention', score: 96.2 },
      { name: 'Typo & Gram Audit', score: 98.4 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'GTX 1070 / Apple M1',
        vram: '8 GB',
        ram: '16 GB',
        storage: '6.5 GB'
      },
      recommended: {
        gpu: 'RTX 3060 / Apple M2',
        vram: '8 GB',
        ram: '32 GB',
        storage: '8 GB'
      }
    },
    installed: false,
    wishlisted: true,
    sizeOnDisk: '6.5 GB'
  },
  {
    id: 'taskagent-v2',
    name: 'TaskAgent v2',
    creatorId: 'c7',
    description: 'Autonomous web agent that executes browser and filesystem workflows.',
    longDescription: 'TaskAgent v2 connects structural planning to a safe system sandbox. It can draft files, perform complex web research, summarize spreadsheets, and run terminal scripts with explicit user boundaries.',
    category: 'Agents',
    tags: ['AUTONOMOUS', 'SANDBOX-RUN', 'SCRIPTER', 'AGENTS'],
    rating: 4.6,
    reviewCount: 1100,
    installCount: 125000,
    price: 359,
    originalPrice: 599,
    discountPercent: 40,
    isDiscounted: true,
    discountEndsIn: '22h 15m',
    discountBadge: '🤖 Autonomous Agent - 40% OFF',
    pricingType: 'paid',
    pricingDetails: {
      local: '₹359 Deal License',
      cloud: '₹0.18 / action block',
      pro: '₹999 / month (Enterprise)'
    },
    version: 'v2.0.0',
    releaseDate: '2026-05-15',
    updatedDate: '2026-08-11',
    artwork: 'from-cyan-800 to-sky-950',
    screenshots: [],
    trustScore: 92,
    trustBreakdown: {
      performance: 93,
      community: 89,
      documentation: 95,
      reliability: 90,
      creator: 94
    },
    benchmarks: [
      { name: 'Tool Exec Success', score: 94.0 },
      { name: 'Web Navigation', score: 91.5 },
      { name: 'Failsafe Triggers', score: 98.0 },
      { name: 'Context Compiling', score: 92.4 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'RTX 3060',
        vram: '8 GB',
        ram: '16 GB',
        storage: '7.8 GB'
      },
      recommended: {
        gpu: 'RTX 4070 / Apple M3',
        vram: '12 GB',
        ram: '32 GB',
        storage: '10 GB'
      }
    },
    installed: false,
    wishlisted: false,
    sizeOnDisk: '7.8 GB'
  },
  {
    id: 'genepredict',
    name: 'GenePredict',
    creatorId: 'c10',
    description: '3D Protein folding folding models and genomics structure analyzer.',
    longDescription: 'GenePredict takes custom amino acid sequences and predicts 3D structures and folding paths with high spatial accuracy. An invaluable resource for molecular biologists and drug developers.',
    category: 'Science',
    tags: ['MOLECULAR', 'GENOMICS', 'PROTEIN-FOLDING', 'RESEARCH'],
    rating: 4.9,
    reviewCount: 810,
    installCount: 89000,
    price: 0,
    pricingType: 'free',
    pricingDetails: {
      local: 'Free Academic Use',
      cloud: 'Not Offered'
    },
    version: 'v4.0.0',
    releaseDate: '2025-12-01',
    updatedDate: '2026-06-30',
    artwork: 'from-emerald-700 to-green-950',
    screenshots: [],
    trustScore: 98,
    trustBreakdown: {
      performance: 99,
      community: 96,
      documentation: 99,
      reliability: 98,
      creator: 99
    },
    benchmarks: [
      { name: 'GDT Score (Folding)', score: 98.7 },
      { name: 'Spatial Bind Prediction', score: 96.4 },
      { name: 'Seq Matching Speed', score: 92.0 },
      { name: 'Format Compatibility', score: 99.4 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'RTX 3070',
        vram: '8 GB',
        ram: '32 GB',
        storage: '18 GB'
      },
      recommended: {
        gpu: 'RTX 4090 / A100',
        vram: '24 GB',
        ram: '64 GB',
        storage: '25 GB'
      }
    },
    installed: false,
    wishlisted: false,
    sizeOnDisk: '18.4 GB'
  },
  {
    id: 'chemsynth',
    name: 'ChemSynth',
    creatorId: 'c10',
    description: 'Molecular design, bond reaction predictor, and compound synthesizer.',
    longDescription: 'ChemSynth predicts molecular reactions, identifies toxicity pathways, and drafts step-by-step synthetic blueprints for custom pharmaceutical compounds.',
    category: 'Science',
    tags: ['CHEMISTRY', 'PHARMA', 'REACTION-MOD', 'ENTERPRISE'],
    rating: 4.8,
    reviewCount: 390,
    installCount: 45000,
    price: 999,
    originalPrice: 2499,
    discountPercent: 60,
    isDiscounted: true,
    discountEndsIn: '14h 10m',
    discountBadge: '🧬 Research Grant - 60% OFF',
    pricingType: 'paid',
    pricingDetails: {
      local: '₹999/node (Sale License)',
      cloud: '₹1.50 / query structure'
    },
    version: 'v1.4.2',
    releaseDate: '2026-03-22',
    updatedDate: '2026-07-02',
    artwork: 'from-green-800 to-emerald-950',
    screenshots: [],
    trustScore: 95,
    trustBreakdown: {
      performance: 96,
      community: 90,
      documentation: 97,
      reliability: 95,
      creator: 98
    },
    benchmarks: [
      { name: 'Toxicity Precision', score: 95.8 },
      { name: 'Reaction Feasibility', score: 93.2 },
      { name: 'Catalyst Parsing', score: 96.0 },
      { name: 'Structural Diversity', score: 90.5 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'RTX 3080',
        vram: '10 GB',
        ram: '32 GB',
        storage: '15 GB'
      },
      recommended: {
        gpu: 'RTX 4090',
        vram: '24 GB',
        ram: '64 GB',
        storage: '20 GB'
      }
    },
    installed: false,
    wishlisted: false,
    sizeOnDisk: '14.2 GB'
  },
  {
    id: 'storyweaver',
    name: 'StoryWeaver',
    creatorId: 'c9',
    description: 'Interactive narrative engine and dialog generator for fiction writers.',
    longDescription: 'StoryWeaver formats novels, maps branchable game scripts, and simulates conversational voices of diverse literary personas.',
    category: 'Writing',
    tags: ['FICTION', 'DRAFTING', 'GAME-DEV', 'DIALOGS'],
    rating: 4.3,
    reviewCount: 1100,
    installCount: 140000,
    price: 0,
    pricingType: 'free',
    pricingDetails: {
      local: 'Free (Personal)',
      cloud: '₹0.02 / block'
    },
    version: 'v2.2.0',
    releaseDate: '2025-10-10',
    updatedDate: '2026-01-20',
    artwork: 'from-teal-700 to-emerald-900',
    screenshots: [],
    trustScore: 89,
    trustBreakdown: {
      performance: 88,
      community: 92,
      documentation: 90,
      reliability: 87,
      creator: 91
    },
    benchmarks: [
      { name: 'Creativity Index', score: 94.0 },
      { name: 'Grammar Compliance', score: 92.4 },
      { name: 'Coherence at Length', score: 85.0 },
      { name: 'Persona Fidelity', score: 90.2 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'GTX 1060',
        vram: '6 GB',
        ram: '8 GB',
        storage: '4.5 GB'
      },
      recommended: {
        gpu: 'RTX 2060',
        vram: '6 GB',
        ram: '16 GB',
        storage: '5 GB'
      }
    },
    installed: false,
    wishlisted: false,
    sizeOnDisk: '4.5 GB'
  },
  {
    id: 'designforge',
    name: 'DesignForge',
    creatorId: 'c1',
    description: 'Interface vector layout model and style sheets compiler.',
    longDescription: 'DesignForge outputs clean layout parameters, wireframes, logo paths, and functional vanilla style sheet blocks from visual and textual descriptions.',
    category: 'Image',
    tags: ['VECTOR', 'UI-DESIGN', 'STYLE-SHEETS', 'VITE-READY'],
    rating: 4.6,
    reviewCount: 880,
    installCount: 110000,
    price: 479,
    originalPrice: 799,
    discountPercent: 40,
    isDiscounted: true,
    discountEndsIn: '2d 11h',
    discountBadge: '🎨 UI Vectors - 40% OFF',
    pricingType: 'subscription',
    pricingDetails: {
      local: 'Pro Deal Tier',
      cloud: '₹0.06 / generation',
      pro: '₹479 / month (Sale rate)'
    },
    version: 'v1.4.0',
    releaseDate: '2026-01-08',
    updatedDate: '2026-05-12',
    artwork: 'from-purple-900 to-fuchsia-950',
    screenshots: [],
    trustScore: 91,
    trustBreakdown: {
      performance: 92,
      community: 88,
      documentation: 93,
      reliability: 90,
      creator: 94
    },
    benchmarks: [
      { name: 'Vector Alignment', score: 94.2 },
      { name: 'CSS Export Conformity', score: 91.8 },
      { name: 'Layout aesthetics', score: 89.0 },
      { name: 'Speed', score: 90.0 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'RTX 2060',
        vram: '6 GB',
        ram: '16 GB',
        storage: '8 GB'
      },
      recommended: {
        gpu: 'RTX 3070',
        vram: '8 GB',
        ram: '16 GB',
        storage: '10 GB'
      }
    },
    installed: false,
    wishlisted: false,
    sizeOnDisk: '8.0 GB'
  },
  {
    id: 'cinemotion',
    name: 'CineMotion',
    creatorId: 'c8',
    description: '4K physical motion and fluid dynamics video generator.',
    longDescription: 'CineMotion generates ultra-premium 4K video clips, showcasing accurate fluid physics, high-speed camera dynamics, and complex ray-traced shadows.',
    category: 'Video',
    tags: ['VIDEO-DIFFUSION', '4K-RENDER', 'PHYSICAL-FLUIDS', 'CINEMATIC'],
    rating: 4.8,
    reviewCount: 540,
    installCount: 95000,
    price: 649,
    originalPrice: 1299,
    discountPercent: 50,
    isDiscounted: true,
    discountEndsIn: '2d 04h',
    discountBadge: '🎥 Cinema 4K - 50% OFF',
    pricingType: 'paid',
    pricingDetails: {
      local: '₹649 One-time Deal',
      cloud: '₹1.40 / sec rendering'
    },
    version: 'v1.0.0',
    releaseDate: '2026-05-20',
    updatedDate: '2026-08-01',
    artwork: 'from-pink-900 to-rose-950',
    screenshots: [],
    trustScore: 95,
    trustBreakdown: {
      performance: 97,
      community: 92,
      documentation: 94,
      reliability: 95,
      creator: 97
    },
    benchmarks: [
      { name: 'Resolution Check (4K)', score: 98.2 },
      { name: 'Physics Consistency', score: 94.6 },
      { name: 'Render Speed Index', score: 72.0 },
      { name: 'Shadow Realism', score: 96.8 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'RTX 3090 / RX 7900 XT',
        vram: '24 GB',
        ram: '32 GB',
        storage: '40 GB'
      },
      recommended: {
        gpu: 'RTX 4090 / RTX 6000 Ada',
        vram: '24 GB / 48 GB',
        ram: '64 GB',
        storage: '50 GB'
      }
    },
    installed: false,
    wishlisted: false,
    sizeOnDisk: '38.5 GB'
  },
  {
    id: 'voiceduet',
    name: 'VoiceDuet',
    creatorId: 'c5',
    description: 'Dual-voice singing synthesizer and acoustic vocal model conversion.',
    longDescription: 'VoiceDuet maps multi-octave range files, blends harmonic singing structures, and allows users to convert vocal tracks to distinct timbres instantly.',
    category: 'Audio',
    tags: ['SINGING', 'HARMONY', 'VOCAL-CONV', 'INDIE'],
    rating: 4.7,
    reviewCount: 510,
    installCount: 150000,
    price: 0,
    pricingType: 'free',
    pricingDetails: {
      local: 'Free Personal Use',
      cloud: '₹0.10 / min audio render'
    },
    version: 'v1.4.0',
    releaseDate: '2026-02-14',
    updatedDate: '2026-06-08',
    artwork: 'from-orange-700 to-red-900',
    screenshots: [],
    trustScore: 90,
    trustBreakdown: {
      performance: 92,
      community: 89,
      documentation: 90,
      reliability: 88,
      creator: 89
    },
    benchmarks: [
      { name: 'Harmony Precision', score: 94.5 },
      { name: 'Vocal Timber Cloner', score: 92.0 },
      { name: 'Octave Range Scope', score: 91.2 },
      { name: 'Audio Latency', score: 87.0 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'GTX 1060 / Apple M1',
        vram: '6 GB',
        ram: '8 GB',
        storage: '6 GB'
      },
      recommended: {
        gpu: 'RTX 2060 / Apple M2',
        vram: '6 GB',
        ram: '16 GB',
        storage: '7 GB'
      }
    },
    installed: false,
    wishlisted: false,
    sizeOnDisk: '6.0 GB'
  },
  {
    id: 'devopscopilot',
    name: 'DevOpsCopilot',
    creatorId: 'c2',
    description: 'Automated script auditing, server logs analysis, and Dockerfile synthesis.',
    longDescription: 'DevOpsCopilot helps systems administrators compile Kubernetes charts, audit complex shell automation commands for vulnerabilities, and extract errors from live logs.',
    category: 'Coding',
    tags: ['INFRASTRUCTURE', 'AUDITING', 'KUBERNETES', 'DOCKER'],
    rating: 4.7,
    reviewCount: 950,
    installCount: 190000,
    price: 299,
    originalPrice: 499,
    discountPercent: 40,
    isDiscounted: true,
    discountEndsIn: '12h 30m',
    discountBadge: '💻 Dev Deal - 40% OFF',
    pricingType: 'paid',
    pricingDetails: {
      local: '₹299 (Discount Key)',
      cloud: 'Not Offered'
    },
    version: 'v2.1.0',
    releaseDate: '2026-01-22',
    updatedDate: '2026-07-12',
    artwork: 'from-blue-900 to-emerald-950',
    screenshots: [],
    trustScore: 95,
    trustBreakdown: {
      performance: 96,
      community: 92,
      documentation: 95,
      reliability: 97,
      creator: 98
    },
    benchmarks: [
      { name: 'Vuln Parsing Accuracy', score: 96.4 },
      { name: 'Script Compliance', score: 94.0 },
      { name: 'Error Log Resolving', score: 95.8 },
      { name: 'CLI latency', score: 98.0 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'RTX 2060',
        vram: '6 GB',
        ram: '16 GB',
        storage: '5.5 GB'
      },
      recommended: {
        gpu: 'RTX 3060 / RX 6600',
        vram: '8 GB',
        ram: '16 GB',
        storage: '6.5 GB'
      }
    },
    installed: false,
    wishlisted: false,
    sizeOnDisk: '5.5 GB'
  },
  {
    id: 'biotransformer',
    name: 'BioTransformer X',
    creatorId: 'c10',
    description: 'Deep structural pharmacology and molecular binding transformer.',
    longDescription: 'BioTransformer X analyzes small-molecule ligand affinity, predicts protein docking poses, and generates candidate pharmacophores in real time. Designed for biotechnology laboratories and computational chemists.',
    category: 'Science',
    tags: ['PHARMACOLOGY', 'DOCKING', 'MOLECULAR', 'SOTA'],
    rating: 4.9,
    reviewCount: 420,
    installCount: 62000,
    price: 599,
    originalPrice: 1999,
    discountPercent: 70,
    isDiscounted: true,
    discountEndsIn: '10h 25m',
    discountBadge: '💥 Flash 70% OFF',
    pricingType: 'paid',
    pricingDetails: {
      local: '₹599 (Agora Launch Deal)',
      cloud: '₹0.50 / docking batch'
    },
    version: 'v2.0.1',
    releaseDate: '2026-04-10',
    updatedDate: '2026-08-18',
    artwork: 'from-emerald-900 to-teal-950',
    screenshots: [
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 97,
    trustBreakdown: {
      performance: 98,
      community: 94,
      documentation: 99,
      reliability: 96,
      creator: 99
    },
    benchmarks: [
      { name: 'Docking RMSD', score: 98.1 },
      { name: 'Affinity Score', score: 96.5 },
      { name: 'Screening Throughput', score: 95.0 },
      { name: 'PDB Format Accuracy', score: 99.2 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'RTX 3070',
        vram: '8 GB',
        ram: '32 GB',
        storage: '16 GB'
      },
      recommended: {
        gpu: 'RTX 4090 / A6000',
        vram: '24 GB',
        ram: '64 GB',
        storage: '22 GB'
      }
    },
    installed: false,
    wishlisted: false,
    sizeOnDisk: '15.6 GB'
  },
  {
    id: 'synthflow-studio',
    name: 'SynthFlow Studio',
    creatorId: 'c5',
    description: 'Full-stack AI music production suite with stems separation and mastering.',
    longDescription: 'SynthFlow Studio transforms textual musical prompts and reference audio stems into broadcast-grade multitrack projects with automated mixing, compression, and spatial audio mastering.',
    category: 'Audio',
    tags: ['AUDIO-STUDIO', 'MULTITRACK', 'SYNTH', 'MASTERING'],
    rating: 4.8,
    reviewCount: 1250,
    installCount: 220000,
    price: 499,
    originalPrice: 999,
    discountPercent: 50,
    isDiscounted: true,
    discountEndsIn: '2d 18h',
    discountBadge: '🔥 Studio Bundle - 50% OFF',
    pricingType: 'paid',
    pricingDetails: {
      local: '₹499 Lifetime Access',
      cloud: '₹0.05 / render minute'
    },
    version: 'v3.1.0',
    releaseDate: '2026-02-20',
    updatedDate: '2026-08-05',
    artwork: 'from-amber-800 to-red-950',
    screenshots: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80'
    ],
    trustScore: 94,
    trustBreakdown: {
      performance: 96,
      community: 93,
      documentation: 95,
      reliability: 92,
      creator: 95
    },
    benchmarks: [
      { name: 'Dynamic Range', score: 96.8 },
      { name: 'Stem Isolation', score: 95.2 },
      { name: 'Latency', score: 92.4 },
      { name: 'Harmonic Richness', score: 97.0 }
    ],
    systemRequirements: {
      minimum: {
        gpu: 'RTX 2060 / Apple M1',
        vram: '6 GB',
        ram: '16 GB',
        storage: '8 GB'
      },
      recommended: {
        gpu: 'RTX 3070 / Apple M2',
        vram: '8 GB',
        ram: '32 GB',
        storage: '12 GB'
      }
    },
    installed: false,
    wishlisted: true,
    sizeOnDisk: '8.5 GB'
  }
];

// 30 Mock Community Posts
export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'post1',
    modelId: 'pixelforge-xl',
    modelName: 'PixelForge XL',
    title: 'Best settings for product photography?',
    content: 'Hi everyone, I am trying to generate a glass perfume bottle on a reflective black marble base. Which samplers and prompt weights work best for capturing realistic refractions? Standard settings yield slight blurred edges around the glass reflections.',
    author: 'VisualArtisan',
    authorAvatar: '🎨',
    replies: 412,
    likes: 840,
    timeAgo: '2h ago',
    category: 'Discussions'
  },
  {
    id: 'post2',
    modelId: 'pixelforge-xl',
    modelName: 'PixelForge XL',
    title: 'PixelForge 2.4 looks insane',
    content: 'Wow, the update that rolled out on July 28 completely fixed the text rendering issue! I can prompt complex letters, signs, and labels and it actually spells them correctly 90% of the time. Here is a compilation of fake billboard posters I generated.',
    author: 'CyberPhotog',
    authorAvatar: '📸',
    replies: 187,
    likes: 560,
    timeAgo: '5h ago',
    category: 'Creations',
    imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'post3',
    modelId: 'pixelforge-xl',
    modelName: 'PixelForge XL',
    title: 'My workflow for cinematic portraits',
    content: 'I have compiled a guide detailing settings for dramatic portrait lighting (Rembrandt lighting, rim highlights) using the cinematic model LoRAs. This workflow details exact CFG scales (keep it at 5.5) and prompt triggers.',
    author: 'LensMaster',
    authorAvatar: '🎞️',
    replies: 94,
    likes: 310,
    timeAgo: 'Yesterday',
    category: 'Guides'
  },
  {
    id: 'post4',
    modelId: 'codeforge-7b',
    modelName: 'CodeForge 7B',
    title: 'How to speed up local token throughput on a 3060?',
    content: 'I am getting around 31 tokens/sec on RTX 3060. Are there any configuration flags or environment settings to push this closer to 40? I checked the hardware monitor and memory page locks seem to have slight latency overhead.',
    author: 'CodeNode',
    authorAvatar: '⚙️',
    replies: 58,
    likes: 120,
    timeAgo: '1d ago',
    category: 'Discussions'
  },
  {
    id: 'post5',
    modelId: 'codeforge-7b',
    modelName: 'CodeForge 7B',
    title: 'Benchmarking CodeForge vs reasonx-32b for shell scripts',
    content: 'I created a set of complex Docker-compose scripts and let both models audit and optimize them. While ReasonX 32B was more thorough in explaining Docker network topology, CodeForge 7B output the actual working YAML 3x faster and without minor syntax errors.',
    author: 'DockerDan',
    authorAvatar: '🐳',
    replies: 76,
    likes: 215,
    timeAgo: '2d ago',
    category: 'Reviews'
  },
  {
    id: 'post6',
    modelId: 'vidcraft',
    modelName: 'VidCraft',
    title: 'Sci-fi short clip rendered on VidCraft',
    content: 'Check out this 8-second render of a spacecraft gliding through neon-drenched futuristic cloud canyons. The atmospheric scattering and thruster smoke physics hold up extremely well compared to previous versions.',
    author: 'AetherFilms',
    authorAvatar: '🚀',
    replies: 124,
    likes: 410,
    timeAgo: '2d ago',
    category: 'Creations',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'post7',
    modelId: 'neuralvision-4',
    modelName: 'NeuralVision 4',
    title: 'Visual parsing speeds up document processing by 10x',
    content: 'Our team set up NeuralVision 4 locally to parse structural tables and scan paper files. The localized OCR benchmarks show 98% accuracy on legacy forms, reducing manual data entry loops completely.',
    author: 'BizOptimizer',
    authorAvatar: '📈',
    replies: 34,
    likes: 95,
    timeAgo: '3d ago',
    category: 'Reviews'
  },
  {
    id: 'post8',
    modelId: 'pixelforge-xl',
    modelName: 'PixelForge XL',
    title: 'Cyberpunk street corner renders',
    content: 'Enjoy this set of atmospheric neon-drenched alleyways at 4 AM, featuring detailed wet asphalt reflections, stylized signs, and moody lighting.',
    author: 'NeonDreams',
    authorAvatar: '🌃',
    replies: 42,
    likes: 198,
    timeAgo: '3d ago',
    category: 'Screenshots',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'post9',
    modelId: 'reasonx-32b',
    modelName: 'ReasonX 32B',
    title: 'Solving complex algorithms step-by-step',
    content: 'Just ran a test asking the model to optimize a travelling salesman problem variant under resource constraints. The intermediate logic chains it drafted before producing the actual code are remarkably comprehensive and clean.',
    author: 'AlgoWiz',
    authorAvatar: '🔢',
    replies: 29,
    likes: 84,
    timeAgo: '4d ago',
    category: 'Guides'
  },
  {
    id: 'post10',
    modelId: 'genepredict',
    modelName: 'GenePredict',
    title: 'Genomics researcher perspective on GenePredict v4',
    content: 'The protein-folding GDT score of 98.7% is fully replicable! We ran it against standard experimental structures in our lab, and the spatial deviation was less than 1.4 Angstroms. This makes quick molecular screening highly accessible.',
    author: 'BioDoc',
    authorAvatar: '🧪',
    replies: 51,
    likes: 145,
    timeAgo: '4d ago',
    category: 'Reviews'
  },
  // Adding remaining 20 posts to ensure we hit 30
  ...Array.from({ length: 20 }, (_, idx) => {
    const postCategories: Array<'Discussions' | 'Creations' | 'Guides' | 'Screenshots' | 'Reviews'> = ['Discussions', 'Creations', 'Guides', 'Screenshots', 'Reviews'];
    const modelPairs = [
      { id: 'pixelforge-xl', name: 'PixelForge XL' },
      { id: 'codeforge-7b', name: 'CodeForge 7B' },
      { id: 'audionova', name: 'AudioNova' },
      { id: 'neuralvision-4', name: 'NeuralVision 4' }
    ];
    const pair = modelPairs[idx % modelPairs.length];
    const cat = postCategories[idx % postCategories.length];
    return {
      id: `post-gen-${idx}`,
      modelId: pair.id,
      modelName: pair.name,
      title: `General Community Topic #${idx + 11} - ${pair.name} Help`,
      content: `This is a mock community message detailing topics about ${pair.name}. We discuss tips, settings, hardware integration, and workflows for achieving the best outputs. Please share your experiences below!`,
      author: `User_Gen_${idx + 100}`,
      authorAvatar: '🤖',
      replies: Math.floor(Math.random() * 40) + 5,
      likes: Math.floor(Math.random() * 120) + 10,
      timeAgo: `${idx + 5}d ago`,
      category: cat
    };
  })
];

// 20 Mock Workshop Items
export const mockWorkshopItems: WorkshopItem[] = [
  {
    id: 'w1',
    title: 'Cinematic Product LoRA',
    modelId: 'pixelforge-xl',
    modelName: 'PixelForge XL',
    category: 'LoRAs',
    author: 'NeuralForge',
    rating: 4.9,
    subscribers: 42000,
    subscribed: true,
    description: 'Improves product photography shots, adding studio softboxes, crisp rim lighting, and elegant reflective details to objects.',
    artwork: 'from-violet-600 to-fuchsia-800'
  },
  {
    id: 'w2',
    title: 'Senior Developer System Prompt',
    modelId: 'codeforge-7b',
    modelName: 'CodeForge 7B',
    category: 'Prompts',
    author: 'CodeSmiths',
    rating: 4.8,
    subscribers: 18000,
    subscribed: true,
    description: 'Injects system parameters to enforce modular, clean, documented functions with robust unit tests and descriptive variable names.',
    artwork: 'from-sky-700 to-indigo-800'
  },
  {
    id: 'w3',
    title: 'Anime Motion Workflow',
    modelId: 'vidcraft',
    modelName: 'VidCraft',
    category: 'Workflows',
    author: 'MotionVids',
    rating: 4.7,
    subscribers: 12000,
    subscribed: false,
    description: 'Compy-UI workflow template optimized to render smooth anime character motion without standard frame morphing artifacts.',
    artwork: 'from-rose-600 to-pink-700'
  },
  {
    id: 'w4',
    title: 'Architectural Render Preset',
    modelId: 'pixelforge-xl',
    modelName: 'PixelForge XL',
    category: 'Presets',
    author: 'LensMaster',
    rating: 4.6,
    subscribers: 8900,
    subscribed: false,
    description: 'Calibrates contrast and atmospheric scattering for photorealistic interior design shots and realistic concrete textures.',
    artwork: 'from-amber-600 to-yellow-800'
  },
  {
    id: 'w5',
    title: 'Markdown Docs Parser Extension',
    modelId: 'codeforge-7b',
    modelName: 'CodeForge 7B',
    category: 'Extensions',
    author: 'LangArchitects',
    rating: 4.8,
    subscribers: 14500,
    subscribed: false,
    description: 'Direct IDE helper extension that automatically parses directory readmes to expand the models contextual coding files.',
    artwork: 'from-cyan-600 to-teal-800'
  },
  {
    id: 'w6',
    title: 'Dark Fantasy Concept Art LoRA',
    modelId: 'pixelforge-xl',
    modelName: 'PixelForge XL',
    category: 'LoRAs',
    author: 'NeonDreams',
    rating: 4.9,
    subscribers: 28000,
    subscribed: false,
    description: 'Imbues generated characters and backgrounds with moody, gothic, high-contrast dark fantasy concept art styling.',
    artwork: 'from-purple-800 to-violet-950'
  },
  {
    id: 'w7',
    title: 'TypeScript Refactoring Workflow',
    modelId: 'codeforge-7b',
    modelName: 'CodeForge 7B',
    category: 'Workflows',
    author: 'DockerDan',
    rating: 4.7,
    subscribers: 9800,
    subscribed: false,
    description: 'Specialized workflow to automatically find unused vars, typing issues, and rewrite JavaScript blocks to clean TS interfaces.',
    artwork: 'from-blue-600 to-indigo-800'
  },
  {
    id: 'w8',
    title: 'Hyper-Realistic Vocal Preset',
    modelId: 'audionova',
    modelName: 'AudioNova',
    category: 'Presets',
    author: 'Speechify',
    rating: 4.7,
    subscribers: 5600,
    subscribed: false,
    description: 'Calibrates room reverberations and micro-breaths for dynamic audiobook recording styles.',
    artwork: 'from-orange-600 to-red-800'
  },
  ...Array.from({ length: 12 }, (_, idx) => {
    const categories: Array<'LoRAs' | 'Fine-tunes' | 'Prompts' | 'Workflows' | 'Agents' | 'Presets' | 'Extensions'> = ['LoRAs', 'Fine-tunes', 'Prompts', 'Workflows', 'Agents', 'Presets', 'Extensions'];
    const modelPairs = [
      { id: 'pixelforge-xl', name: 'PixelForge XL' },
      { id: 'codeforge-7b', name: 'CodeForge 7B' },
      { id: 'neuralvision-4', name: 'NeuralVision 4' }
    ];
    const pair = modelPairs[idx % modelPairs.length];
    const cat = categories[idx % categories.length];
    return {
      id: `workshop-gen-${idx}`,
      title: `Community ${cat} #${idx + 9} for ${pair.name}`,
      modelId: pair.id,
      modelName: pair.name,
      category: cat,
      author: `Modder_${idx + 10}`,
      rating: Number((4.2 + (idx % 8) * 0.1).toFixed(1)),
      subscribers: Math.floor(Math.random() * 8000) + 1200,
      subscribed: false,
      description: `A useful customized ${cat} file curated by the community to enhance ${pair.name} productivity. Highly recommended for daily use.`,
      artwork: 'from-slate-700 to-slate-900'
    };
  })
];
