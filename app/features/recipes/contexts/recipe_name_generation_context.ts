import z from 'zod'
import type { DirectRecipeNameRepository } from '../repositories/direct_recipe_name_repository.ts'
import type { OpenRouterRecipeNameGenerator } from '../services/openrouter_recipe_name_generator.ts'

export type RecipeNameGenerationContext = {
  ownerId?: number
  recipeNameGenerator: OpenRouterRecipeNameGenerator
  recipeRepository: DirectRecipeNameRepository
}

export const RecipeNameGenerationContextSchema = z.object({
  ownerId: z.number().int().positive().optional(),
  recipeNameGenerator: z.custom<OpenRouterRecipeNameGenerator>(),
  recipeRepository: z.custom<DirectRecipeNameRepository>(),
})
