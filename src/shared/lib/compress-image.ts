import imageCompression from 'browser-image-compression'

const MAX_SIZE_MB = 1
const MAX_DIMENSION = 1920

const SKIP_FORMATS = new Set(['image/svg+xml'])

export interface CompressResult {
  file: File
  originalSize: number
  compressedSize: number
}

export async function compressImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<CompressResult> {
  const originalSize = file.size

  if (!file.type.startsWith('image/') || SKIP_FORMATS.has(file.type)) {
    return { file, originalSize, compressedSize: originalSize }
  }

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: MAX_SIZE_MB,
      maxWidthOrHeight: MAX_DIMENSION,
      useWebWorker: true,
      onProgress,
    })

    const ext = file.name.match(/\.\w+$/) ? '.jpg' : ''
    const name = ext ? file.name.replace(/\.\w+$/, '.jpg') : file.name
    const compressedFile = new File([compressed], name, { type: 'image/jpeg' })

    return {
      file: compressedFile,
      originalSize,
      compressedSize: compressedFile.size,
    }
  } catch {
    return { file, originalSize, compressedSize: originalSize }
  }
}
