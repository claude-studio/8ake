import { beforeEach, describe, expect, it } from 'vitest'

import {
  AUTH_STORAGE_KEY,
  authStorage,
  clearAllAuthStorage,
  clearOppositeBackend,
  deriveAuthStorageKey,
  getAuthRelatedKeys,
  getRememberPreference,
  resolveAmbiguousLegacySessions,
  setRememberPreference,
} from '../auth-storage'

const OTHER_PROJECT_KEY = 'sb-other-project-auth-token'

describe('authStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('Supabase URL에서 기본 storage key 규칙과 같은 키를 유도한다', () => {
    expect(deriveAuthStorageKey('https://project-ref.supabase.co')).toBe(
      'sb-project-ref-auth-token'
    )
  })

  it('preference flag가 없으면 remember 기본값은 ON이다', () => {
    expect(getRememberPreference()).toBe(true)
  })

  it('ON이면 localStorage에만 쓰고 반대편 값은 지우지 않는다', () => {
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'existing-session-token')
    setRememberPreference(true)

    authStorage.setItem(AUTH_STORAGE_KEY, 'local-token')

    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBe('local-token')
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toBe('existing-session-token')
  })

  it('OFF이면 sessionStorage에만 쓰고 반대편 값은 지우지 않는다', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, 'existing-local-token')
    setRememberPreference(false)

    authStorage.setItem(AUTH_STORAGE_KEY, 'session-token')

    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toBe('session-token')
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBe('existing-local-token')
  })

  it('선호 백엔드가 비어 있으면 반대편 token으로 fallback하지 않는다', () => {
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'session-only-token')
    setRememberPreference(true)
    expect(authStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()

    localStorage.setItem(AUTH_STORAGE_KEY, 'local-only-token')
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    setRememberPreference(false)
    expect(authStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  })

  it('removeItem은 main token과 보조 키를 양쪽에서 제거한다', () => {
    const authKeys = getAuthRelatedKeys()
    for (const key of authKeys) {
      localStorage.setItem(key, `local:${key}`)
      sessionStorage.setItem(key, `session:${key}`)
      authStorage.removeItem(key)
    }

    for (const key of authKeys) {
      expect(localStorage.getItem(key)).toBeNull()
      expect(sessionStorage.getItem(key)).toBeNull()
    }
  })

  it('clearAllAuthStorage는 정의된 정확 키만 지운다', () => {
    for (const key of getAuthRelatedKeys()) {
      localStorage.setItem(key, 'local-auth')
      sessionStorage.setItem(key, 'session-auth')
    }
    localStorage.setItem(OTHER_PROJECT_KEY, 'other-local')
    sessionStorage.setItem(OTHER_PROJECT_KEY, 'other-session')

    clearAllAuthStorage()

    for (const key of getAuthRelatedKeys()) {
      expect(localStorage.getItem(key)).toBeNull()
      expect(sessionStorage.getItem(key)).toBeNull()
    }
    expect(localStorage.getItem(OTHER_PROJECT_KEY)).toBe('other-local')
    expect(sessionStorage.getItem(OTHER_PROJECT_KEY)).toBe('other-session')
  })

  it('clearOppositeBackend은 현재 선호의 반대편 정확 키만 지운다', () => {
    for (const key of getAuthRelatedKeys()) {
      localStorage.setItem(key, 'local-auth')
      sessionStorage.setItem(key, 'session-auth')
    }
    localStorage.setItem(OTHER_PROJECT_KEY, 'other-local')
    sessionStorage.setItem(OTHER_PROJECT_KEY, 'other-session')
    setRememberPreference(true)

    clearOppositeBackend()

    for (const key of getAuthRelatedKeys()) {
      expect(localStorage.getItem(key)).toBe('local-auth')
      expect(sessionStorage.getItem(key)).toBeNull()
    }
    expect(localStorage.getItem(OTHER_PROJECT_KEY)).toBe('other-local')
    expect(sessionStorage.getItem(OTHER_PROJECT_KEY)).toBe('other-session')
  })

  it('legacy flag 없이 local token만 있으면 기본 ON 경로로 복원한다', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, 'legacy-local-token')

    resolveAmbiguousLegacySessions()

    expect(authStorage.getItem(AUTH_STORAGE_KEY)).toBe('legacy-local-token')
  })

  it('legacy flag 없이 서로 다른 token이 양쪽에 있으면 강제 재인증을 위해 둘 다 지운다', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, 'legacy-local-token')
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'legacy-session-token')
    localStorage.setItem(OTHER_PROJECT_KEY, 'other-local')
    sessionStorage.setItem(OTHER_PROJECT_KEY, 'other-session')

    resolveAmbiguousLegacySessions()

    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(OTHER_PROJECT_KEY)).toBe('other-local')
    expect(sessionStorage.getItem(OTHER_PROJECT_KEY)).toBe('other-session')
  })
})
