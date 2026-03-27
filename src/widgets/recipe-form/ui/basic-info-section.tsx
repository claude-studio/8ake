import { useCallback, useState } from 'react'

import { BookOpen, FileText, Globe, Lock, Pencil, Play, X } from 'lucide-react'
import { Controller, useController } from 'react-hook-form'

import { Input } from '@/components/ui/input'

import { fieldLabelStyle } from './form-styles'

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
      <div>
        <label style={fieldLabelStyle}>
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
      <div>
        <label style={fieldLabelStyle}>출처</label>
        <div className="flex flex-wrap gap-2">
          {SOURCE_TYPES.map((st) => {
            const isActive = sourceType.field.value === st.value
            const isYoutube = st.value === 'youtube'
            return (
              <button
                key={st.value}
                type="button"
                onClick={() => sourceType.field.onChange(isActive ? undefined : st.value)}
                className={[
                  'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150',
                  isActive && isYoutube
                    ? 'border-[var(--youtube)] bg-[var(--youtube)] text-white'
                    : isActive
                      ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)]',
                ].join(' ')}
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
        <div>
          <label style={fieldLabelStyle}>출처 URL</label>
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
      <div>
        <label style={fieldLabelStyle}>태그</label>
        <Controller
          control={control}
          name="tags"
          render={({ field }) => {
            const tags = field.value ?? []
            return (
              <div
                className="flex flex-wrap items-center gap-1.5"
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 6,
                  padding: '8px 10px',
                  minHeight: 44,
                  cursor: 'text',
                }}
                onClick={() => document.getElementById('tag-input-field')?.focus()}
              >
                {tags.map((tag, i) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1"
                    style={{
                      backgroundColor: 'var(--primary-dim)',
                      border: '1px solid var(--primary-border)',
                      borderRadius: 20,
                      padding: '3px 10px',
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--primary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeTag(i, tags, field.onChange)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--primary)',
                        opacity: 0.6,
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0,
                      }}
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
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontFamily: 'inherit',
                    fontSize: 13,
                    color: 'var(--foreground)',
                    outline: 'none',
                    minWidth: 80,
                    flex: 1,
                  }}
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
          <div
            className="flex items-center justify-between"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: 6,
              padding: '12px 16px',
            }}
          >
            <div className="flex items-center gap-2">
              {field.value ? (
                <Globe size={18} className="text-[var(--primary)]" />
              ) : (
                <Lock size={18} className="text-[var(--muted-foreground)]" />
              )}
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--foreground)' }}>
                  {field.value ? '공개' : '비공개'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
                  {field.value ? '다른 사람이 볼 수 있어요' : '나만 볼 수 있어요'}
                </div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={field.value}
              onClick={() => field.onChange(!field.value)}
              style={{
                position: 'relative',
                width: 44,
                height: 24,
                borderRadius: 12,
                backgroundColor: field.value ? 'var(--primary)' : 'var(--surface)',
                border: `1.5px solid ${field.value ? 'var(--primary)' : 'var(--border)'}`,
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  left: field.value ? 23 : 3,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: field.value
                    ? 'var(--primary-foreground)'
                    : 'var(--muted-foreground)',
                  transition: 'all 0.2s',
                }}
              />
            </button>
          </div>
        )}
      />
    </div>
  )
}
