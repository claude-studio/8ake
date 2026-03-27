import { PhotoUploader } from '@/features/photo-upload'

interface Props {
  onChange: (files: File[], thumbnailIndex: number) => void
}

export function PhotoSection({ onChange }: Props) {
  return <PhotoUploader onChange={onChange} />
}
