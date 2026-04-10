const MAX_DIMENSION = 1920
const JPEG_QUALITY = 0.85
const PASSTHROUGH_SIZE = 1024 * 1024

// createImageBitmap이 디코딩 불가 or 래스터화 손실이 큰 포맷은 변환 생략
const SKIP_FORMATS = new Set(['image/svg+xml'])

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  if (SKIP_FORMATS.has(file.type)) return file

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file
  }

  try {
    const { width, height } = bitmap

    if (width <= MAX_DIMENSION && height <= MAX_DIMENSION && file.size <= PASSTHROUGH_SIZE) {
      return file
    }

    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height, 1)
    const targetW = Math.round(width * ratio)
    const targetH = Math.round(height * ratio)

    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.drawImage(bitmap, 0, 0, targetW, targetH)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', JPEG_QUALITY)
    )
    if (!blob) return file

    const name = file.name.replace(/\.\w+$/, '.jpg')
    return new File([blob], name, { type: 'image/jpeg' })
  } catch {
    return file
  } finally {
    bitmap.close()
  }
}
