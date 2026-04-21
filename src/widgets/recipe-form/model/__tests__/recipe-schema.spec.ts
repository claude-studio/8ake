import { describe, expect, it } from 'vitest'

import { RecipeSchema, RecipeSchemaRefined } from '../recipe-schema'

const validIngredient = { name: '버터', amount: '100', unit: 'g' as const }

const validInput = {
  name: '초코 쿠키',
  source_type: 'youtube' as const,
  source_url: 'https://youtube.com/watch?v=abc',
  oven_temp: '180',
  bake_time: '15',
  quantity: '20',
  preheat_temp: '',
  preheat_time: '',
  steps: '1. 재료를 섞는다. 2. 굽는다.',
  memo: '맛있다',
  tags: ['쿠키'],
  is_public: true,
  ingredients: [validIngredient],
}

describe('RecipeSchema', () => {
  it('유효한 입력은 파싱 성공', () => {
    const result = RecipeSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('name 누락 시 에러', () => {
    const result = RecipeSchema.safeParse({ ...validInput, name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0])
      expect(paths).toContain('name')
    }
  })

  it('source_type 잘못된 값 시 에러', () => {
    const result = RecipeSchema.safeParse({ ...validInput, source_type: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('oven_temp 0 이하 시 에러', () => {
    const result = RecipeSchema.safeParse({ ...validInput, oven_temp: '0' })
    expect(result.success).toBe(false)
  })

  it('bake_time 누락(0) 시 에러', () => {
    const result = RecipeSchema.safeParse({ ...validInput, bake_time: '0' })
    expect(result.success).toBe(false)
  })

  it('quantity 누락(0) 시 에러', () => {
    const result = RecipeSchema.safeParse({ ...validInput, quantity: '0' })
    expect(result.success).toBe(false)
  })

  it('steps 빈 문자열 시 에러', () => {
    const result = RecipeSchema.safeParse({ ...validInput, steps: '' })
    expect(result.success).toBe(false)
  })

  it('ingredients 빈 배열 시 에러', () => {
    const result = RecipeSchema.safeParse({ ...validInput, ingredients: [] })
    expect(result.success).toBe(false)
  })

  it('ingredient name 빈 문자열 시 에러', () => {
    const result = RecipeSchema.safeParse({
      ...validInput,
      ingredients: [{ name: '', amount: '100', unit: 'g' as const }],
    })
    expect(result.success).toBe(false)
  })

  it('ingredient amount 빈 문자열 시 에러', () => {
    const result = RecipeSchema.safeParse({
      ...validInput,
      ingredients: [{ name: '버터', amount: '', unit: 'g' as const }],
    })
    expect(result.success).toBe(false)
  })

  it('tags/memo/preheat는 optional', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tags, memo, preheat_temp, preheat_time, source_url, ...rest } = validInput
    const result = RecipeSchema.safeParse({ ...rest, source_type: 'etc' as const })
    expect(result.success).toBe(true)
  })
})

describe('RecipeSchemaRefined', () => {
  it('youtube 출처에 source_url 없으면 에러', () => {
    const result = RecipeSchemaRefined.safeParse({
      ...validInput,
      source_type: 'youtube',
      source_url: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0])
      expect(paths).toContain('source_url')
    }
  })

  it('etc 출처에 source_url 없어도 통과', () => {
    const result = RecipeSchemaRefined.safeParse({
      ...validInput,
      source_type: 'etc',
      source_url: null,
    })
    expect(result.success).toBe(true)
  })

  it('youtube 출처에 source_url 있으면 통과', () => {
    const result = RecipeSchemaRefined.safeParse({
      ...validInput,
      source_type: 'youtube',
      source_url: 'https://youtube.com/watch?v=abc',
    })
    expect(result.success).toBe(true)
  })
})
