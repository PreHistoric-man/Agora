import { GoogleGenAI } from '@google/genai';
import { mockModels } from '../data/mockData';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface UserContext {
  isAuthenticated: boolean;
  userId?: string;
  userEmail?: string;
  libraryModelIds?: string[];
  deploymentsSummary?: Array<{
    id: string;
    modelId: string;
    status: string;
    provider: string;
  }>;
}

export interface AssistantResponse {
  message: string;
  suggestedModels: Array<{
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
  }>;
}

// Build catalog summary text for the prompt
function buildCatalogContext(): string {
  return mockModels
    .map((m) => {
      const hw = m.hardwareRequirements
        ? `Hardware req: GPU ${m.hardwareRequirements.gpu}, VRAM ${m.hardwareRequirements.vram}, RAM ${m.hardwareRequirements.ram}`
        : 'Cloud API or standard server';
      return `- ID: "${m.id}" | Name: "${m.name}" | Provider: "${m.provider}" | Category: ${m.category} | Rating: ${m.rating}/5.0 (${m.reviewCount} reviews) | Price: $${m.inputPricePerMillion}/1M in, $${m.outputPricePerMillion}/1M out | Context: ${m.contextWindow} | Params: ${m.parameters || 'N/A'} | Open Source: ${m.isOpenSource ? 'Yes (Open Weights)' : 'No (Proprietary API)'} | License: ${m.license} | Speed: ${m.speedTokensPerSec} tok/s | Benchmarks: Overall ${m.overallScore}, Coding ${m.codingScore}, Reasoning ${m.reasoningScore}, Math ${m.mathScore} | Best For: ${m.bestFor} | ${hw} | Tags: ${m.tags.join(', ')}`;
    })
    .join('\n');
}

/**
 * Identify any model mentioned or relevant from text
 */
function extractSuggestedModels(text: string, requestedCount = 4) {
  const lower = text.toLowerCase();
  const matched: typeof mockModels = [];

  for (const m of mockModels) {
    const idMatch = lower.includes(m.id.toLowerCase());
    const nameMatch = lower.includes(m.name.toLowerCase());
    const slugMatch = m.slug ? lower.includes(m.slug.toLowerCase()) : false;

    if (idMatch || nameMatch || slugMatch) {
      if (!matched.some((item) => item.id === m.id)) {
        matched.push(m);
      }
    }
  }

  return matched.slice(0, requestedCount).map((m) => ({
    id: m.id,
    name: m.name,
    provider: m.provider,
    category: m.category,
    rating: m.rating,
    inputPricePerMillion: m.inputPricePerMillion,
    outputPricePerMillion: m.outputPricePerMillion,
    contextWindow: m.contextWindow,
    parameters: m.parameters,
    isOpenSource: m.isOpenSource,
    runtime: m.runtime,
    description: m.description,
    tags: m.tags
  }));
}

/**
 * Deterministic local fallback recommendation engine if Gemini API key is missing or offline
 */
