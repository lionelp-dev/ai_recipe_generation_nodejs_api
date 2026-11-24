import { StateSchema } from '@langchain/langgraph'
import z from 'zod'
import {
  recipeNameRequestSchema,
  recipeNameResultSchema,
} from '../contracts/recipe_discovery_contracts.ts'

export const RecipeNameGenerationState = new StateSchema({
  pendingRecipeNameRequests: z.array(recipeNameRequestSchema).default([]),
  generatedRecipeNameResults: z.array(recipeNameResultSchema).default([]),
  acceptedRecipeNameResults: z.array(recipeNameResultSchema).default([]),
  excludedRecipeNames: z.array(z.string()).default([]),
})
