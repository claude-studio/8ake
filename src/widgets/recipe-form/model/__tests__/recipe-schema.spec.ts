import { describe, expect, it } from 'vitest'

import { RecipeSchema, RecipeSchemaRefined } from '../recipe-schema'

const validBase = {
  name: '마들렌',
  source_type: 'youtube' as const,
  source_url: 'https://youtube.com/watch?v=abc',
  oven_temp: 180,
  bake_time: 15,
  quantity: 12,
  steps: '1. 버터를 녹인다 2. 밀가루를 섞는다',
  is_public: true,
  ingredients: [{ name: '버터', amount: '100', unit: 'g' as const }],
}

describe('RecipeSchema', () => {
  it('유효한 데이터 통과', () => {
    const result = RecipeSchema.safeParse(validBase)
    expect(result.success).toBe(true)
  })

  it('name이 빈 문자열이면 실패', () => {
    const result = RecipeSchema.safeParse({ ...validBase, name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path[0] === 'name')
      expect(nameError?.message).toBe('메뉴명을 입력해주세요')
    }
  })

  it('source_type이 잘못된 값이면 실패', () => {
    const result = RecipeSchema.safeParse({ ...validBase, source_type: 'instagram' })
    expect(result.success).toBe(false)
  })

  it('oven_temp가 0이면 실패', () => {
    const result = RecipeSchema.safeParse({ ...validBase, oven_temp: 0 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path[0] === 'oven_temp')
      expect(err?.message).toBe('오븐 온도를 입력해주세요')
    }
  })

  it('ingredients가 빈 배열이면 실패', () => {
    const result = RecipeSchema.safeParse({ ...validBase, ingredients: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path[0] === 'ingredients')
      expect(err?.message).toBe('재료를 1개 이상 입력해주세요')
    }
  })

  it('ingredient name이 빈 문자열이면 실패', () => {
    const result = RecipeSchema.safeParse({
      ...validBase,
      ingredients: [{ name: '', amount: '100', unit: 'g' }],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const err = result.error.issues.find(
        (i) => i.path[0] === 'ingredients' && i.path[2] === 'name'
      )
      expect(err?.message).toBe('재료명을 입력해주세요')
    }
  })

  it('steps가 빈 문자열이면 실패', () => {
    const result = RecipeSchema.safeParse({ ...validBase, steps: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path[0] === 'steps')
      expect(err?.message).toBe('만드는 법을 입력해주세요')
    }
  })

  it('oven_temp 문자열 숫자 → coerce 변환', () => {
    const result = RecipeSchema.safeParse({ ...validBase, oven_temp: '200' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.oven_temp).toBe(200)
    }
  })

  it('memo, tags, preheat_temp, preheat_time은 optional', () => {
    const rest = {
      name: validBase.name,
      source_type: validBase.source_type,
      source_url: validBase.source_url,
      oven_temp: validBase.oven_temp,
      bake_time: validBase.bake_time,
      quantity: validBase.quantity,
      steps: validBase.steps,
      is_public: validBase.is_public,
      ingredients: validBase.ingredients,
    }
    const result = RecipeSchema.safeParse(rest)
    expect(result.success).toBe(true)
  })
})

describe('RecipeSchemaRefined', () => {
  it('source_type=youtube이고 source_url이 없으면 실패', () => {
    const result = RecipeSchemaRefined.safeParse({
      ...validBase,
      source_type: 'youtube',
      source_url: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path[0] === 'source_url')
      expect(err?.message).toBe('출처 URL을 입력해주세요')
    }
  })

  it('source_type=etc이면 source_url 없어도 통과', () => {
    const result = RecipeSchemaRefined.safeParse({
      ...validBase,
      source_type: 'etc',
      source_url: null,
    })
    expect(result.success).toBe(true)
  })
})
