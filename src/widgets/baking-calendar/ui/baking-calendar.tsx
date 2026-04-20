import { useEffect, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, CookingPot, MessageSquare } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { CalendarEntry } from '@/entities/review'
import { useCalendarEntries, prefetchCalendarEntries } from '@/entities/review'
import { cn } from '@/shared/lib/utils'

import { calculateStreak } from '../lib/streak'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  return { firstDay, daysInMonth }
}

function groupByDate(entries: CalendarEntry[]) {
  const map = new Map<string, CalendarEntry[]>()
  for (const e of entries) {
    const key = e.date
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(e)
  }
  return map
}

export function BakingCalendar() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: entries, isLoading } = useCalendarEntries(year, month)

  const entriesByDate = useMemo(() => groupByDate(entries), [entries])
  const { firstDay, daysInMonth } = useMemo(() => getMonthDays(year, month), [year, month])
  const sortedDates = useMemo(() => [...entriesByDate.keys()].sort(), [entriesByDate])
  const streak = useMemo(() => calculateStreak(sortedDates), [sortedDates])

  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  // 다음 달 데이터 프리패치
  useEffect(() => {
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    prefetchCalendarEntries(queryClient, nextYear, nextMonth)
  }, [year, month, queryClient])

  const goPrev = () => {
    if (month === 1) {
      setYear(year - 1)
      setMonth(12)
    } else {
      setMonth(month - 1)
    }
    setSelectedDate(null)
  }

  const goNext = () => {
    if (month === 12) {
      setYear(year + 1)
      setMonth(1)
    } else {
      setMonth(month + 1)
    }
    setSelectedDate(null)
  }

  const selectedEntries = selectedDate ? (entriesByDate.get(selectedDate) ?? []) : []

  return (
    <div className="space-y-4">
      {/* 월 통계 */}
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold text-foreground">{entriesByDate.size}</div>
          <div className="text-xs text-muted-foreground">베이킹 일수</div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold text-foreground">{entries.length}</div>
          <div className="text-xs text-muted-foreground">총 기록</div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold text-primary">{streak}</div>
          <div className="text-xs text-muted-foreground">연속 스트릭</div>
        </div>
      </div>

      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon-sm" onClick={goPrev}>
          <ChevronLeft size={18} />
        </Button>
        <h2 className="text-base font-semibold text-foreground">
          {year}년 {month}월
        </h2>
        <Button variant="ghost" size="icon-sm" onClick={goNext}>
          <ChevronRight size={18} />
        </Button>
      </div>

      {/* 캘린더 그리드 */}
      <div className="rounded-2xl border border-border bg-card p-3">
        {/* 요일 헤더 */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-[11px] font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayEntries = entriesByDate.get(dateStr)
            const hasBaking = !!dayEntries
            const isToday = dateStr === today
            const isSelected = dateStr === selectedDate

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={cn(
                  'relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : isToday
                      ? 'ring-1 ring-primary text-foreground'
                      : 'text-foreground hover:bg-surface'
                )}
              >
                <span className={cn('text-[13px]', hasBaking && !isSelected && 'font-semibold')}>
                  {day}
                </span>
                {hasBaking && (
                  <span
                    className={cn(
                      'absolute bottom-1.5 size-1.5 rounded-full',
                      isSelected ? 'bg-primary-foreground' : 'bg-primary'
                    )}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="py-6 text-center text-sm text-muted-foreground">불러오는 중...</div>
      )}

      {/* 선택된 날짜의 베이킹 기록 */}
      {selectedDate && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {selectedDate.replace(/-/g, '.')} 기록
          </h3>
          {selectedEntries.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
              이 날은 기록이 없어요
            </div>
          ) : (
            selectedEntries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => navigate({ to: '/recipe/$id', params: { id: entry.recipe_id } })}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-surface"
              >
                <div
                  className={cn(
                    'flex size-8 items-center justify-center rounded-lg',
                    entry.type === 'recipe' ? 'bg-primary/10' : 'bg-surface'
                  )}
                >
                  {entry.type === 'recipe' ? (
                    <CookingPot size={16} className="text-primary" />
                  ) : (
                    <MessageSquare size={16} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{entry.recipe_name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {entry.type === 'recipe' ? '베이킹' : '회고'}
                  </div>
                </div>
                {entry.total_score !== null && (
                  <div className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1">
                    <span className="text-xs font-semibold text-primary">
                      {entry.total_score}점
                    </span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
