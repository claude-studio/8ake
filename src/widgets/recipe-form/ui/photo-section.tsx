import { PhotoUploader, type PhotoUploadStatus } from '@/features/photo-upload'

interface Props {
  onChange: (files: File[], thumbnailIndex: number) => void
  uploadStates?: PhotoUploadStatus[]
  onRetry?: (index: number) => void
}

export function PhotoSection({ onChange, uploadStates, onRetry }: Props) {
  return <PhotoUploader onChange={onChange} uploadStates={uploadStates} onRetry={onRetry} />
}
