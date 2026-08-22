import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { mockModels } from '../data/mockData';
import type { Model } from '../data/mockData';

/**
 * Normalizes a raw Supabase model record (which may use snake_case or camelCase)
 * into a fully-typed Model entity compatible with the entire ModalHub frontend.
 */
export function normalizeSupabaseModel(raw: any, index: number = 0): Model {
  // Find fallback matching mock model if available to supply deep metadata like benchmarks/snippets if not present
  const fallbackMock = mockModels.find(
    (m) =>
      m.id === raw.id ||
      m.id === raw.slug ||
      m.name?.toLowerCase() === raw.name?.toLowerCase()
  ) || mockModels[index % mockModels.length];

  const id = String(raw.id || raw.slug || fallbackMock?.id || `model-${index}`);
  const name = raw.name || fallbackMock?.name || 'AI Model';
  const provider =
    raw.provider ||
    raw.creator ||
    raw.creator_name ||
    fallbackMock?.provider ||
    'Community Provider';
  const category = (raw.category || fallbackMock?.category || 'Reasoning') as Model['category'];

  // Parse tags (could be array, JSON string, or comma-separated string)
  let tags: string[] = [];
  if (Array.isArray(raw.tags)) {
    tags = raw.tags.map((t: any) => String(t));
  } else if (typeof raw.tags === 'string') {
    try {
      const parsed = JSON.parse(raw.tags);
      tags = Array.isArray(parsed) ? parsed.map((t: any) => String(t)) : raw.tags.split(',').map((t: string) => t.trim());
    } catch {
      tags = raw.tags.split(',').map((t: string) => t.trim());
    }
  } else {
    tags = fallbackMock?.tags || ['AI', category.toUpperCase()];
  }

  // Parse benchmarks if present
  let benchmarks = fallbackMock?.benchmarks || [];
  if (Array.isArray(raw.benchmarks) && raw.benchmarks.length > 0) {
    benchmarks = raw.benchmarks;
  } else if (typeof raw.benchmarks === 'string') {
    try {
      const parsed = JSON.parse(raw.benchmarks);
      if (Array.isArray(parsed)) benchmarks = parsed;
    } catch {}
  }

  // Parse capabilities
  let capabilities = fallbackMock?.capabilities || [];
  if (Array.isArray(raw.capabilities) && raw.capabilities.length > 0) {
    capabilities = raw.capabilities;
  } else if (typeof raw.capabilities === 'string') {
    try {
      const parsed = JSON.parse(raw.capabilities);
      if (Array.isArray(parsed)) capabilities = parsed;
    } catch {}
  }

  // Provider logo / emoji
  let providerLogo = raw.provider_logo || raw.providerLogo || fallbackMock?.providerLogo;
  if (!providerLogo) {
    if (provider.toLowerCase().includes('open') || provider.toLowerCase().includes('gpt')) providerLogo = '🌐';
    else if (provider.toLowerCase().includes('anthropic') || provider.toLowerCase().includes('claude')) providerLogo = ' Claude';
    else if (provider.toLowerCase().includes('deepseek')) providerLogo = '🐋';
    else if (provider.toLowerCase().includes('qwen') || provider.toLowerCase().includes('alibaba')) providerLogo = '⚡';
    else if (provider.toLowerCase().includes('meta') || provider.toLowerCase().includes('llama')) providerLogo = '🦙';
    else if (provider.toLowerCase().includes('google') || provider.toLowerCase().includes('gemini')) providerLogo = '✨';
    else if (provider.toLowerCase().includes('mistral')) providerLogo = '🌪️';
    else if (provider.toLowerCase().includes('black forest') || provider.toLowerCase().includes('flux')) providerLogo = '🎨';
    else if (provider.toLowerCase().includes('eleven')) providerLogo = '🎙️';
    else providerLogo = '⚡';
  }

  // Color artwork gradient
  const artworkGradients = [
    'from-blue-900 via-indigo-900 to-slate-950',
    'from-emerald-950 via-teal-900 to-slate-950',
    'from-amber-950 via-orange-950 to-slate-950',
    'from-violet-950 via-purple-950 to-slate-950',
    'from-sky-950 via-indigo-950 to-slate-950',
    'from-pink-950 via-rose-950 to-slate-950',
    'from-fuchsia-950 via-purple-950 to-slate-950',
    'from-cyan-950 via-teal-950 to-slate-950'
  ];
  const artwork = raw.artwork || fallbackMock?.artwork || artworkGradients[index % artworkGradients.length];

  // Pricing
  const inputPrice = Number(raw.input_price_per_million ?? raw.inputPricePerMillion ?? raw.price_in ?? fallbackMock?.inputPricePerMillion ?? 0.50);
  const outputPrice = Number(raw.output_price_per_million ?? raw.outputPricePerMillion ?? raw.price_out ?? fallbackMock?.outputPricePerMillion ?? 1.50);
  const cachedPrice = raw.cached_input_price_per_million ?? raw.cachedInputPricePerMillion ?? fallbackMock?.cachedInputPricePerMillion;

  // Open-source / License
  const license = raw.license || fallbackMock?.license || 'Commercial API';
  const isOpenSource =
    raw.is_open_source !== undefined
      ? Boolean(raw.is_open_source)
      : raw.isOpenSource !== undefined
      ? Boolean(raw.isOpenSource)
      : license.toLowerCase().includes('mit') ||
        license.toLowerCase().includes('apache') ||
        license.toLowerCase().includes('open') ||
        license.toLowerCase().includes('llama') ||
        Boolean(fallbackMock?.isOpenSource);

  // Scores
  const overallScore = Number(raw.overall_score ?? raw.overallScore ?? raw.score ?? fallbackMock?.overallScore ?? 95.0);
  const codingScore = Number(raw.coding_score ?? raw.codingScore ?? fallbackMock?.codingScore ?? 92.0);
  const reasoningScore = Number(raw.reasoning_score ?? raw.reasoningScore ?? fallbackMock?.reasoningScore ?? 94.0);
  const mathScore = Number(raw.math_score ?? raw.mathScore ?? fallbackMock?.mathScore ?? 90.0);
  const visionScore = Number(raw.vision_score ?? raw.visionScore ?? fallbackMock?.visionScore ?? 0);
  const speed = Number(raw.speed_tokens_per_sec ?? raw.speedTokensPerSec ?? raw.speed ?? fallbackMock?.speedTokensPerSec ?? 85);
  const latency = Number(raw.latency_ms ?? raw.latencyMs ?? raw.latency ?? fallbackMock?.latencyMs ?? 35);

  // Context & Parameters
  const parameters = raw.parameters || raw.params || raw.model_size || raw.modelSize || fallbackMock?.parameters || 'Dense Architecture';
  const modelSize = raw.model_size || raw.modelSize || parameters;
  const runtime = raw.runtime || raw.engine || (raw.runtime_model_id || fallbackMock?.runtime_model_id ? 'ollama' : 'vLLM / Modal Inference');
  const runtimeModelId = raw.runtime_model_id || raw.runtimeModelId || fallbackMock?.runtime_model_id || fallbackMock?.runtimeModelId;
  const contextWindow = raw.context_window || raw.contextWindow || fallbackMock?.contextWindow || '128K tokens';
  const contextWindowTokens = Number(
    raw.context_window_tokens ?? raw.contextWindowTokens ?? fallbackMock?.contextWindowTokens ?? 128000
  );

  return {
    id,
    name,
    provider,
    providerLogo,
    creatorId: raw.creator_id || raw.creatorId || fallbackMock?.creatorId || 'c1',
    creator: raw.creator || raw.creator_name || provider,
    description: raw.description || fallbackMock?.description || 'High-performance AI model endpoint.',
    longDescription:
      raw.long_description ||
      raw.longDescription ||
      raw.description ||
      fallbackMock?.longDescription ||
      'Advanced machine learning model with scalable REST and SSE streaming capabilities.',
    category,
    tags,
    overallScore,
    codingScore,
    reasoningScore,
    mathScore,
    visionScore,
    speedTokensPerSec: speed,
    latencyMs: latency,
    contextWindow,
    contextWindowTokens,
    parameters,
    model_size: modelSize,
    modelSize,
    runtime,
    runtime_model_id: runtimeModelId,
    runtimeModelId,
    inputPricePerMillion: isNaN(inputPrice) ? 0.50 : inputPrice,
    outputPricePerMillion: isNaN(outputPrice) ? 1.50 : outputPrice,
    cachedInputPricePerMillion: cachedPrice ? Number(cachedPrice) : undefined,
    batchDiscountPercent: raw.batch_discount_percent ?? raw.batchDiscountPercent ?? fallbackMock?.batchDiscountPercent ?? 50,
    isOpenSource,
    license,
    accessMethods: Array.isArray(raw.access_methods) ? raw.access_methods : (raw.accessMethods || fallbackMock?.accessMethods || ['REST API', 'Streaming SSE', 'OpenAI-Compatible']),
    endpoint: raw.endpoint || fallbackMock?.endpoint || 'https://api.modalhub.ai/v1/chat/completions',
    modelEndpointId: raw.model_endpoint_id || raw.modelEndpointId || id,
    bestFor: raw.best_for || raw.bestFor || fallbackMock?.bestFor || 'Scalable production inference and developer applications.',
    capabilities,
    sampleCurl: raw.sample_curl || raw.sampleCurl || fallbackMock?.sampleCurl || `curl -X POST https://api.modalhub.ai/v1/chat/completions -H "Authorization: Bearer $MODALHUB_API_KEY" -d '{"model": "${id}", "messages": [{"role": "user", "content": "Hello!"}]}'`,
    samplePython: raw.sample_python || raw.samplePython || fallbackMock?.samplePython || `from openai import OpenAI\n\nclient = OpenAI(base_url="https://api.modalhub.ai/v1", api_key="your_api_key")\nresponse = client.chat.completions.create(model="${id}", messages=[{"role": "user", "content": "Hello"}])\nprint(response.choices[0].message.content)`,
    sampleNode: raw.sample_node || raw.sampleNode || fallbackMock?.sampleNode || `import OpenAI from "openai";\n\nconst client = new OpenAI({ baseURL: "https://api.modalhub.ai/v1", apiKey: process.env.MODALHUB_API_KEY });\nconst res = await client.chat.completions.create({ model: "${id}", messages: [{ role: "user", content: "Hello" }] });\nconsole.log(res.choices[0].message.content);`,
    hardwareRequirements: raw.hardware_requirements || raw.hardwareRequirements || fallbackMock?.hardwareRequirements,
    alternatives: Array.isArray(raw.alternatives) ? raw.alternatives : (fallbackMock?.alternatives || []),
    rating: Number(raw.rating ?? fallbackMock?.rating ?? 4.8),
    reviewCount: Number(raw.review_count ?? raw.reviewCount ?? fallbackMock?.reviewCount ?? 1200),
    apiCallsCount: Number(raw.api_calls_count ?? raw.apiCallsCount ?? fallbackMock?.apiCallsCount ?? 25000000),
    version: raw.version || fallbackMock?.version || 'v1.0.0',
    releaseDate: raw.release_date || raw.releaseDate || fallbackMock?.releaseDate || '2025-01-01',
    updatedDate: raw.updated_date || raw.updatedDate || fallbackMock?.updatedDate || '2026-02-01',
    artwork,
    screenshots: Array.isArray(raw.screenshots) ? raw.screenshots : (raw.thumbnail_url ? [raw.thumbnail_url] : fallbackMock?.screenshots || []),
    trustScore: Number(raw.trust_score ?? raw.trustScore ?? fallbackMock?.trustScore ?? 98),
    trustBreakdown: raw.trust_breakdown || raw.trustBreakdown || fallbackMock?.trustBreakdown || { performance: 98, community: 97, documentation: 98, reliability: 98, creator: 98 },
    benchmarks,
    thumbnail_url: raw.thumbnail_url || raw.thumbnailUrl || (raw.screenshots?.[0] ?? fallbackMock?.screenshots?.[0]),
    thumbnailUrl: raw.thumbnail_url || raw.thumbnailUrl || (raw.screenshots?.[0] ?? fallbackMock?.screenshots?.[0]),
    banner_url: raw.banner_url || raw.bannerUrl || raw.thumbnail_url,
    bannerUrl: raw.banner_url || raw.bannerUrl || raw.thumbnail_url,
    featured: Boolean(raw.featured ?? fallbackMock?.overallScore > 97),
    trending: Boolean(raw.trending ?? true),
    deployable: Boolean(raw.deployable ?? true),
    verified: Boolean(raw.verified ?? true),
    slug: raw.slug || id,
    wishlisted: Boolean(raw.wishlisted ?? fallbackMock?.wishlisted ?? false)
  };
}

