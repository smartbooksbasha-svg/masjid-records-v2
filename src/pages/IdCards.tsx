import { useEffect, useMemo, useState } from 'react'
import { Check, IdCard, Printer, Upload, X } from 'lucide-react'
import { clsx } from 'clsx'
import { createStore } from '../lib/storeFactory'
import { useFamilies } from '../lib/store'
import { settings } from '../lib/settings'
import { familyQrPayload, qrDataUrl } from '../lib/qr'
import { printHTML } from '../lib/exports'
import { compressImage } from '../lib/image'
import { ageOf } from '../lib/stats'
import { Btn, Card, Field, Input, PageHeader, Select, TextArea } from '../components/ui'
import type { Family } from '../lib/types'

export interface CardConfig {
  size: '5x3' | '3x5' | 'id1'
  org: string
  sub: string
  tag: string
  accent: string
  logo: string
  footerLeft: string
  footerRight: string
  terms: string
  scale: number
}

export const CARD_SIZES: Record<CardConfig['size'], { label: string; w: number; h: number }> = {
  '5x3': { label: '5 × 3 in (landscape)', w: 127, h: 76.2 },
  '3x5': { label: '3 × 5 in (portrait)', w: 76.2, h: 127 },
  id1: { label: 'ID-1 card (85.6 × 54 mm)', w: 85.6, h: 54 },
}

export const IDCARD_DEFAULT: CardConfig = {
  size: '5x3',
  org: '',
  sub: '',
  tag: 'FAMILY IDENTITY CARD',
  accent: '#0e5c86',
  logo: '',
  footerLeft: 'Authorised Signatory',
  footerRight: 'Masjid Khidmat Committee',
  terms:
    '1. Yeh card masjid committee dwara jaari kiya gaya hai.\n2. Card kisi aur ko transfer nahi kiya ja sakta.\n3. Family details update karane ke liye committee se rabta karein.\n4. Gum hone par turant committee ko ittila dein.',
  scale: 1,
}

export const idcard = createStore<CardConfig>('mkr_idcard_v2', IDCARD_DEFAULT)

function resolved(cfg: CardConfig): CardConfig {
  const s = settings.get()
  return {
    ...cfg,
    org: cfg.org || s.name,
    sub: cfg.sub || s.tagline,
    footerRight: cfg.footerRight || s.name,
    logo: cfg.logo || s.logo,
  }
}

function esc(v: unknown) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function cardHTML(cfg: CardConfig, f: Family, qr: string): string {
  const c = resolved(cfg)
  const sz = CARD_SIZES[c.size]
  const head = f.members.find((m) => m.relation === 'Head') ?? f.members[0]
  const members = f.members.map((m) => `${esc(m.name)} (${esc(m.relation)})`).join(', ')
  return `
    <div class="idcard" style="width:${sz.w}mm;height:${sz.h}mm">
      <div class="ic-head">
        <div class="ic-crest" style="background:${c.accent}">${c.logo ? `<img src="${c.logo}" style="width:100%;height:100%;object-fit:cover;border-radius:2mm" />` : ''}</div>
        <div>
          <div class="ic-name">${esc(c.org)}</div>
          <div class="ic-tag" style="color:${c.accent}">${esc(c.tag)}</div>
        </div>
      </div>
      <div class="ic-body">
        <img class="ic-qr" src="${qr}" alt="QR" />
        <div class="ic-kv">
          <div><b>Family ID</b> ${esc(f.id)}</div>
          <div><b>Head</b> ${esc(head?.name || f.head || '—')}</div>
          <div><b>Relation</b> ${esc(head?.relation || 'Head')}${head?.dob ? ` · ${ageOf(head.dob)} yrs` : ''}</div>
          <div><b>Street</b> ${esc(f.street || '—')}${f.houseNo ? ` · House ${esc(f.houseNo)}` : ''}</div>
          ${f.phone ? `<div><b>Phone</b> ${esc(f.phone)}</div>` : ''}
        </div>
      </div>
      <div class="ic-foot">
        <span>${esc(members).slice(0, 150)}</span>
        <span>${esc(c.footerRight)}</span>
      </div>
    </div>`
}

