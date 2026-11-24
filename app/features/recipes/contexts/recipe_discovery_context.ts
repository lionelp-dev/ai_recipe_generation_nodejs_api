import type { RecipeMetadata } from '../contracts/recipe_discovery_contracts.ts'
import { recipeMetadataSchema } from '../contracts/recipe_discovery_contracts.ts'
import z from 'zod'
import type { OpenRouterRecipeImageGenerator } from '../services/openrouter_recipe_image_generator.ts'
import type { OpenRouterRecipeGenerator } from '../services/openrouter_recipe_generator.ts'

export type RecipeContentDiscoveryContext = {
  recipeMetadata: RecipeMetadata
  recipeGenerator: OpenRouterRecipeGenerator
  imageGenerator: OpenRouterRecipeImageGenerator
}

export const RecipeContentDiscoveryContextSchema = z.object({
  recipeMetadata: recipeMetadataSchema,
  recipeGenerator: z.custom<OpenRouterRecipeGenerator>(),
  imageGenerator: z.custom<OpenRouterRecipeImageGenerator>(),
})
