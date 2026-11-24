import { END, START, StateGraph } from '@langchain/langgraph'
import { RECIPE_DISCOVERY_BATCH_SIZE } from '../constants.ts'
import { RecipeNameGenerationContextSchema } from '../contexts/recipe_name_generation_context.ts'
import { checkRecipeNamesDuplicates } from '../node/check_recipe_names_duplicates_node.ts'
import { generateRecipeNames } from '../node/generate_recipe_names_node.ts'
import { RecipeNameGenerationState } from '../state/recipe_name_generation_state.ts'

export const recipeNameGenerationGraph = new StateGraph({
  state: RecipeNameGenerationState,
  context: RecipeNameGenerationContextSchema,
})
  .addNode('generate_recipe_names', generateRecipeNames)
  .addNode('check_recipe_names_duplicates', checkRecipeNamesDuplicates)
  .addEdge(START, 'generate_recipe_names')
  .addEdge('generate_recipe_names', 'check_recipe_names_duplicates')
  .addConditionalEdges(
    'check_recipe_names_duplicates',
    (state) => {
      if (state.acceptedRecipeNameResults.length === RECIPE_DISCOVERY_BATCH_SIZE) {
        return END
      }
      return 'generate_recipe_names'
    },
    ['generate_recipe_names', END]
  )
  .compile()
