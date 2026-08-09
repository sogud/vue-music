import { z } from 'zod'

type OpenRouterModel = {
  id?: string
  name?: string
  pricing?: {
    prompt?: string
    completion?: string
  }
}

const OAuthResponseSchema = z.object({
  key: z.string().optional(),
  error: z.string().optional(),
  message: z.string().optional()
})

const ModelsResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().optional(),
      pricing: z
        .object({
          prompt: z.string().optional(),
          completion: z.string().optional()
        })
        .optional()
    })
  ).optional()
})

export class OpenRouterService {
  async exchangeOAuthCode(input: { code: string; codeVerifier: string }) {
    const response = await fetch('https://openrouter.ai/api/v1/auth/keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: input.code,
        code_verifier: input.codeVerifier,
        code_challenge_method: 'S256'
      })
    })

    const payload = OAuthResponseSchema.parse(await response.json().catch(() => ({})))
    if (!response.ok || !payload.key) {
      throw new Error(payload.error || payload.message || 'OpenRouter OAuth exchange failed.')
    }
    return { key: payload.key }
  }

  async listFreeModels() {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        Accept: 'application/json'
      }
    })

    const payload = ModelsResponseSchema.parse(await response.json().catch(() => ({})))
    if (!response.ok || !Array.isArray(payload.data)) return { models: [] }

    const models = payload.data
      .filter((model: OpenRouterModel) => model.id && model.pricing?.prompt === '0' && model.pricing?.completion === '0')
      .map((model) => ({
        id: model.id as string,
        name: model.name || (model.id as string)
      }))

    return { models }
  }
}

export const openRouterService = new OpenRouterService()
