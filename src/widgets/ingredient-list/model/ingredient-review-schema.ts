import * as z from 'zod'

export const IngredientSchema = z.object({
  name: z.string().min(1, '재료명을 입력해주세요'),
})

export const IngredientReviewSchema = z.object({
  purchase_place: z.string().optional(),
  score: z.number().min(1).max(5),
  memo: z.string().optional(),
})

export type IngredientFormValues = z.infer<typeof IngredientSchema>
export type IngredientReviewFormValues = z.infer<typeof IngredientReviewSchema>
