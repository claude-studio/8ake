import { useMemo, useState } from 'react'

import { LayoutGrid, List, Package, Search, Star, Trophy } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createIngredient, useIngredients } from '@/entities/ingredient'
import { useAuthStore } from '@/features/auth'
import { cn } from '@/shared/lib/utils'
import { useUIStore } from '@/shared/model/ui-store'

import { IngredientCardView } from './ingredient-card-view'
import { IngredientTableView } from './ingredient-table-view'

export function IngredientList() {
  const { data: ingredients, isLoading, refetch } = useIngredients()
  const user = useAuthStore((s) => s.user)
  const viewMode = useUIStore((s) => s.ingredientViewMode)
  const setViewMode = useUIStore((s) => s.setIngredientViewMode)

  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [search, setSearch] = useState('')

  const filteredIngredients = useMemo(() => {
    if (!search.trim()) return ingredients
    const q = search.trim().toLowerCase()
    return ingredients.filter((i) => i.name.toLowerCase().includes(q))
  }, [ingredients, search])

  async function handleAddIngredient() {
    if (!newName.trim() || !user) return
    setIsAdding(true)
    try {
      await createIngredient(newName.trim(), user.id)
      toast.success('재료가 추가되었습니다')
      setNewName('')
      setShowAddForm(false)
      refetch()
    } catch {
      toast.error('재료 추가에 실패했습니다')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 통계 카드 */}
      {!isLoading && ingredients.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<Package size={20} />}
            label="등록 재료"
            value={`${ingredients.length}종`}
            accent
          />
          <StatCard icon={<Star size={20} />} label="평균 평점" value="—" />
          <StatCard icon={<Trophy size={20} />} label="최고 재료" value="—" small />
        </div>
      )}

      {/* 컨트롤 행 */}
      <div className="flex flex-col gap-2">
        {/* 1행: 검색 + 추가 */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            />
            <Input
              type="search"
              placeholder="재료명, 메모 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-sm"
            />
          </div>
          <Button onClick={() => setShowAddForm(true)} className="shrink-0">
            + 재료 추가
          </Button>
        </div>

        {/* 2행: 뷰 전환 */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[var(--muted-foreground)]">보기</span>
          <div className="flex rounded-lg border border-[var(--border)] bg-[var(--card)] p-0.5">
            <ViewToggle
              active={viewMode === 'table'}
              onClick={() => setViewMode('table')}
              icon={<List size={13} />}
              label="테이블"
            />
            <ViewToggle
              active={viewMode === 'card'}
              onClick={() => setViewMode('card')}
              icon={<LayoutGrid size={13} />}
              label="카드"
            />
          </div>
        </div>
      </div>

      {/* 재료 추가 폼 */}
      {showAddForm && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddIngredient()
              if (e.key === 'Escape') {
                setShowAddForm(false)
                setNewName('')
              }
            }}
            placeholder="재료명 입력"
            autoFocus
            className="flex-1 text-sm"
          />
          <Button size="sm" onClick={handleAddIngredient} disabled={isAdding || !newName.trim()}>
            추가
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowAddForm(false)
              setNewName('')
            }}
            className="text-[var(--muted-foreground)]"
          >
            취소
          </Button>
        </div>
      )}

      {/* 목록 */}
      {isLoading ? (
        <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">불러오는 중...</p>
      ) : filteredIngredients.length === 0 && ingredients.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--border)] py-12">
          <Package size={36} className="text-[var(--muted-foreground)] opacity-40" />
          <p className="text-sm text-[var(--muted-foreground)]">아직 등록된 재료가 없습니다</p>
          <p className="text-xs text-[var(--muted-foreground)] opacity-70">
            위의 재료 추가 버튼으로 시작해보세요
          </p>
        </div>
      ) : filteredIngredients.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
          검색 결과가 없습니다
        </p>
      ) : viewMode === 'card' ? (
        <IngredientCardView ingredients={filteredIngredients} onRefetch={refetch} />
      ) : (
        <IngredientTableView ingredients={filteredIngredients} onRefetch={refetch} />
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
  small,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent?: boolean
  small?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
      <span className="text-[var(--primary)]">{icon}</span>
      <span className="text-[10px] font-medium text-[var(--muted-foreground)]">{label}</span>
      <span
        className={cn(
          'font-bold leading-none text-[var(--foreground)]',
          accent ? 'text-xl text-[var(--primary)]' : small ? 'text-xs' : 'text-base'
        )}
      >
        {value}
      </span>
    </div>
  )
}

function ViewToggle({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150',
        active
          ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
          : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
      )}
    >
      {icon}
      {label}
    </button>
  )
}
