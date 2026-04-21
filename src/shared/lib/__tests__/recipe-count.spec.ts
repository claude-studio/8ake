import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../api-error'

const mockSelect = vi.fn()

vi.mock('@/shared/api', () => ({
  supabase: {
    from: () => ({ select: mockSelect }),
  },
}))

import { getTotalRecipeCount } from '../recipe-count'

describe('getTotalRecipeCount', () => {
  it('정상 응답 시 count 반환', async () => {
    mockSelect.mockResolvedValue({ count: 42, error: null })
    const result = await getTotalRecipeCount()
    expect(result).toBe(42)
  })

  it('count가 null이면 0 반환', async () => {
    mockSelect.mockResolvedValue({ count: null, error: null })
    const result = await getTotalRecipeCount()
    expect(result).toBe(0)
  })

  it('에러 발생 시 AppError throw (원본 에러 노출 안 함)', async () => {
    const pgError = { code: '42501', message: 'permission denied', details: null, hint: null }
    mockSelect.mockResolvedValue({ count: null, error: pgError })
    await expect(getTotalRecipeCount()).rejects.toBeInstanceOf(AppError)
  })

  it('에러 메시지에 context가 포함됨', async () => {
    const pgError = { code: '42501', message: 'permission denied', details: null, hint: null }
    mockSelect.mockResolvedValue({ count: null, error: pgError })
    await expect(getTotalRecipeCount()).rejects.toThrow('레시피 총 개수 조회')
  })
})
