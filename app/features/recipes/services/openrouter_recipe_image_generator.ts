import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { RECIPE_DISCOVERY_IMAGE_TIMEOUT_MS } from '../constants.ts'

interface OpenRouterImageResponse {
  data?: { b64_json?: string }[]
}

type OpenRouterRecipeImageGeneratorOptions = {
  apiKey?: string
  baseUrl?: string
  model?: string
  timeoutMs?: number
  fetch?: typeof fetch
}

export class OpenRouterRecipeImageGenerator {
  private readonly baseUrl: string
  private readonly model: string
  private readonly apiKey: string | undefined
  private readonly timeoutMs: number
  private readonly request: typeof fetch
  private readonly imageOptions: {
    size: string
    quality: 'low' | 'medium' | 'high'
    output_format: 'jpeg' | 'png' | 'webp'
    output_compression: number
  }

  constructor(options: OpenRouterRecipeImageGeneratorOptions = {}) {
    this.baseUrl = options.baseUrl ?? env.get('OPENROUTER_BASE_URL')
    this.model = options.model ?? env.get('OPENROUTER_IMAGE_MODEL')
    this.apiKey = options.apiKey ?? env.get('OPENROUTER_API_KEY')
    this.timeoutMs = options.timeoutMs ?? RECIPE_DISCOVERY_IMAGE_TIMEOUT_MS
    this.request = options.fetch ?? fetch
    this.imageOptions = {
      size: env.get('OPENROUTER_IMAGE_SIZE'),
      quality: env.get('OPENROUTER_IMAGE_QUALITY'),
      output_format: env.get('OPENROUTER_IMAGE_OUTPUT_FORMAT'),
      output_compression: env.get('OPENROUTER_IMAGE_OUTPUT_COMPRESSION'),
    }
  }

  async generateDataUrl(name: string): Promise<string | null> {
    if (!this.apiKey) {
      logger.warn(
        { recipeName: name },
        'Recipe image generation skipped: OpenRouter API key is missing'
      )
      return null
    }

    const startedAt = performance.now()
    const context = { recipeName: name, model: this.model }
    const logContext = (extra: Record<string, unknown> = {}) => ({
      ...context,
      ...extra,
      durationMs: Math.round(performance.now() - startedAt),
    })
    const signal = AbortSignal.timeout(this.timeoutMs)

    logger.info(context, 'Recipe image generation started')

    try {
      const response = await this.request(`${this.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal,
        body: JSON.stringify({
          model: this.model,
          prompt: this.instructions(name),
          n: 1,
          ...this.imageOptions,
        }),
      })

      if (!response.ok) {
        const errorResponse = await response.text()
        const errorBody = errorResponse.trim().slice(0, 1_000)

        logger.warn(
          logContext({
            status: response.status,
            requestId: response.headers.get('x-request-id'),
            generationId: response.headers.get('x-generation-id'),
            retryAfter: response.headers.get('retry-after'),
            errorBody: errorBody || undefined,
          }),
          'Recipe image generation failed'
        )
        return null
      }

      const json = (await response.json()) as OpenRouterImageResponse
      const b64Json = json.data?.[0]?.b64_json

      if (!b64Json) {
        logger.warn(
          logContext({ status: response.status }),
          'Recipe image generation returned no image data'
        )
        return null
      }

      logger.info(logContext({ status: response.status }), 'Recipe image generation completed')

      return `data:image/${this.imageOptions.output_format};base64,${b64Json}`
    } catch (error) {
      logger.warn(
        logContext(signal.aborted ? { timeoutMs: this.timeoutMs } : { err: error }),
        signal.aborted
          ? 'Recipe image generation timed out'
          : 'Recipe image generation request errored'
      )
      return null
    }
  }

  private instructions(name: string): string {
    return (
      `A professional food photography of ${name}, appetizing presentation, ` +
      'high quality, well-lit, centered on a clean white plate, neutral background, ' +
      'culinary magazine style, realistic, detailed, ' +
      'no text, no typography, no letters, no words, no labels, no logos, no watermark'
    )
  }
}
