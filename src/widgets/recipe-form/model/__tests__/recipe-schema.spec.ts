import { describe, expect, it } from 'vitest'

import { RecipeSchema, RecipeSchemaRefined } from '../recipe-schema'

const validBase = {
  name: '소금빵',
  source_type: 'etc' as const,
  source_url: null,
  oven_temp: 180,
  bake_time: 20,
  quantity: 12,
  steps: '반죽하고 굽는다',
  is_public: false,
  ingredients: [{ name: '밀가루', amount: '200', unit: 'g' as const }],
}

describe('RecipeSchema', () => {
  it('유효한 입력은 성공한다', () => {
    const result = RecipeSchema.safeParse(validBase)
    expect(result.success).toBe(true)
  })

  it('name이 비어 있으면 실패한다', () => {
    const result = RecipeSchema.safeParse({ ...validBase, name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0])
      expect(fields).toContain('name')
    }
  })

  it('source_type이 올바르지 않으면 실패한다', () => {
    const result = RecipeSchema.safeParse({ ...validBase, source_type: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('oven_temp가 0이면 실패한다', () => {
    const result = RecipeSchema.safeParse({ ...validBase, oven_temp: 0 })
    expect(result.success).toBe(false)
  })

  it('ingredients가 빈 배열이면 실패한다', () => {
    const result = RecipeSchema.safeParse({ ...validBase, ingredients: [] })
    expect(result.success).toBe(false)
  })

  it('steps가 비어 있으면 실패한다', () => {
    const result = RecipeSchema.safeParse({ ...validBase, steps: '' })
    expect(result.success).toBe(false)
  })

  it('oven_temp는 문자열 숫자도 coerce된다', () => {
    const result = RecipeSchema.safeParse({ ...validBase, oven_temp: '180' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.oven_temp).toBe(180)
    }
  })
})

describe('RecipeSchemaRefined', () => {
  it('source_type이 youtube이고 source_url이 없으면 실패한다', () => {
    const result = RecipeSchemaRefined.safeParse({
      ...validBase,
      source_type: 'youtube',
      source_url: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0])
      expect(fields).toContain('source_url')
    }
  })

  it('source_type이 blog이고 source_url이 없으면 실패한다', () => {
    const result = RecipeSchemaRefined.safeParse({
      ...validBase,
      source_type: 'blog',
      source_url: null,
    })
    expect(result.success).toBe(false)
  })

  it('source_type이 etc이면 source_url 없어도 성공한다', () => {
    const result = RecipeSchemaRefined.safeParse({
      ...validBase,
      source_type: 'etc',
      source_url: null,
    })
    expect(result.success).toBe(true)
  })

  it('source_type이 youtube이고 source_url이 있으면 성공한다', () => {
    const result = RecipeSchemaRefined.safeParse({
      ...validBase,
      source_type: 'youtube',
      source_url: 'https://youtube.com/watch?v=abc',
    })
    expect(result.success).toBe(true)
  })
})
