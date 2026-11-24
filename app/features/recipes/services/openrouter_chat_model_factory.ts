import { ChatOpenRouter } from '@langchain/openrouter'

export class OpenRouterChatModelFactory {
  create() {
    return new ChatOpenRouter({ model: 'openai/gpt-4o-mini', temperature: 0.8 })
  }
}
