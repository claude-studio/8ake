import * as z from 'zod'

export const SOURCE_TYPES_WITH_URL = ['youtube', 'blog', 'book'] as const

export const RecipeSchema = z.object({
  name: z.string().min(1, '메뉴명을 입력해주세요'),
  source_type: z.enum(['youtube', 'blog', 'book', 'etc'], '출처를 선택해주세요'),
  source_url: z.string().optional().nullable(),
  oven_temp: z.coerce
    .number({ error: '오븐 온도를 입력해주세요' })
    .min(1, '오븐 온도를 입력해주세요'),
  bake_time: z.coerce
    .number({ error: '굽는 시간을 입력해주세요' })
    .min(1, '굽는 시간을 입력해주세요'),
  quantity: z.coerce.number({ error: '분량을 입력해주세요' }).min(1, '분량을 입력해주세요'),
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
        unit: z.enum(['개', 'g', '직접입력']).default('g'),
      })
    )
    .min(1, '재료를 1개 이상 입력해주세요'),
})

export const RecipeSchemaRefined = RecipeSchema.superRefine((data, ctx) => {
  if (
    SOURCE_TYPES_WITH_URL.includes(data.source_type as (typeof SOURCE_TYPES_WITH_URL)[number]) &&
    !data.source_url?.trim()
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '출처 URL을 입력해주세요',
      path: ['source_url'],
    })
  }
})

// input: form field values (z.coerce fields are unknown in v4)
// output: validated/transformed values (number for coerce fields)
export type RecipeFormValues = z.input<typeof RecipeSchema>
export type RecipeFormOutput = z.output<typeof RecipeSchema>
