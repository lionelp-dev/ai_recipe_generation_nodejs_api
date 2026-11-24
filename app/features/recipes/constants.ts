import env from '#start/env'

export const RECIPE_DISCOVERY_BATCH_SIZE = env.get('RECIPE_DISCOVERY_BATCH_SIZE')
export const RECIPE_DISCOVERY_MAX_CONCURRENCY = env.get('RECIPE_DISCOVERY_MAX_CONCURRENCY')
export const RECIPE_DISCOVERY_IMAGE_TIMEOUT_MS = env.get('RECIPE_DISCOVERY_IMAGE_TIMEOUT_MS')

export const MEAL_TIME = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINER: 'diner',
  SNACK: 'snack',
} as const

export type MealTime = (typeof MEAL_TIME)[keyof typeof MEAL_TIME]

export const RECIPE_METADATA = {
  ingredientCategories: [
    { id: 1, slug: 'fruits', name: 'Fruits' },
    { id: 2, slug: 'legumes-herbes-fraiches', name: 'Légumes et herbes fraîches' },
    { id: 3, slug: 'viandes', name: 'Viandes' },
    { id: 4, slug: 'charcuterie', name: 'Charcuterie' },
    { id: 5, slug: 'poissons-fruits-de-mer', name: 'Poissons et fruits de mer' },
    { id: 6, slug: 'oeufs', name: 'Œufs' },
    { id: 7, slug: 'produits-laitiers', name: 'Produits laitiers' },
    { id: 8, slug: 'alternatives-vegetales', name: 'Alternatives végétales' },
    { id: 9, slug: 'pains-produits-boulangerie', name: 'Pains et produits de boulangerie' },
    { id: 10, slug: 'pates-riz-cereales', name: 'Pâtes, riz et céréales' },
    { id: 11, slug: 'legumineuses', name: 'Légumineuses' },
    { id: 12, slug: 'farines-aides-patisserie', name: 'Farines et aides à la pâtisserie' },
    { id: 13, slug: 'noix-graines-fruits-secs', name: 'Noix, graines et fruits secs' },
    { id: 14, slug: 'conserves-bocaux', name: 'Conserves et bocaux' },
    { id: 15, slug: 'huiles-vinaigres', name: 'Huiles et vinaigres' },
    { id: 16, slug: 'sauces-condiments', name: 'Sauces et condiments' },
    { id: 17, slug: 'herbes-sechees-epices', name: 'Herbes séchées et épices' },
    { id: 18, slug: 'epicerie-salee', name: 'Épicerie salée' },
    { id: 19, slug: 'epicerie-sucree', name: 'Épicerie sucrée' },
    { id: 20, slug: 'produits-surgeles', name: 'Produits surgelés' },
    { id: 21, slug: 'boissons', name: 'Boissons' },
    { id: 22, slug: 'produits-prepares', name: 'Produits préparés' },
    { id: 23, slug: 'autres', name: 'Autres' },
  ],
  mealTimes: [
    { id: 1, slug: MEAL_TIME.BREAKFAST, name: 'Petit-déjeuner' },
    { id: 2, slug: MEAL_TIME.LUNCH, name: 'Déjeuner' },
    { id: 3, slug: MEAL_TIME.DINER, name: 'Dîner' },
    { id: 4, slug: MEAL_TIME.SNACK, name: 'Collation' },
  ],
}
