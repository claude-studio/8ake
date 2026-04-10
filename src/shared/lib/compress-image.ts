const MAX_DIMENSION = 1920
const JPEG_QUALITY = 0.85

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmap

  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION && file.size <= 1024 * 1024) {
    bitmap.close()
    return file
  }

  const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height, 1)
  const targetW = Math.round(width * ratio)
  const targetH = Math.round(height * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, targetW, targetH)
  bitmap.close()

  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), 'image/jpeg', JPEG_QUALITY)
  )

  const name = file.name.replace(/\.\w+$/, '.jpg')
  return new File([blob], name, { type: 'image/jpeg' })
}
