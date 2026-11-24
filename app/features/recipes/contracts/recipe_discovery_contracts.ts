import type { createRecipeStoreRequestSchema } from '../../../data/request/recipe/schemas/recipe_store.request.schema.ts'
import z from 'zod'

export const recipeMetadataSchema = z.object({
  ingredientCategories: z.array(z.object({ id: z.number(), slug: z.string(), name: z.string() })),
  mealTimes: z.array(z.object({ id: z.number(), slug: z.string() })),
})

export type RecipeMetadata = z.infer<typeof recipeMetadataSchema>

export const recipeNameRequestSchema = z.object({
  prompt: z.string(),
  requiredMealTimeSlug: z.string().trim().min(1),
})

export type RecipeNameRequest = z.infer<typeof recipeNameRequestSchema>

export const recipeNameResultSchema = recipeNameRequestSchema.extend({
  name: z.string().trim().min(1).max(255),
})

export type RecipeNameResult = z.infer<typeof recipeNameResultSchema>

export const recipeNameGenerationInputSchema = z.object({
  requests: z.array(recipeNameRequestSchema),
  excludedNames: z.array(z.string()),
})

export type RecipeNameGenerationInput = z.infer<typeof recipeNameGenerationInputSchema>

export const createRecipeNamesOutputSchema = (expectedCount: number) =>
  z.object({ names: z.array(z.string().trim().min(1).max(255)).length(expectedCount) })

export type RecipeContentGenerationInput = {
  prompt: string
  name: string
  recipeMetadata: RecipeMetadata
}

export type GeneratedRecipeDraft = z.output<ReturnType<typeof createRecipeStoreRequestSchema>>

export type GeneratedRecipe = {
  name: string
  description: string
  serving_size: number
  preparation_time: number
  cooking_time: number
  meal_times: Array<{ id: number; slug: string }>
  ingredients: Array<{ name: string; quantity: number; unit: string; category_id: number }>
  steps: Array<{ order: number; description: string }>
  tags: Array<{ name: string }>
  image_data_url: string | null
}
