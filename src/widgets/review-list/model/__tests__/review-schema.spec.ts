import { describe, expect, it } from 'vitest'

import { ReviewSchema } from '../review-schema'

const validInput = {
  date: '2024-01-15',
  total_score: 4,
  taste: 5,
  storability: 3,
  recipe_simplicity: 4,
  ingredient_availability: 5,
  texture: 3,
  comment: '맛있었어요',
  storage_memo: '냉동 보관',
}

describe('ReviewSchema', () => {
  it('유효한 입력은 파싱 성공', () => {
    const result = ReviewSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('date 누락 시 에러', () => {
    const result = ReviewSchema.safeParse({ ...validInput, date: '' })
    expect(result.success).toBe(false)
  })

  it('total_score 범위 초과(6) 시 에러', () => {
    const result = ReviewSchema.safeParse({ ...validInput, total_score: 6 })
    expect(result.success).toBe(false)
  })

  it('total_score 범위 미만(0) 시 에러', () => {
    const result = ReviewSchema.safeParse({ ...validInput, total_score: 0 })
    expect(result.success).toBe(false)
  })

  it('taste 범위 초과 시 에러', () => {
    const result = ReviewSchema.safeParse({ ...validInput, taste: 6 })
    expect(result.success).toBe(false)
  })

  it('texture 범위 미만(0) 시 에러', () => {
    const result = ReviewSchema.safeParse({ ...validInput, texture: 0 })
    expect(result.success).toBe(false)
  })

  it('comment/storage_memo는 optional', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { comment: _comment, storage_memo: _sm, ...rest } = validInput
    const result = ReviewSchema.safeParse(rest)
    expect(result.success).toBe(true)
  })

  it('평점 1~5 경계값 모두 통과', () => {
    for (const score of [1, 2, 3, 4, 5]) {
      const result = ReviewSchema.safeParse({ ...validInput, total_score: score })
      expect(result.success).toBe(true)
    }
  })
})
