import { z } from 'zod'

export const recipeCommentSchema = z.object({
  id: z.string(),
  recipe_id: z.string(),
  user_id: z.string(),
  content: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  author_email: z.string().nullable(),
})

export type RecipeComment = z.infer<typeof recipeCommentSchema>
