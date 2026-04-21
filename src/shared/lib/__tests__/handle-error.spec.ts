import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))

import { AppError } from '../api-error'
import { handleSupabaseError, toastSupabaseError } from '../handle-error'

describe('handleSupabaseError', () => {
  it('PostgrestError 23505 → 중복 메시지 AppError throw', () => {
    const pgError = { code: '23505', message: 'duplicate key', details: null, hint: null }
    expect(() => handleSupabaseError(pgError, '레시피 등록')).toThrow(AppError)
    expect(() => handleSupabaseError(pgError, '레시피 등록')).toThrow(
      '레시피 등록: 이미 동일한 데이터가 존재합니다'
    )
  })

  it('PostgrestError PGRST116 → 데이터 없음 메시지', () => {
    const pgError = { code: 'PGRST116', message: 'not found', details: null, hint: null }
    expect(() => handleSupabaseError(pgError)).toThrow('데이터를 찾을 수 없습니다')
  })

  it('알 수 없는 코드 → 코드 포함 fallback 메시지', () => {
    const pgError = { code: 'XXXXX', message: 'unknown', details: null, hint: null }
    expect(() => handleSupabaseError(pgError)).toThrow('서버 오류가 발생했습니다 (XXXXX)')
  })

  it('AuthApiError 401 → 인증 만료 메시지', () => {
    const authError = { status: 401, message: 'Unauthorized', __isAuthError: true }
    expect(() => handleSupabaseError(authError)).toThrow('인증이 만료되었습니다')
  })

  it('context 없이 호출 시 prefix 없음', () => {
    const pgError = { code: '42501', message: 'permission denied', details: null, hint: null }
    expect(() => handleSupabaseError(pgError)).toThrow('권한이 없습니다')
  })
})

describe('toastSupabaseError', () => {
  beforeEach(() => vi.clearAllMocks())

  it('toast.error에 한국어 메시지 전달', () => {
    const pgError = { code: '23503', message: 'fk violation', details: null, hint: null }
    toastSupabaseError(pgError, '재료 삭제')
    expect(toast.error).toHaveBeenCalledWith('재료 삭제: 참조하는 데이터가 없습니다')
  })

  it('일반 Error 객체도 처리', () => {
    toastSupabaseError(new Error('네트워크 오류'))
    expect(toast.error).toHaveBeenCalledWith('네트워크 오류')
  })

  it('null 에러 → fallback 메시지', () => {
    toastSupabaseError(null)
    expect(toast.error).toHaveBeenCalledWith('알 수 없는 오류가 발생했습니다')
  })
})
