import { END, START, StateGraph } from '@langchain/langgraph'
import { RecipeContentDiscoveryContextSchema } from '../contexts/recipe_discovery_context.ts'
import { generateImage } from '../node/generate_image_node.ts'
import { generateRecipe } from '../node/generate_recipe_node.ts'
import { RecipeContentDiscoveryState } from '../state/recipe_discovery_state.ts'

export const recipeContentDiscoveryGraph = new StateGraph({
  state: RecipeContentDiscoveryState,
  context: RecipeContentDiscoveryContextSchema,
})
  .addNode('generate_recipe', generateRecipe)
  .addNode('generate_image', generateImage)
  .addEdge(START, 'generate_recipe')
  .addEdge('generate_recipe', 'generate_image')
  .addEdge('generate_image', END)
  .compile()