function generateLocalFallbackResponse(userPrompt: string, userContext?: UserContext): AssistantResponse {
  const query = userPrompt.toLowerCase();

  // 1. Library queries
  if (query.includes('library') || query.includes('what do i have') || query.includes('my models') || query.includes('in my library')) {
    if (!userContext?.isAuthenticated) {
      return {
        message:
          "To view your personal AI Model Library, please sign in to Agora using the button in the top navigation bar. Once signed in, you can add models to your library, track installations in the Agora Launcher, and deploy instances to AWS or local hardware.",
        suggestedModels: extractSuggestedModels('deepseek-r1 claude-3-5-sonnet qwen-2-5-coder-32b')
      };
    }

    const libIds = userContext.libraryModelIds || [];
    if (libIds.length === 0) {
      return {
        message:
          "Your Agora Library is currently empty. You can browse the **Discover** or **Store** catalog and click **Add to Library** on any model to save it to your workspace.",
        suggestedModels: mockModels.slice(0, 3).map((m) => ({
          id: m.id,
          name: m.name,
          provider: m.provider,
          category: m.category,
          rating: m.rating,
          inputPricePerMillion: m.inputPricePerMillion,
          outputPricePerMillion: m.outputPricePerMillion,
          contextWindow: m.contextWindow,
          parameters: m.parameters,
          isOpenSource: m.isOpenSource,
          runtime: m.runtime,
          description: m.description,
          tags: m.tags
        }))
      };
    }

    const ownedModels = mockModels.filter((m) => libIds.includes(m.id));
    const modelNames = ownedModels.map((m) => `**${m.name}** (${m.provider})`).join(', ');

    return {
      message: `You currently have **${ownedModels.length}** model${ownedModels.length === 1 ? '' : 's'} in your Agora Library:\n\n${modelNames}\n\nYou can click below to view their details or launch deployments.`,
      suggestedModels: ownedModels.slice(0, 4).map((m) => ({
        id: m.id,
        name: m.name,
        provider: m.provider,
        category: m.category,
        rating: m.rating,
        inputPricePerMillion: m.inputPricePerMillion,
        outputPricePerMillion: m.outputPricePerMillion,
        contextWindow: m.contextWindow,
        parameters: m.parameters,
        isOpenSource: m.isOpenSource,
        runtime: m.runtime,
        description: m.description,
        tags: m.tags
      }))
    };
  }

  // 2. Coding queries
  if (query.includes('coding') || query.includes('code') || query.includes('programming') || query.includes('developer') || query.includes('typescript') || query.includes('python')) {
    return {
      message:
        "Here are the top coding and software engineering models available on Agora:\n\n• **Claude 3.5 Sonnet** (Anthropic): Highest coding benchmark (98.4/100) with a 200K context window. Ideal for complex multi-file refactoring and architecture.\n• **Qwen 2.5 Coder 32B** (Alibaba Cloud): Leading open-weights coding model (94.2/100 coding score) at an ultra-low price ($0.07/1M tokens) with 128K context.\n• **DeepSeek-R1** (DeepSeek): Premier open reasoning model that excels at algorithmic programming and competitive test case verification.",
      suggestedModels: extractSuggestedModels('claude-3-5-sonnet qwen-2-5-coder-32b deepseek-r1')
    };
  }

  // 3. Image / Visual generation queries
  if (query.includes('image') || query.includes('art') || query.includes('flux') || query.includes('photo') || query.includes('draw')) {
    return {
      message:
        "For visual image generation, Agora offers:\n\n• **FLUX.1 [pro]** (Black Forest Labs): State-of-the-art 12B parameter flow transformer. Renowned for prompt adherence, photorealism, and clean in-image typography rendering.\n• **SDXL Turbo** (Stability AI): Real-time, single-step inference engine ideal for low-latency image generation.",
      suggestedModels: extractSuggestedModels('flux-1-pro sdxl-turbo')
    };
  }

  // 4. Comparison queries
  if (query.includes('compare') || query.includes('vs') || query.includes('difference')) {
    return {
      message:
        "Agora includes a dedicated side-by-side **Model Comparison** tool. You can compare latency, token pricing, context window size, benchmark scores, and licenses.\n\nTwo of the most frequently compared models are **DeepSeek-R1** vs **Claude 3.5 Sonnet**:\n• **DeepSeek-R1**: Open-weights reasoning model, $0.14/1M input tokens, 128K context, high math & logic score.\n• **Claude 3.5 Sonnet**: Proprietary API, $3.00/1M input tokens, 200K context, industry-leading coding and agentic reasoning.",
      suggestedModels: extractSuggestedModels('deepseek-r1 claude-3-5-sonnet')
    };
  }

  // 5. Deployment queries
  if (query.includes('deploy') || query.includes('aws') || query.includes('ollama') || query.includes('run local') || query.includes('hardware') || query.includes('ram') || query.includes('vram')) {
    return {
      message:
        "Agora supports two primary deployment pathways:\n\n1. **Agora Launcher & Local Hardware**: Open-weights models like **Qwen 2.5 Coder 32B** or **Phi-4** can be installed and executed locally via Ollama or vLLM.\n   - *For 8GB–16GB RAM*: Look for 7B–14B models (e.g. Phi-4, Qwen 2.5 7B).\n   - *For 24GB+ VRAM*: Run 32B–70B models (e.g. Qwen 2.5 Coder 32B, Llama 3.3 70B).\n2. **Cloud GPU Deployment (AWS EC2)**: Deploy models to dedicated instances (such as AWS `g4dn.xlarge` with NVIDIA T4 GPUs) directly from the Agora interface using cross-account IAM role verification.",
      suggestedModels: extractSuggestedModels('qwen-2-5-coder-32b phi-4 deepseek-r1 llama-3-3-70b')
    };
  }

  // Default general overview
  return {
    message:
      "Welcome to Agora Assistant! I can help you discover, evaluate, and deploy models from our marketplace. You can ask me about:\n\n• **Best models by use-case** (Coding, Reasoning, Image Generation, Speech)\n• **Hardware & Local inference** requirements (VRAM, RAM, Ollama compatibility)\n• **Price & Benchmark comparisons**\n• **Deployment guides** for AWS EC2 or local Agora Launcher runtimes\n• **Your owned Library items and active deployments**",
    suggestedModels: extractSuggestedModels('deepseek-r1 claude-3-5-sonnet flux-1-pro qwen-2-5-coder-32b')
  };
}

