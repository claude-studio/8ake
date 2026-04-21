import { z } from 'zod'

import type { Tables } from '@/shared/api/database.types'

export type RecipeComment = Tables<'recipe_comments'>

export const recipeCommentSchema = z.object({
  id: z.string(),
  recipe_id: z.string(),
  user_id: z.string(),
  content: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})
