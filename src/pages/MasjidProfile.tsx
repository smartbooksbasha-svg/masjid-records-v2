import { useState } from 'react'
import { Building2, Check, ImagePlus, Save, Trash2, Upload } from 'lucide-react'
import { settings } from '../lib/settings'
import { compressImage } from '../lib/image'
import { Btn, Card, Field, Input, PageHeader, TextArea } from '../components/ui'

const MAX_PHOTOS = 6

export default function MasjidProfile() {
  const s = settings.use()
  const [saved, setSaved] = useState(false)
  const set = <K extends keyof typeof s>(k: K, v: (typeof s)[K]) => settings.update((p) => ({ ...p, [k]: v }))

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 1800) }

  async function addPhoto(file?: File) {
    if (!file || s.photos.length >= MAX_PHOTOS) return
    try {
      const url = await compressImage(file, 1100, 0.72)
      settings.update((p) => ({ ...p, photos: [...p.photos, url] }))
    } catch { /* ignore bad file */ }
  }

  async function addLogo(file?: File) {
    if (!file) return
    try {
      const url = await compressImage(file, 320, 0.9)
      set('logo', url)
    } catch { /* ignore */ }
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Masjid Profile"
        sub="Committee ki tafseel — report aur ID cards par yahi chhapti hai."
        actions={<Btn onClick={flash}><Save size={16} /> Save</Btn>}
      />

      {saved && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[12.5px] font-bold text-emerald-700">
          <Check size={15} /> Profile saved.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card className="p-5">
          <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Committee details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Masjid / committee name">
              <Input value={s.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label="Tagline">
              <Input value={s.tagline} onChange={(e) => set('tagline', e.target.value)} />
            </Field>
            <Field label="Registration no.">
              <Input value={s.regNo} onChange={(e) => set('regNo', e.target.value)} placeholder="e.g. TN/2019/00412" />
            </Field>
            <Field label="In-charge / President">
              <Input value={s.incharge} onChange={(e) => set('incharge', e.target.value)} placeholder="e.g. Abdul Rahman" />
            </Field>
            <Field label="Phone">
              <Input value={s.phone} onChange={(e) => set('phone', e.target.value)} inputMode="tel" placeholder="e.g. 98400 11223" />
            </Field>
            <Field label="Email">
              <Input value={s.email} onChange={(e) => set('email', e.target.value)} type="email" placeholder="committee@example.com" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address">
                <TextArea value={s.address} onChange={(e) => set('address', e.target.value)} />
              </Field>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="mb-3 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Committee logo</h3>
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-azure-600 text-white">
                {s.logo ? <img src={s.logo} alt="" className="h-full w-full object-cover" /> : <Building2 size={26} />}
              </span>
              <div className="flex flex-col gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-[12.5px] font-bold text-ink-soft hover:border-azure-200">
                  <Upload size={14} /> Upload logo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => addLogo(e.target.files?.[0])} />
                </label>
                {s.logo && (
                  <button type="button" onClick={() => set('logo', '')} className="inline-flex items-center gap-1 text-[12px] font-bold text-red-600">
                    <Trash2 size={13} /> Remove
                  </button>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Masjid photos ({s.photos.length}/{MAX_PHOTOS})</h3>
            <div className="grid grid-cols-3 gap-2">
              {s.photos.map((p, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-line">
                  <img src={p} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => settings.update((prev) => ({ ...prev, photos: prev.photos.filter((_, j) => j !== i) }))}
                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-lg bg-ink/70 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {s.photos.length < MAX_PHOTOS && (
                <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border border-dashed border-line text-ink-mute transition hover:border-azure-300 hover:text-azure-600">
                  <ImagePlus size={20} />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => addPhoto(e.target.files?.[0])} />
                </label>
              )}
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-ink-mute">Photos device par compress hoke save hoti hain (~1100px).</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
