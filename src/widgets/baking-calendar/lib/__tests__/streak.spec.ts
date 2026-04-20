import { describe, expect, it } from 'vitest'

import { calculateStreak } from '../streak'

describe('calculateStreak', () => {
  it('빈 배열 → 0', () => {
    expect(calculateStreak([])).toBe(0)
  })

  it('단일 날짜 → 1', () => {
    expect(calculateStreak(['2026-04-01'])).toBe(1)
  })

  it('연속 3일 → 3', () => {
    expect(calculateStreak(['2026-04-01', '2026-04-02', '2026-04-03'])).toBe(3)
  })

  it('중간에 끊긴 날짜 → 끊긴 이후 연속만 계산', () => {
    expect(calculateStreak(['2026-04-01', '2026-04-03', '2026-04-04'])).toBe(2)
  })

  it('모두 비연속 → 1 (마지막 날 하루)', () => {
    expect(calculateStreak(['2026-04-01', '2026-04-10', '2026-04-20'])).toBe(1)
  })
})
