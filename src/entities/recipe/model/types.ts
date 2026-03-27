import type { Tables } from '@/shared/api/database.types'

export type Recipe = Tables<'recipes'>
export type RecipeIngredient = Tables<'recipe_ingredients'>
export type RecipePhoto = Tables<'recipe_photos'>

export interface RecipeWithDetails extends Recipe {
  recipe_ingredients: RecipeIngredient[]
  recipe_photos: RecipePhoto[]
}
