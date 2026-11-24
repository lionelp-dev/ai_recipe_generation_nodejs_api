import { DiscoverRecipeUseCase } from '../features/recipes/use_cases/discover_recipe_use_case.ts'
import { MEAL_TIME, type MealTime } from '../features/recipes/constants.ts'
import type { HttpContext } from '@adonisjs/core/http'
import z from 'zod'

const mealTimeSchema = z.enum(MEAL_TIME) satisfies z.ZodType<MealTime>

const discoveryRequestSchema = z.object({
  owner_id: z.number().int().positive().optional(),
  prompt: z.string().trim().min(3).max(5000),
  selected_meal_times: z.array(mealTimeSchema).max(4).default([]),
})

export default class RecipeDiscoveryController {
  async discover({ request, response }: HttpContext) {
    const parsed = discoveryRequestSchema.safeParse(request.all())
    if (!parsed.success) {
      return response.status(422).send({ errors: z.flattenError(parsed.error).fieldErrors })
    }

    return new DiscoverRecipeUseCase().execute({
      ownerId: parsed.data.owner_id,
      prompt: parsed.data.prompt,
      selectedMealTimes: parsed.data.selected_meal_times,
    })
  }
}