export const ModelService = {
  /**
   * Fetch all models from Supabase `models` table.
   * If offline or error occurs, falls back cleanly to mock data.
   */
  async getAllModels(): Promise<{ data: Model[]; fromDatabase: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      return { data: mockModels, fromDatabase: false };
    }

    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.warn('Supabase models query error, using local fallback:', error.message);
        return { data: mockModels, fromDatabase: false, error: error.message };
      }

      if (data && data.length > 0) {
        const normalized = data.map((row, idx) => normalizeSupabaseModel(row, idx));
        return { data: normalized, fromDatabase: true };
      }

      // If database is empty, fallback
      return { data: mockModels, fromDatabase: false };
    } catch (err: any) {
      console.warn('Supabase fetch exception, fallback to mock:', err);
      return { data: mockModels, fromDatabase: false, error: err?.message };
    }
  },

  /**
   * Fetch a single model by ID or slug from Supabase
   */
  async getModelById(idOrSlug: string): Promise<{ data: Model | null; fromDatabase: boolean; error?: string }> {
    if (!idOrSlug) return { data: null, fromDatabase: false };

    if (isSupabaseConfigured) {
      try {
        // Try query by id first
        let { data, error } = await supabase
          .from('models')
          .select('*')
          .eq('id', idOrSlug)
          .maybeSingle();

        // If not found by id, try by slug
        if (!data) {
          const slugRes = await supabase
            .from('models')
            .select('*')
            .eq('slug', idOrSlug)
            .maybeSingle();
          if (slugRes.data) {
            data = slugRes.data;
            error = null;
          }
        }

        if (data && !error) {
          return { data: normalizeSupabaseModel(data, 0), fromDatabase: true };
        }
      } catch (err: any) {
        console.warn('Supabase getModelById exception:', err);
      }
    }

    // Fallback to local
    const fallback = mockModels.find((m) => m.id === idOrSlug || m.slug === idOrSlug) || null;
    return { data: fallback, fromDatabase: false };
  },

  /**
   * Fetch distinct categories from models
   */
  async getCategories(): Promise<string[]> {
    const defaultCategories = ['All', 'Reasoning', 'Coding', 'Image', 'Speech', 'Vision', 'Science'];
    try {
      const { data } = await this.getAllModels();
      const set = new Set<string>();
      data.forEach((m) => {
        if (m.category) set.add(m.category);
      });
      const unique = Array.from(set);
      return unique.length > 0 ? ['All', ...unique] : defaultCategories;
    } catch {
      return defaultCategories;
    }
  }
};
