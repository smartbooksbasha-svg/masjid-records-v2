import QRCode from 'qrcode'

export interface QrOptions {
  size?: number
  dark?: string
  light?: string
}

/** Family ID card payload — scanned by the Find Family scanner. */
export function familyQrPayload(familyId: string): string {
  return `${location.origin}${location.pathname}#/households/${familyId}`
}

export async function qrDataUrl(text: string, opts: QrOptions = {}): Promise<string> {
  const { size = 256, dark = '#0c1116', light = '#ffffff' } = opts
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark, light },
  })
}

export async function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' })
}

/** Extract a Family ID from a scanned QR payload (URL or raw id). */
export function familyIdFromScan(payload: string): string | null {
  const raw = payload.trim()
  const m = raw.match(/MK-\d{4}-\d{4}/i)
  if (m) return m[0].toUpperCase()
  const tail = raw.split('/').pop()
  return tail && /^MK-/i.test(tail) ? tail.toUpperCase() : null
}
