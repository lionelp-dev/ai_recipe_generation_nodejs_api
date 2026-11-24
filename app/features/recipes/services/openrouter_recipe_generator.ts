import { createRecipeStoreRequestSchema } from '../../../data/request/recipe/schemas/recipe_store.request.schema.ts'
import type { RecipeContentGenerationInput } from '../contracts/recipe_discovery_contracts.ts'
import type { OpenRouterChatModelFactory } from './openrouter_chat_model_factory.ts'

export class OpenRouterRecipeGenerator {
  constructor(private readonly modelFactory: OpenRouterChatModelFactory) {}

  async generate({ prompt, name, recipeMetadata }: RecipeContentGenerationInput) {
    const schema = createRecipeStoreRequestSchema({
      ingredient_categories: recipeMetadata.ingredientCategories,
      meal_times: recipeMetadata.mealTimes,
    })
    const response = await this.modelFactory
      .create()
      .withStructuredOutput(schema, { method: 'jsonSchema', strict: true })
      .invoke([
        { role: 'system', content: recipeSystemPrompt(recipeMetadata) },
        { role: 'user', content: `Demande : ${prompt}\nNom imposé : ${name}` },
      ])

    return schema.parse(response)
  }
}

function recipeSystemPrompt(recipeMetadata: RecipeContentGenerationInput['recipeMetadata']) {
  return `Tu es un chef cuisinier expert. Génère une recette complète et réaliste pour le nom fourni.
Respecte strictement le schéma. Le nom doit correspondre exactement au nom demandé.
Catégories autorisées : ${recipeMetadata.ingredientCategories.map((category) => `${category.id}: ${category.name}`).join(', ')}.
Moments de repas autorisés : ${recipeMetadata.mealTimes.map((mealTime) => mealTime.slug).join(', ')}.
Les moments de repas sont une contrainte métier, jamais une simple étiquette : la recette doit concrètement convenir à au moins l’un de ceux autorisés. Adapte le type de plat, les ingrédients et les portions, puis n’associe que les moments pour lesquels elle est réellement adaptée.
L'image et image_data_url doivent être null.`
}
