import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import jsQR from 'jsqr'
import { Camera, MapPin, Phone, QrCode, Search, X } from 'lucide-react'
import { useFamilies } from '../lib/store'
import { ageOf } from '../lib/stats'
import { familyIdFromScan } from '../lib/qr'
import { Btn, Card, PageHeader } from '../components/ui'

/* ---------------- QR scanner (camera) ---------------- */

function QrScanner({ onResult, onClose }: { onResult: (text: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const stop = () => {
      cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        video.setAttribute('playsinline', 'true')
        await video.play()

        const tick = () => {
          const canvas = canvasRef.current
          if (video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
              const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
              const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' })
              if (code?.data) {
                stop()
                onResult(code.data)
                return
              }
            }
          }
          rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
      } catch {
        setError('Camera open nahi ho paya. Permission do ya QR ke neeche Family ID type karo.')
      }
    }
    start()

    const onHide = () => { if (document.hidden) stop() }
    document.addEventListener('visibilitychange', onHide)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onHide)
      stop()
    }
  }, [onResult])

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2 text-[13px] font-bold"><QrCode size={16} className="text-azure-600" /> Scan Family QR</div>
          <button aria-label="Close scanner" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink-soft">
            <X size={16} />
          </button>
        </div>
        <div className="relative aspect-[4/3] w-full bg-ink/90">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="h-40 w-40 rounded-2xl border-2 border-white/80" />
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="px-4 py-3">
          {error ? (
            <p className="text-[12px] font-semibold text-red-600">{error}</p>
          ) : (
            <p className="text-[12px] text-ink-mute">Family ID card ka QR frame ke andar laao — apne aap scan ho jayega.</p>
          )}
        </div>
      </Card>
    </div>
  )
}

/* ---------------- Find Family page ---------------- */

export default function FindFamily() {
  const families = useFamilies()
  const [q, setQ] = useState('')
  const [scan, setScan] = useState(false)

  const needle = q.trim().toLowerCase()
  const results = useMemo(() => {
    if (!needle) return []
    return families.filter((f) =>
      [f.id, f.head, f.phone, f.street, f.houseNo, f.address, ...f.members.map((m) => m.name)]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }, [families, needle])

  const onScanResult = (text: string) => {
    const id = familyIdFromScan(text)
    setScan(false)
    setQ(id ?? text.trim())
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Find Family"
        sub="Family ID, naam, phone ya QR se household dhoondo."
        actions={<Btn onClick={() => setScan(true)}><Camera size={16} /> Scan QR</Btn>}
      />

      <Card className="p-4">
        <div className="relative">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            placeholder="e.g. MK-2026-0001, Abdul Rahman, 98400…"
            className="w-full rounded-xl border border-line bg-white py-3.5 pl-11 pr-3 text-[14px] text-ink outline-none transition placeholder:text-ink-mute/60 focus:border-azure-400 focus:ring-2 focus:ring-azure-100"
          />
        </div>
        <p className="mt-2 text-[11.5px] text-ink-mute">
          Tip: poori Family ID daalo to seedha wahi ghar khulega.
        </p>
      </Card>

      <div className="mt-5">
        {needle && (
          <p className="mb-3 text-[12px] font-bold text-ink-mute">
            {results.length} {results.length === 1 ? 'result' : 'results'} for “{q.trim()}”
          </p>
        )}

        {results.length > 0 ? (
          <div className="space-y-2.5">
            {results.map((f) => (
              <Link key={f.id} to={`/households/${f.id}`} className="block">
                <Card className="flex items-center gap-4 p-4 transition hover:border-azure-200 hover:shadow-float">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-azure-50 font-display text-sm font-bold text-azure-600">
                    {f.members.length}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-bold text-ink">{f.head || 'Unnamed household'}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-ink-mute">
                      <span className="inline-flex items-center gap-1"><MapPin size={12} /> {f.street || '—'}</span>
                      {f.phone && <span className="inline-flex items-center gap-1"><Phone size={12} /> {f.phone}</span>}
                      <span className="mono rounded bg-azure-50 px-1.5 py-0.5 text-[10px] font-bold text-azure-600">{f.id}</span>
                    </div>
                  </div>
                  <span className="hidden shrink-0 text-[11px] font-semibold text-ink-mute sm:block">
                    {f.members.filter((m) => ageOf(m.dob) >= 18).length} adults
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="px-6 py-14 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-azure-50 text-azure-600">
              {needle ? <Search size={22} /> : <QrCode size={22} />}
            </div>
            <h3 className="font-display text-lg font-bold">{needle ? 'Koi match nahi mila' : 'Family dhoondo'}</h3>
            <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] text-ink-mute">
              {needle
                ? 'Spelling check karo, ya Family ID card ka QR scan karo.'
                : 'Upar search box me Family ID / naam likho, ya QR scan button dabao.'}
            </p>
            {!needle && <Btn className="mt-5" onClick={() => setScan(true)}><Camera size={16} /> Scan QR</Btn>}
          </Card>
        )}
      </div>

      {scan && <QrScanner onResult={onScanResult} onClose={() => setScan(false)} />}
    </div>
  )
}
