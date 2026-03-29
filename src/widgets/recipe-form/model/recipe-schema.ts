import * as z from 'zod'

export const RecipeSchema = z.object({
  name: z.string().min(1, '메뉴명을 입력해주세요'),
  source_type: z.enum(['youtube', 'blog', 'book', 'etc'], {
    required_error: '출처를 선택해주세요',
  }),
  source_url: z.string().optional(),
  oven_temp: z.coerce
    .number({ invalid_type_error: '오븐 온도를 입력해주세요' })
    .min(1, '오븐 온도를 입력해주세요'),
  bake_time: z.coerce
    .number({ invalid_type_error: '굽는 시간을 입력해주세요' })
    .min(1, '굽는 시간을 입력해주세요'),
  quantity: z.coerce
    .number({ invalid_type_error: '분량을 입력해주세요' })
    .min(1, '분량을 입력해주세요'),
  preheat_temp: z.coerce.number().optional(),
  preheat_time: z.coerce.number().optional(),
  steps: z.string().min(1, '만드는 법을 입력해주세요'),
  memo: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean(),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1, '재료명을 입력해주세요'),
        amount: z.string().min(1, '양을 입력해주세요'),
      })
    )
    .min(1, '재료를 1개 이상 입력해주세요'),
})

export type RecipeFormValues = z.infer<typeof RecipeSchema>
