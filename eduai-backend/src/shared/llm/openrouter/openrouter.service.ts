import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

type OpenRouterChatJsonArgs = {
  messages: ChatCompletionMessageParam[];
  model?: string;
  temperature?: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterMs(value: string | null): number | null {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, Math.floor(seconds * 1000));
  const dateMs = Date.parse(value);
  if (!Number.isFinite(dateMs)) return null;
  return Math.max(0, dateMs - Date.now());
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

@Injectable()
export class OpenRouterService {
  private readonly provider: 'openrouter' | 'groq';
  private readonly baseURL: string;
  private readonly defaultHeaders: Record<string, string> | undefined;
  private readonly defaultModel: string;
  private readonly maxTokens: number;
  private readonly debugRaw: boolean;

  constructor(private readonly configService: ConfigService) {
    const providerOverride =
      this.configService.get<string>('LLM_PROVIDER')?.trim().toLowerCase() ||
      this.configService.get<string>('AI_PROVIDER')?.trim().toLowerCase();

    const openrouterApiKey = this.configService
      .get<string>('OPENROUTER_API_KEY')
      ?.trim();
    const groqApiKey = this.configService.get<string>('GROQ_API_KEY')?.trim();

    this.provider =
      providerOverride === 'groq' || providerOverride === 'openrouter'
        ? providerOverride
        : openrouterApiKey
          ? 'openrouter'
          : groqApiKey
            ? 'groq'
            : 'openrouter';

    const openrouterBaseURL =
      this.configService.get<string>('OPENROUTER_BASE_URL')?.trim() ||
      'https://openrouter.ai/api/v1';
    const groqBaseURL =
      this.configService.get<string>('GROQ_BASE_URL')?.trim() ||
      'https://api.groq.com/openai/v1';

    this.baseURL = this.provider === 'groq' ? groqBaseURL : openrouterBaseURL;

    const defaultHeaders: Record<string, string> = {};
    if (this.provider === 'openrouter') {
      const httpReferer = this.configService
        .get<string>('OPENROUTER_HTTP_REFERER')
        ?.trim();
      const appTitle = this.configService
        .get<string>('OPENROUTER_APP_TITLE')
        ?.trim();

      if (httpReferer) defaultHeaders['HTTP-Referer'] = httpReferer;
      if (appTitle) defaultHeaders['X-OpenRouter-Title'] = appTitle;
    }

    this.defaultHeaders = Object.keys(defaultHeaders).length
      ? defaultHeaders
      : undefined;

    const openrouterModel = this.configService
      .get<string>('OPENROUTER_MODEL')
      ?.trim();
    const groqModel = this.configService.get<string>('GROQ_MODEL')?.trim();

    const envModel =
      this.provider === 'groq'
        ? groqModel || openrouterModel
        : openrouterModel || groqModel;

    // 2. Agar .env me nahi mila toh fallback default model lagaya
    this.defaultModel = envModel || '~openai/gpt-latest';

    this.debugRaw =
      this.configService.get<string>('LLM_DEBUG')?.trim() === '1' ||
      this.configService.get<string>('DEBUG_LLM')?.trim() === '1';

    const maxTokensRaw =
      this.configService.get<string>('LLM_MAX_TOKENS')?.trim() ||
      (this.provider === 'groq'
        ? this.configService.get<string>('GROQ_MAX_TOKENS')?.trim()
        : this.configService.get<string>('OPENROUTER_MAX_TOKENS')?.trim());
    const maxTokensParsed = maxTokensRaw ? Number(maxTokensRaw) : NaN;
    this.maxTokens = Number.isFinite(maxTokensParsed)
      ? Math.max(1, Math.floor(maxTokensParsed))
      : this.provider === 'openrouter'
        ? 700
        : 786;

    // 🔥 🚀 AAPKA CONSOLE LOG YAHAN HAI:
    console.log('====================================');
    console.log(
      `📡 [LLM:${this.provider}] .env Model Value: "${envModel || 'NOT_FOUND_IN_ENV'}"`,
    );
    console.log(
      `🛠️ [LLM:${this.provider}] Final Default Model Set To: "${this.defaultModel}"`,
    );
    console.log(
      `🎛️ [LLM:${this.provider}] Max tokens set to: ${this.maxTokens}`,
    );
    console.log(
      `🔎 [LLM:${this.provider}] Raw logging: ${this.debugRaw ? 'ON' : 'OFF'}`,
    );
    console.log('====================================');
  }

  async chatJson({ messages, model, temperature }: OpenRouterChatJsonArgs) {
    const apiKey =
      this.provider === 'groq'
        ? this.configService.get<string>('GROQ_API_KEY')?.trim()
        : this.configService.get<string>('OPENROUTER_API_KEY')?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException(
        this.provider === 'groq'
          ? 'AI is not configured (missing GROQ_API_KEY)'
          : 'AI is not configured (missing OPENROUTER_API_KEY)',
      );
    }

    const client = new OpenAI({
      apiKey,
      baseURL: this.baseURL,
      defaultHeaders: this.defaultHeaders,
      fetch: async (url, init) => {
        const res = await fetch(url, init);
        const contentType = res.headers.get('content-type') ?? '';
        if (
          contentType.trim() !== '' &&
          !contentType.toLowerCase().includes('application/json')
        ) {
          if (this.debugRaw) {
            console.warn(
              `[LLM:${this.provider}] Non-JSON content-type from provider: ${contentType}`,
            );
          }
          throw new Error(
            `Provider returned non-JSON content-type: ${contentType}`,
          );
        }
        return res;
      },
    });

    // 🚀 EK CONSOLE YAHAN BHI LAGA DIYA: Taki jab API call hit ho, toh pata chale actual me kaun sa model call ho raha hai (kyuki argument me bhi model aa sakta hai)
    const finalModelToCall = model?.trim() || this.defaultModel;
    console.log(
      `🚀 [LLM:${this.provider}] Making API call using model: "${finalModelToCall}"`,
    );

    const maxAttempts = clamp(
      Number(this.configService.get<string>('LLM_RETRY_ATTEMPTS') ?? 4),
      1,
      8,
    );
    const baseDelayMs = clamp(
      Number(this.configService.get<string>('LLM_RETRY_BASE_DELAY_MS') ?? 400),
      50,
      10_000,
    );

    let lastError: unknown = undefined;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const completion = await client.chat.completions.create({
          model: finalModelToCall,
          messages,
          temperature,
          response_format: { type: 'json_object' },
          max_tokens: this.maxTokens,
        });

        if (this.debugRaw) {
          const debugChoice = completion.choices?.[0];
          console.log(
            `[LLM:${this.provider}] Raw choice[0] (debug): ${JSON.stringify(
              debugChoice,
            ).slice(0, 4000)}`,
          );
        }

        const text = completion.choices[0]?.message?.content;
        if (!text || text.trim().length === 0) {
          throw new ServiceUnavailableException(
            `Empty response from ${this.provider}`,
          );
        }

        const trimmed = text.trim();
        const startsLikeJson =
          trimmed.startsWith('{') || trimmed.startsWith('[');
        const looksLikeCodeFence =
          trimmed.startsWith('```') || trimmed.includes('```');
        if (!startsLikeJson || looksLikeCodeFence) {
          if (this.debugRaw) {
            console.warn(
              `[LLM:${this.provider}] Non-JSON content (debug): ${trimmed.slice(
                0,
                2000,
              )}`,
            );
          }
          throw new ServiceUnavailableException(
            `${this.provider} returned non-JSON content`,
          );
        }

        try {
          return JSON.parse(trimmed) as unknown;
        } catch {
          if (this.debugRaw) {
            console.warn(
              `[LLM:${this.provider}] Invalid JSON content (debug): ${trimmed.slice(
                0,
                2000,
              )}`,
            );
          }
          throw new ServiceUnavailableException(
            `${this.provider} returned invalid JSON`,
          );
        }
      } catch (error: unknown) {
        lastError = error;

        const status =
          typeof (error as { status?: unknown })?.status === 'number'
            ? (error as { status: number }).status
            : undefined;
        const headers =
          (error as { headers?: Headers | undefined })?.headers ?? undefined;
        const retryAfterMs = parseRetryAfterMs(
          headers?.get('retry-after') ?? null,
        );

        const retryableStatus =
          status === 429 || status === 502 || status === 503;
        const retryableConnection =
          status === undefined &&
          error instanceof Error &&
          /Connection error|Request timed out|fetch/i.test(error.message);

        const shouldRetry =
          attempt < maxAttempts && (retryableStatus || retryableConnection);

        if (!shouldRetry) break;

        const backoffMs =
          retryAfterMs ??
          Math.floor(
            baseDelayMs * Math.pow(2, attempt - 1) +
              Math.random() * baseDelayMs,
          );

        if (this.debugRaw) {
          console.warn(
            `[LLM:${this.provider}] Retryable error (attempt ${attempt}/${maxAttempts})` +
              `${status ? ` status=${status}` : ''}; waiting ${backoffMs}ms`,
          );
        }

        await sleep(backoffMs);
      }
    }

    if (this.debugRaw && lastError) {
      console.warn(
        `[LLM:${this.provider}] Final failure (debug): ${
          lastError instanceof Error ? lastError.message : String(lastError)
        }`,
      );
    }

    throw new ServiceUnavailableException(
      'AI service temporarily unavailable. Please try again.',
    );
  }
}
