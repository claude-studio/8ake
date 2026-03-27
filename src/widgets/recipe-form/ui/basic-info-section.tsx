import { useCallback, useState } from 'react'

import { BookOpen, FileText, Globe, Lock, Pencil, Play, X } from 'lucide-react'
import { Controller, useController } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { cn } from '@/shared/lib/utils'

import type { RecipeFormValues } from '../model/recipe-schema'
import type { Control, FieldErrors } from 'react-hook-form'

const SOURCE_TYPES = [
  { value: 'youtube', label: 'YouTube', icon: <Play size={13} /> },
  { value: 'blog', label: '블로그', icon: <FileText size={13} /> },
  { value: 'book', label: '책', icon: <BookOpen size={13} /> },
  { value: 'etc', label: '기타', icon: <Pencil size={13} /> },
] as const

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<RecipeFormValues, any, any>
  errors: FieldErrors<RecipeFormValues>
}

export function BasicInfoSection({ control, errors }: Props) {
  const [tagInput, setTagInput] = useState('')

  const sourceType = useController({ control, name: 'source_type' })
  const showUrl = sourceType.field.value === 'youtube' || sourceType.field.value === 'blog'

  const handleTagKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLInputElement>,
      currentTags: string[],
      onChange: (tags: string[]) => void
    ) => {
      if (e.nativeEvent.isComposing) return
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        const value = tagInput.trim().replace(/,/g, '')
        if (value && !currentTags.includes(value)) {
          onChange([...currentTags, value])
        }
        setTagInput('')
      }
    },
    [tagInput]
  )

  const removeTag = useCallback(
    (index: number, currentTags: string[], onChange: (tags: string[]) => void) => {
      onChange(currentTags.filter((_, i) => i !== index))
    },
    []
  )

  return (
    <div className="space-y-4">
      {/* 메뉴명 */}
      <div className="flex flex-col gap-1.5">
        <label className="field-label">
          메뉴명 <span className="text-destructive">*</span>
        </label>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              {...field}
              type="text"
              placeholder="예: 바나나 브레드"
              className="text-lg font-semibold h-12"
              aria-invalid={!!errors.name}
            />
          )}
        />
        {errors.name && <p className="text-xs mt-2 text-destructive">{errors.name.message}</p>}
      </div>

      {/* 출처 타입 */}
      <div className="flex flex-col gap-1.5">
        <label className="field-label">출처</label>
        <div className="flex flex-wrap gap-2">
          {SOURCE_TYPES.map((st) => {
            const isActive = sourceType.field.value === st.value
            const isYoutube = st.value === 'youtube'
            return (
              <button
                key={st.value}
                type="button"
                onClick={() => sourceType.field.onChange(isActive ? undefined : st.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150',
                  {
                    'border-(--youtube) bg-(--youtube) text-white': isActive && isYoutube,
                    'border-primary bg-primary text-primary-foreground': isActive && !isYoutube,
                    'border-border bg-surface text-muted-foreground': !isActive,
                  }
                )}
              >
                {st.icon}
                {st.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 출처 URL */}
      {showUrl && (
        <div className="flex flex-col gap-1.5">
          <label className="field-label">출처 URL</label>
          <Controller
            control={control}
            name="source_url"
            render={({ field }) => (
              <Input {...field} value={field.value ?? ''} type="url" placeholder="https://..." />
            )}
          />
        </div>
      )}

      {/* 태그 */}
      <div className="flex flex-col gap-1.5">
        <label className="field-label">태그</label>
        <Controller
          control={control}
          name="tags"
          render={({ field }) => {
            const tags = field.value ?? []
            return (
              <div
                className="flex flex-wrap items-center gap-1.5 bg-surface border-[1.5px] border-border rounded-[6px] px-[10px] py-2 min-h-11 cursor-text"
                onClick={() => document.getElementById('tag-input-field')?.focus()}
              >
                {tags.map((tag, i) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-(--primary-dim) border border-(--primary-border) rounded-[20px] px-[10px] py-[3px] text-xs font-medium text-primary whitespace-nowrap"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeTag(i, tags, field.onChange)
                      }}
                      className="bg-transparent border-0 cursor-pointer text-primary opacity-60 flex items-center p-0"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  id="tag-input-field"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => handleTagKeyDown(e, tags, field.onChange)}
                  placeholder={tags.length === 0 ? '태그 입력 후 Enter' : ''}
                  className="border-0 bg-transparent font-[inherit] text-[13px] text-foreground outline-none min-w-[80px] flex-1"
                />
              </div>
            )
          }}
        />
      </div>

      {/* 공개/비공개 */}
      <Controller
        control={control}
        name="is_public"
        render={({ field }) => (
          <div className="flex items-center justify-between bg-surface border-[1.5px] border-border rounded-[6px] px-4 py-3">
            <div className="flex items-center gap-2">
              {field.value ? (
                <Globe size={18} className="text-primary" />
              ) : (
                <Lock size={18} className="text-muted-foreground" />
              )}
              <div className="flex flex-col gap-1.5">
                <div className="text-sm font-medium text-foreground">
                  {field.value ? '공개' : '비공개'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {field.value ? '다른 사람이 볼 수 있어요' : '나만 볼 수 있어요'}
                </div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={field.value}
              onClick={() => field.onChange(!field.value)}
              className={cn(
                'relative w-11 h-6 rounded-xl cursor-pointer shrink-0 transition-all duration-200',
                field.value
                  ? 'bg-primary border-[1.5px] border-primary'
                  : 'bg-surface border-[1.5px] border-border'
              )}
            >
              <span
                className={cn(
                  'absolute top-[3px] size-4 rounded-full transition-all duration-200',
                  field.value ? 'bg-primary-foreground' : 'bg-muted-foreground'
                )}
                style={{ left: field.value ? 23 : 3 }}
              />
            </button>
          </div>
        )}
      />
    </div>
  )
}
