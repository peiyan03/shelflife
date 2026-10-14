// Browser only. Re-encode any image (HEIC from an iPhone included, where the browser can
// decode it) to a JPEG with a 1600 px long edge at quality 0.8, so the upload is small and
// in a format the vision model accepts.

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const MAX_EDGE = 1600

export class ImageDecodeError extends Error {
  constructor() {
    super('Could not read this image. Try a JPEG or PNG.')
    this.name = 'ImageDecodeError'
  }
}

export class ImageTooLargeError extends Error {
  constructor() {
    super('That image is over 5 MB even after shrinking. Try a smaller photo.')
    this.name = 'ImageTooLargeError'
  }
}

export async function reencodeToJpeg(file: File): Promise<File> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new ImageDecodeError()
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new ImageDecodeError()
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8))
  if (!blob) throw new ImageDecodeError()
  if (blob.size > MAX_UPLOAD_BYTES) throw new ImageTooLargeError()
  return new File([blob], 'receipt.jpg', { type: 'image/jpeg' })
}
