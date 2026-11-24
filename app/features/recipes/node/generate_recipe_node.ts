import type { GraphNode } from '@langchain/langgraph'
import type { RecipeContentDiscoveryContext } from '../contexts/recipe_discovery_context.ts'
import { type RecipeContentDiscoveryState } from '../state/recipe_discovery_state.ts'

export const generateRecipe: GraphNode<
  typeof RecipeContentDiscoveryState,
  RecipeContentDiscoveryContext
> = async (state, runtime) => {
  const recipeMetadata = runtime.context!.recipeMetadata
  const recipeMetadataForGeneration = state.requiredMealTimeSlug
    ? {
        ...recipeMetadata,
        mealTimes: recipeMetadata.mealTimes.filter(
          (mealTime) => mealTime.slug === state.requiredMealTimeSlug
        ),
      }
    : recipeMetadata

  if (recipeMetadataForGeneration.mealTimes.length === 0) {
    throw new Error('Le moment de repas imposé est absent du catalogue.')
  }

  const generatedRecipeDraft = await runtime.context!.recipeGenerator.generate({
    prompt: state.prompt,
    name: state.generatedRecipeName,
    recipeMetadata: recipeMetadataForGeneration,
  })
  const mealTimeIdBySlug = new Map(
    recipeMetadataForGeneration.mealTimes.map((mealTime) => [mealTime.slug, mealTime.id])
  )
  const { meal_times: mealTimes, ...recipe } = generatedRecipeDraft

  return {
    generatedRecipe: {
      ...recipe,
      meal_times: mealTimes.map((mealTime) => ({
        id: mealTimeIdBySlug.get(mealTime.slug)!,
        slug: mealTime.slug,
      })),
    },
  }
}
