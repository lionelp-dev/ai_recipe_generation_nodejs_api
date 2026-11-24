/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  recipeDiscovery: {
    discover: typeof routes['recipe_discovery.discover']
  }
}
