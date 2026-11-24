import type { RecipeNameGenerationInput } from '../contracts/recipe_discovery_contracts.ts'
import { createRecipeNamesOutputSchema } from '../contracts/recipe_discovery_contracts.ts'
import type { OpenRouterChatModelFactory } from './openrouter_chat_model_factory.ts'

const RECIPE_NAMES_SYSTEM_PROMPT =
  'Tu es un chef cuisinier. Propose exactement un nom de recette réaliste par demande, dans le même ordre. Tous les noms doivent être distincts : ne propose pas deux variantes quasiment identiques du même plat. Cherche une bonne diversité dans les plats, les ingrédients principaux, les cuisines et les méthodes de préparation. Chaque nom doit aussi être distinct des noms exclus. Le moment de repas de chaque demande est obligatoire : le nom proposé doit désigner une recette adaptée uniquement à ce moment.'

export class OpenRouterRecipeNameGenerator {
  constructor(private readonly modelFactory: OpenRouterChatModelFactory) {}

  async generate({ requests, excludedNames }: RecipeNameGenerationInput) {
    if (requests.length === 0) return []

    const response = await this.modelFactory
      .create()
      .withStructuredOutput(createRecipeNamesOutputSchema(requests.length), {
        method: 'jsonSchema',
        strict: true,
      })
      .invoke([
        { role: 'system', content: RECIPE_NAMES_SYSTEM_PROMPT },
        { role: 'user', content: recipeNamesPrompt(requests, excludedNames) },
      ])

    return response.names
  }
}

function recipeNamesPrompt(
  requests: RecipeNameGenerationInput['requests'],
  excludedNames: string[]
) {
  const formattedRequests = requests
    .map(
      (request, index) =>
        `${index + 1}. Demande : ${request.prompt}\nMoment de repas obligatoire et exclusif : ${request.requiredMealTimeSlug}`
    )
    .join('\n\n')

  return `Demandes :\n${formattedRequests}\n\nNoms exclus : ${excludedNames.join(', ') || 'aucun'}`
}
