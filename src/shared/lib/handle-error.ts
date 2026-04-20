import { toast } from 'sonner'

import { AppError } from './api-error'

function isPostgrestError(e: unknown): e is { code: string; message: string } {
  return typeof e === 'object' && e !== null && 'code' in e && 'message' in e
}

function isAuthApiError(e: unknown): e is { status: number; message: string; __isAuthError: true } {
  return typeof e === 'object' && e !== null && 'status' in e && '__isAuthError' in e
}

const POSTGREST_MESSAGES: Record<string, string> = {
  '23505': '이미 동일한 데이터가 존재합니다',
  '42501': '권한이 없습니다',
  PGRST301: '권한이 없습니다',
  PGRST116: '데이터를 찾을 수 없습니다',
  '23503': '참조하는 데이터가 없습니다',
}

const AUTH_MESSAGES: Record<number, string> = {
  400: '잘못된 요청입니다',
  401: '인증이 만료되었습니다. 다시 로그인해주세요',
  422: '입력 형식이 올바르지 않습니다',
  429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요',
}

function getKoreanMessage(error: unknown): string {
  if (isPostgrestError(error)) {
    return POSTGREST_MESSAGES[error.code] ?? `서버 오류가 발생했습니다 (${error.code})`
  }
  if (isAuthApiError(error)) {
    return AUTH_MESSAGES[error.status] ?? `인증 오류가 발생했습니다 (${error.status})`
  }
  if (error instanceof Error) return error.message
  return '알 수 없는 오류가 발생했습니다'
}

export function handleSupabaseError(error: unknown, context?: string): never {
  const base = getKoreanMessage(error)
  const message = context ? `${context}: ${base}` : base
  throw new AppError(message, isPostgrestError(error) ? error.code : undefined, error)
}

export function toastSupabaseError(error: unknown, context?: string): void {
  const base = getKoreanMessage(error)
  const message = context ? `${context}: ${base}` : base
  toast.error(message)
}