/**
 * Handle incoming chat requests to Agora Assistant using Gemini 3.7 Flash
 */
export async function handleAssistantChat(params: {
  messages: ChatMessage[];
  userContext?: UserContext;
}): Promise<AssistantResponse> {
  const { messages, userContext } = params;

  if (!messages || messages.length === 0) {
    return generateLocalFallbackResponse('help', userContext);
  }

  const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('[Agora Assistant] GEMINI_API_KEY is not set. Using local model catalog engine.');
    return generateLocalFallbackResponse(latestUserMsg, userContext);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const catalogContext = buildCatalogContext();

    let userContextText = 'User is browsing as an anonymous guest.';
    if (userContext?.isAuthenticated) {
      const libModels = (userContext.libraryModelIds || []).join(', ') || 'None';
      const deps = (userContext.deploymentsSummary || [])
        .map((d) => `${d.modelId} (${d.provider} - ${d.status})`)
        .join(', ') || 'None';
      userContextText = `User is authenticated (ID: ${userContext.userId || 'user'}). Library Model IDs: [${libModels}]. Active Deployments: [${deps}].`;
    }

    const systemInstruction = `You are Agora Assistant, an AI assistant for the Agora AI model marketplace.
Your job is to help users discover, understand, compare and deploy AI models available on Agora.
Use Agora's provided model data as the source of truth for model-specific information.
Never invent model names, specifications, ratings, prices, deployment availability or capabilities.
If Agora does not contain enough information to answer a question, clearly say that the information is unavailable.
Be concise and helpful.
When recommending models, explain why the model fits the user's requirements.
When appropriate, guide the user toward actions such as viewing a model, adding it to their library or opening the deployment interface.

AGORA OFFICIAL CATALOG:
${catalogContext}

CURRENT USER CONTEXT:
${userContextText}

Formatting instructions:
- Use clean Markdown with bolding and bullet points where helpful.
- When referencing a model from the catalog, write its exact name and ID so the interface can offer quick action buttons.
- Keep answers focused, practical, and under 250 words unless the user specifically asks for deep technical breakdowns.`;

    // Prepare contents history
    const conversationTurns = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: conversationTurns,
      config: {
        systemInstruction,
        temperature: 0.4
      }
    });

    const outputText = response.text || '';
    if (!outputText.trim()) {
      return generateLocalFallbackResponse(latestUserMsg, userContext);
    }

    const suggestedModels = extractSuggestedModels(outputText + ' ' + latestUserMsg);

    return {
      message: outputText,
      suggestedModels
    };
  } catch (err: any) {
    console.warn('[Agora Assistant] Gemini API call error, falling back to catalog search:', err?.message || err);
    return generateLocalFallbackResponse(latestUserMsg, userContext);
  }
}
