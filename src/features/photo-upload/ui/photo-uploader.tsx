import { useCallback, useEffect, useRef, useState } from 'react'

import { CheckCircle2, ImagePlus, Loader2, RotateCcw, Star, X, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { compressImage } from '@/shared/lib/compress-image'
import { cn } from '@/shared/lib/utils'

import type { PhotoUploadStatus } from '../model/types'

const MAX_FILES = 5
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB (압축 전 원본 허용)
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_TYPES_ACCEPT = [...ALLOWED_TYPES].join(',')

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

interface PhotoItem {
  file: File
  preview: string
  compressedSize?: number
}

interface Props {
  onChange: (files: File[], thumbnailIndex: number) => void
  uploadStates?: PhotoUploadStatus[]
  onRetry?: (index: number) => void
}

export function PhotoUploader({ onChange, uploadStates, onRetry }: Props) {
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [thumbnailIndex, setThumbnailIndex] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [compressionProgress, setCompressionProgress] = useState<number>(0)
  const isProcessingRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const photosRef = useRef<PhotoItem[]>([])
  const thumbnailIndexRef = useRef(0)

  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  useEffect(() => {
    thumbnailIndexRef.current = thumbnailIndex
  }, [thumbnailIndex])

  // 언마운트 시 생성된 모든 object URL 해제
  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.preview))
    }
  }, [])

  const processFiles = useCallback(
    async (incoming: FileList | File[]) => {
      if (isProcessingRef.current) return
      const files = Array.from(incoming)
      const currentCount = photosRef.current.length

      if (currentCount + files.length > MAX_FILES) {
        toast.error(`사진은 최대 ${MAX_FILES}장까지 업로드할 수 있습니다`)
        return
      }

      const invalid = files.find((f) => !ALLOWED_TYPES.has(f.type))
      if (invalid) {
        toast.error(`지원하지 않는 파일 형식입니다: ${invalid.name}`)
        return
      }

      const oversized = files.find((f) => f.size > MAX_FILE_SIZE)
      if (oversized) {
        toast.error(`파일 크기는 20MB 이하여야 합니다: ${oversized.name}`)
        return
      }

      isProcessingRef.current = true
      setIsProcessing(true)
      setCompressionProgress(0)

      try {
        const compressed: Array<{ file: File; compressedSize: number }> = []

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const baseProgress = Math.round((i / files.length) * 100)

          const result = await compressImage(file, (fileProgress) => {
            const overall = Math.round(baseProgress + fileProgress / files.length)
            setCompressionProgress(overall)
          })

          compressed.push({ file: result, compressedSize: result.size })
        }

        setCompressionProgress(100)

        // 압축 완료 후 최신 상태 기준으로 재검증
        const latest = photosRef.current
        if (latest.length + compressed.length > MAX_FILES) {
          toast.error(`사진은 최대 ${MAX_FILES}장까지 업로드할 수 있습니다`)
          return
        }

        const newItems: PhotoItem[] = compressed.map(({ file, compressedSize }) => ({
          file,
          preview: URL.createObjectURL(file),
          compressedSize,
        }))

        const updated = [...latest, ...newItems]
        setPhotos(updated)
        onChange(
          updated.map((p) => p.file),
          thumbnailIndexRef.current
        )
      } catch {
        toast.error('사진 처리 중 오류가 발생했습니다')
      } finally {
        isProcessingRef.current = false
        setIsProcessing(false)
        setCompressionProgress(0)
      }
    },
    [onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files)
      }
    },
    [processFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files)
      }
      // reset value so same file can be selected again
      e.target.value = ''
    },
    [processFiles]
  )

  const handleRemove = useCallback(
    (index: number) => {
      const updated = photos.filter((_, i) => i !== index)
      URL.revokeObjectURL(photos[index].preview)

      let newThumbIdx = thumbnailIndex
      if (index === thumbnailIndex) {
        newThumbIdx = 0
      } else if (index < thumbnailIndex) {
        newThumbIdx = thumbnailIndex - 1
      }

      setPhotos(updated)
      setThumbnailIndex(newThumbIdx)
      onChange(
        updated.map((p) => p.file),
        newThumbIdx
      )
    },
    [photos, thumbnailIndex, onChange]
  )

  const handleSetThumbnail = useCallback(
    (index: number) => {
      setThumbnailIndex(index)
      onChange(
        photos.map((p) => p.file),
        index
      )
    },
    [photos, onChange]
  )

  const isUploading = uploadStates?.some((s) => s === 'uploading')

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        disabled={isProcessing || isUploading}
        className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-lg cursor-pointer transition-colors border-2 border-dashed border-border bg-surface text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ImagePlus size={28} className="text-primary" />
        {isProcessing ? (
          <div className="flex flex-col items-center gap-1 w-full px-8">
            <span className="text-sm">압축 중... {compressionProgress}%</span>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-200"
                style={{ width: `${compressionProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <span className="text-sm">클릭 또는 드래그하여 사진 추가</span>
            <span className="text-xs text-muted-foreground">최대 {MAX_FILES}장, 각 20MB 이하</span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ALLOWED_TYPES_ACCEPT}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {photos.map((photo, index) => {
            const status = uploadStates?.[index] ?? 'idle'
            return (
              <div
                key={photo.preview}
                className={cn(
                  'relative aspect-square rounded-lg overflow-hidden group',
                  status === 'error'
                    ? 'border-2 border-destructive'
                    : index === thumbnailIndex
                      ? 'border-2 border-primary'
                      : 'border border-border'
                )}
              >
                <img
                  src={photo.preview}
                  alt={`사진 ${index + 1}`}
                  className="size-full object-cover"
                />

                {/* 압축 후 파일 크기 배지 */}
                {photo.compressedSize !== undefined && status === 'idle' && (
                  <div className="absolute top-0 inset-x-0 text-center text-[9px] py-0.5 bg-black/50 text-white">
                    {formatBytes(photo.compressedSize)}
                  </div>
                )}

                {/* 업로드 상태 오버레이 */}
                {status === 'uploading' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 size={20} className="text-white animate-spin" />
                  </div>
                )}
                {status === 'done' && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <CheckCircle2 size={22} className="text-white drop-shadow" />
                  </div>
                )}
                {status === 'error' && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
                    <XCircle size={20} className="text-destructive" />
                    {onRetry && (
                      <button
                        type="button"
                        onClick={() => onRetry(index)}
                        className="flex items-center gap-0.5 text-[10px] font-bold text-white bg-destructive/80 px-2 py-0.5 rounded-full"
                      >
                        <RotateCcw size={9} />
                        재시도
                      </button>
                    )}
                  </div>
                )}

                {/* 일반 호버 버튼 — 업로드 중이 아닐 때만 */}
                {status === 'idle' && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-start justify-between p-1">
                    {/* Thumbnail star */}
                    <button
                      type="button"
                      onClick={() => handleSetThumbnail(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      title="썸네일로 지정"
                    >
                      <Star
                        size={18}
                        fill={index === thumbnailIndex ? 'currentColor' : 'none'}
                        className={index === thumbnailIndex ? 'text-primary' : 'text-white'}
                      />
                    </button>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-0.5 bg-(--overlay-bg)"
                      title="삭제"
                    >
                      <X size={14} className="text-primary-foreground" />
                    </button>
                  </div>
                )}

                {/* Thumbnail badge */}
                {index === thumbnailIndex && status === 'idle' && (
                  <div className="absolute bottom-0 inset-x-0 text-center text-[10px] py-0.5 font-medium bg-primary text-primary-foreground">
                    썸네일
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
