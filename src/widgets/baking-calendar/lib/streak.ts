/**
 * 오름차순 정렬된 'YYYY-MM-DD' 날짜 배열에서
 * 마지막 날 기준 역방향 연속 스트릭 수 반환
 */
export function calculateStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0
  let streak = 1
  for (let i = sortedDates.length - 1; i > 0; i--) {
    const curr = new Date(sortedDates[i])
    const prev = new Date(sortedDates[i - 1])
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) streak++
    else break
  }
  return streak
}
