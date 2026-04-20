import imageCompression from 'browser-image-compression'

const MAX_SIZE_MB = 1
const MAX_DIMENSION = 1920

const SKIP_FORMATS = new Set(['image/svg+xml'])

export async function compressImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  if (SKIP_FORMATS.has(file.type)) return file

  const options = {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_DIMENSION,
    useWebWorker: true,
    onProgress,
  }

  try {
    const compressed = await imageCompression(file, options)
    return new File([compressed], file.name.replace(/\.\w+$/, '.jpg'), {
      type: 'image/jpeg',
    })
  } catch {
    return file
  }
}
