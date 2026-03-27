import * as z from 'zod'

export const ReviewSchema = z.object({
  date: z.string().min(1, '날짜를 선택해주세요'),
  total_score: z.number().min(1).max(5),
  taste: z.number().min(1).max(5),
  storability: z.number().min(1).max(5),
  recipe_simplicity: z.number().min(1).max(5),
  ingredient_availability: z.number().min(1).max(5),
  texture: z.number().min(1).max(5),
  comment: z.string().optional(),
  storage_memo: z.string().optional(),
})

export type ReviewFormValues = z.infer<typeof ReviewSchema>
