import {
  RECIPE_DISCOVERY_BATCH_SIZE,
  RECIPE_DISCOVERY_MAX_CONCURRENCY,
  RECIPE_METADATA,
  type MealTime,
} from '../constants.ts'
import type { GeneratedRecipe, RecipeNameRequest } from '../contracts/recipe_discovery_contracts.ts'
import { recipeContentDiscoveryGraph } from '../graphs/recipe_discovery_graph.ts'
import { recipeNameGenerationGraph } from '../graphs/recipe_name_generation_graph.ts'
import { DirectRecipeNameRepository } from '../repositories/direct_recipe_name_repository.ts'
import { OpenRouterRecipeImageGenerator } from '../services/openrouter_recipe_image_generator.ts'
import { OpenRouterChatModelFactory } from '../services/openrouter_chat_model_factory.ts'
import { OpenRouterRecipeGenerator } from '../services/openrouter_recipe_generator.ts'
import { OpenRouterRecipeNameGenerator } from '../services/openrouter_recipe_name_generator.ts'
import logger from '@adonisjs/core/services/logger'

export type DiscoveredRecipe = GeneratedRecipe & {
  image_data_url: string | null
  image_generation_failed: boolean
}

export class DiscoverRecipeUseCase {
  private readonly modelFactory = new OpenRouterChatModelFactory()
  private readonly recipeNameGenerator = new OpenRouterRecipeNameGenerator(this.modelFactory)
  private readonly recipeGenerator = new OpenRouterRecipeGenerator(this.modelFactory)
  private readonly recipeImageGenerator = new OpenRouterRecipeImageGenerator()

  async execute({
    ownerId,
    prompt,
    selectedMealTimes,
  }: {
    ownerId?: number
    prompt: string
    selectedMealTimes: MealTime[]
  }) {
    const recipeNameGenerationResult = await recipeNameGenerationGraph.invoke(
      { pendingRecipeNameRequests: this.buildRecipeNameRequests(prompt, selectedMealTimes) },
      {
        context: {
          ownerId,
          recipeNameGenerator: this.recipeNameGenerator,
          recipeRepository: new DirectRecipeNameRepository(),
        },
      }
    )

    const namedRecipeCandidates = recipeNameGenerationResult.acceptedRecipeNameResults
    if (namedRecipeCandidates.length !== RECIPE_DISCOVERY_BATCH_SIZE) {
      throw new Error('Le batch de noms de recettes est incomplet.')
    }

    const recipeContentGenerationResults = await recipeContentDiscoveryGraph.batch(
      namedRecipeCandidates.map((candidate) => ({
        prompt: candidate.prompt,
        generatedRecipeName: candidate.name,
        requiredMealTimeSlug: candidate.requiredMealTimeSlug,
      })),
      {
        maxConcurrency: RECIPE_DISCOVERY_MAX_CONCURRENCY,
        context: {
          recipeGenerator: this.recipeGenerator,
          imageGenerator: this.recipeImageGenerator,
          recipeMetadata: RECIPE_METADATA,
        },
      },
      { returnExceptions: true }
    )

    const discoveredRecipes = this.collectDiscoveredRecipes(ownerId, recipeContentGenerationResults)

    return {
      recipes: discoveredRecipes,
      failedRecipeCount: RECIPE_DISCOVERY_BATCH_SIZE - discoveredRecipes.length,
    }
  }

  private buildRecipeNameRequests(
    prompt: string,
    selectedMealTimes: MealTime[]
  ): RecipeNameRequest[] {
    return Array.from({ length: RECIPE_DISCOVERY_BATCH_SIZE }, (_, position) => {
      let mealTime: MealTime | undefined
      mealTime =
        selectedMealTimes.length > 0
          ? selectedMealTimes[position % selectedMealTimes.length]
          : RECIPE_METADATA.mealTimes[Math.floor(Math.random() * RECIPE_METADATA.mealTimes.length)]
              ?.slug

      if (!mealTime) throw new Error('Le catalogue des moments de repas est vide.')

      return {
        prompt,
        requiredMealTimeSlug: mealTime,
      }
    })
  }

  private collectDiscoveredRecipes(
    ownerId: number | undefined,
    recipeContentGenerationResults: Awaited<ReturnType<typeof recipeContentDiscoveryGraph.batch>>
  ): DiscoveredRecipe[] {
    const discoveredRecipes: DiscoveredRecipe[] = []
    for (const [index, result] of recipeContentGenerationResults.entries()) {
      if (result instanceof Error) {
        logger.error(
          { err: result, ownerId, request: index + 1 },
          'Recipe content generation request failed'
        )
        continue
      }

      if (!result.generatedRecipe) {
        logger.error(
          { ownerId, request: index + 1 },
          'Recipe content generation request completed without a recipe'
        )
        continue
      }

      if (result.imageGenerationFailed) {
        logger.warn(
          { ownerId, request: index + 1, recipeName: result.generatedRecipe.name },
          'Recipe content generation request excluded because image generation failed'
        )
        continue
      }

      discoveredRecipes.push({
        ...result.generatedRecipe,
        image_data_url: result.imageDataUrl,
        image_generation_failed: result.imageGenerationFailed,
      })
    }

    return discoveredRecipes
  }
}
