export type PhotoUploadStatus = 'idle' | 'uploading' | 'done' | 'error'

export interface PhotoUploadState {
  index: number
  status: PhotoUploadStatus
}
