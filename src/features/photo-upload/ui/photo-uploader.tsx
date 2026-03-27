import { useCallback, useEffect, useRef, useState } from 'react'

import { ImagePlus, Star, X } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/shared/lib/utils'

const MAX_FILES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

interface PhotoItem {
  file: File
  preview: string
}

interface Props {
  onChange: (files: File[], thumbnailIndex: number) => void
}

export function PhotoUploader({ onChange }: Props) {
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [thumbnailIndex, setThumbnailIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const photosRef = useRef<PhotoItem[]>([])

  // photosRef를 최신 photos와 동기화
  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  // 언마운트 시 생성된 모든 object URL 해제
  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.preview))
    }
  }, [])

  const processFiles = useCallback(
    (incoming: FileList | File[]) => {
      const files = Array.from(incoming)
      const currentCount = photos.length

      if (currentCount + files.length > MAX_FILES) {
        toast.error(`사진은 최대 ${MAX_FILES}장까지 업로드할 수 있습니다`)
        return
      }

      const oversized = files.find((f) => f.size > MAX_FILE_SIZE)
      if (oversized) {
        toast.error(`파일 크기는 5MB 이하여야 합니다: ${oversized.name}`)
        return
      }

      const newItems: PhotoItem[] = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))

      const updated = [...photos, ...newItems]
      setPhotos(updated)
      onChange(
        updated.map((p) => p.file),
        thumbnailIndex
      )
    },
    [photos, thumbnailIndex, onChange]
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

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-lg cursor-pointer transition-colors border-2 border-dashed border-(--primary-border) bg-surface text-muted-foreground"
      >
        <ImagePlus size={28} className="text-primary" />
        <span className="text-sm">클릭 또는 드래그하여 사진 추가</span>
        <span className="text-xs text-muted-foreground">최대 {MAX_FILES}장, 각 5MB 이하</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {photos.map((photo, index) => (
            <div
              key={photo.preview}
              className={cn(
                'relative aspect-square rounded-lg overflow-hidden group',
                index === thumbnailIndex ? 'border-2 border-primary' : 'border border-border'
              )}
            >
              <img
                src={photo.preview}
                alt={`사진 ${index + 1}`}
                className="size-full  object-cover"
              />

              {/* Overlay buttons */}
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

              {/* Thumbnail badge */}
              {index === thumbnailIndex && (
                <div className="absolute bottom-0 inset-x-0 text-center text-[10px] py-0.5 font-medium bg-primary text-primary-foreground">
                  썸네일
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