export default function IdCards() {
  const families = useFamilies()
  const cfg = idcard.use()
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [preview, setPreview] = useState<string>('')
  const [busy, setBusy] = useState(false)

  const set = <K extends keyof CardConfig>(k: K, v: CardConfig[K]) => idcard.update((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    if (!sel.size && families[0]) setSel(new Set([families[0].id]))
  }, [families, sel.size])

  useEffect(() => {
    let live = true
    const id = [...sel][0] ?? families[0]?.id
    if (!id) return
    qrDataUrl(familyQrPayload(id), { size: 220 })
      .then((u) => { if (live) setPreview(u) })
      .catch(() => { if (live) setPreview('') })
    return () => { live = false }
  }, [sel, families])

  const toggle = (id: string) =>
    setSel((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const chosen = useMemo(() => families.filter((f) => sel.has(f.id)), [families, sel])

  async function printCards() {
    setBusy(true)
    try {
      const list = chosen.length ? chosen : families.slice(0, 1)
      const parts: string[] = []
      for (const f of list) {
        const qr = await qrDataUrl(familyQrPayload(f.id), { size: 220 })
        parts.push(cardHTML(cfg, f, qr))
      }
      const termsText = resolved(cfg).terms
      const termsBlock = termsText
        ? `<div class="fam-card"><h4>Terms &amp; Conditions</h4><div class="kv">${esc(termsText).replace(/\n/g, '<br/>')}</div></div>`
        : ''
      printHTML(parts.join('') + termsBlock, `${resolved(cfg).org} — ID Cards`)
    } finally {
      setBusy(false)
    }
  }

  async function uploadLogo(file?: File) {
    if (!file) return
    try { set('logo', await compressImage(file, 320, 0.9)) } catch { /* ignore */ }
  }

  const c = resolved(cfg)
  const sz = CARD_SIZES[c.size]
  const previewFamily = chosen[0] ?? families[0]

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="ID Card Designer"
        sub="Card ka design set karo, ghar chuno, aur print/PDF nikalo."
        actions={<Btn onClick={printCards} disabled={busy}><Printer size={16} /> {busy ? 'Ban raha…' : `Print ${chosen.length || 1} card(s)`}</Btn>}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        {/* Config */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Card settings</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Card size">
                <Select value={cfg.size} onChange={(e) => set('size', e.target.value as CardConfig['size'])}>
                  {Object.entries(CARD_SIZES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </Select>
              </Field>
              <Field label="Accent colour">
                <div className="flex items-center gap-2">
                  <input type="color" value={cfg.accent} onChange={(e) => set('accent', e.target.value)} className="h-11 w-14 cursor-pointer rounded-xl border border-line bg-white p-1" />
                  <Input value={cfg.accent} onChange={(e) => set('accent', e.target.value)} className="mono" />
                </div>
              </Field>
              <Field label="Organisation name">
                <Input value={cfg.org} onChange={(e) => set('org', e.target.value)} placeholder={settings.get().name} />
              </Field>
              <Field label="Sub-title">
                <Input value={cfg.sub} onChange={(e) => set('sub', e.target.value)} placeholder={settings.get().tagline} />
              </Field>
              <Field label="Card tag line">
                <Input value={cfg.tag} onChange={(e) => set('tag', e.target.value)} />
              </Field>
              <Field label="Text scale" hint={`${cfg.scale.toFixed(2)}×`}>
                <input type="range" min={0.85} max={1.35} step={0.01} value={cfg.scale} onChange={(e) => set('scale', Number(e.target.value))} className="w-full accent-azure-600" />
              </Field>
              <Field label="Footer left">
                <Input value={cfg.footerLeft} onChange={(e) => set('footerLeft', e.target.value)} />
              </Field>
              <Field label="Footer right">
                <Input value={cfg.footerRight} onChange={(e) => set('footerRight', e.target.value)} placeholder={settings.get().name} />
              </Field>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] font-bold text-ink-soft hover:border-azure-200">
                <Upload size={15} /> Upload logo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadLogo(e.target.files?.[0])} />
              </label>
              {cfg.logo && (
                <span className="inline-flex items-center gap-2 text-[12px] text-ink-mute">
                  <img src={cfg.logo} alt="" className="h-9 w-9 rounded-lg object-cover" />
                  <button type="button" onClick={() => set('logo', '')} className="inline-flex items-center gap-1 font-bold text-red-600"><X size={13} /> Remove</button>
                </span>
              )}
            </div>

            <div className="mt-4">
              <Field label="Back-side terms & conditions">
                <TextArea value={cfg.terms} onChange={(e) => set('terms', e.target.value)} />
              </Field>
            </div>

            <div className="mt-4 flex gap-2">
              <Btn variant="ghost" onClick={() => idcard.set({ ...IDCARD_DEFAULT, logo: cfg.logo })}>Reset to default</Btn>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Select households ({chosen.length})</h3>
              <div className="flex gap-2">
                <button type="button" className="text-[12px] font-bold text-azure-600" onClick={() => setSel(new Set(families.map((f) => f.id)))}>All</button>
                <button type="button" className="text-[12px] font-bold text-ink-mute" onClick={() => setSel(new Set())}>None</button>
              </div>
            </div>
            <div className="max-h-[320px] space-y-1.5 overflow-y-auto pr-1">
              {families.map((f) => (
                <label key={f.id} className={clsx('flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition', sel.has(f.id) ? 'border-azure-400 bg-azure-50/60' : 'border-line hover:border-azure-200')}>
                  <span className={clsx('grid h-5 w-5 shrink-0 place-items-center rounded-md border', sel.has(f.id) ? 'border-azure-600 bg-azure-600 text-white' : 'border-line')}>
                    {sel.has(f.id) && <Check size={13} />}
                  </span>
                  <input type="checkbox" className="hidden" checked={sel.has(f.id)} onChange={() => toggle(f.id)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold text-ink">{f.head || 'Unnamed'}</span>
                    <span className="mono block truncate text-[10.5px] text-ink-mute">{f.id} · {f.street}</span>
                  </span>
                </label>
              ))}
              {!families.length && <p className="py-6 text-center text-[12.5px] text-ink-mute">Pehle koi household add karo.</p>}
            </div>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <h3 className="mb-3 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Live preview</h3>
          <Card className="p-4">
            {previewFamily ? (
              <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-xl border border-line bg-white p-4 shadow-card" style={{ aspectRatio: `${sz.w}/${sz.h}` }}>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg text-white" style={{ background: c.accent }}>
                    {c.logo && <img src={c.logo} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-display text-[13px] font-bold leading-tight" style={{ fontSize: `${13 * c.scale}px` }}>{c.org}</div>
                    <div className="truncate text-[7px] font-bold uppercase tracking-[.18em]" style={{ color: c.accent }}>{c.tag}</div>
                  </div>
                </div>
                <div className="mt-3 flex gap-3">
                  {preview && <img src={preview} alt="QR" className="h-20 w-20 shrink-0 rounded" />}
                  <div className="min-w-0 space-y-0.5 text-[10.5px] leading-tight text-ink-soft" style={{ fontSize: `${10.5 * c.scale}px` }}>
                    <div><b>Family ID</b> {previewFamily.id}</div>
                    <div><b>Head</b> {previewFamily.members[0]?.name || previewFamily.head}</div>
                    <div><b>Street</b> {previewFamily.street}{previewFamily.houseNo ? ` · ${previewFamily.houseNo}` : ''}</div>
                    {previewFamily.phone && <div><b>Phone</b> {previewFamily.phone}</div>}
                  </div>
                </div>
                <div className="mt-3 truncate border-t border-line pt-2 text-[9px] text-ink-mute">
                  {previewFamily.members.map((m) => m.name).join(', ')}
                </div>
              </div>
            ) : (
              <div className="grid h-40 place-items-center text-[12.5px] text-ink-mute">Koi household nahi</div>
            )}
            <p className="mt-3 text-[11.5px] leading-relaxed text-ink-mute">
              <IdCard size={12} className="mr-1 inline" />
              Print par har card ke saath QR + back-side terms aayenge.
            </p>
            <Btn className="mt-3 w-full" onClick={printCards} disabled={busy}>
              <Printer size={16} /> {busy ? 'Taiyar ho raha…' : 'Print / Save PDF'}
            </Btn>
            <p className="mt-2 text-center text-[11px] text-ink-mute">Design har change par khud save hota hai.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
