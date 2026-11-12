/** Read a File and return a compressed JPEG/PNG data URL. */
export function compressImage(file: File, maxSize = 1100, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Not a valid image'))
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Canvas unavailable')); return }
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)
        ctx.drawImage(img, 0, 0, w, h)
        const isPng = /png/i.test(file.type)
        resolve(canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', quality))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

/** Downscale an existing data URL (used for logos). */
export function shrinkDataUrl(src: string, maxSize = 320, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onerror = () => reject(new Error('Not a valid image'))
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas unavailable')); return }
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/png'))
    }
    img.src = src
  })
}
