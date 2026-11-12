import { useRef, useState } from 'react'
import { AlertTriangle, Check, Download, Moon, RefreshCw, Smartphone, Sun, Upload } from 'lucide-react'
import { clsx } from 'clsx'
import { settings } from '../lib/settings'
import { LANGS } from '../lib/i18n'
import { currentUser } from '../lib/auth'
import { getAllFamilies, replaceAll } from '../lib/store'
import { jsonBackup } from '../lib/exports'
import { audit } from '../lib/audit'
import { forceUpdate as hardReload, useInstallPrompt } from '../lib/pwa'
import { Btn, Card, PageHeader } from '../components/ui'
import { RequireOwner } from '../components/Guard'
import type { Family } from '../lib/types'

const APP_VER = '0.9 · Sanctum'

export default function Settings() {
  return (
    <RequireOwner>
      <SettingsInner />
    </RequireOwner>
  )
}

function SettingsInner() {
  const s = settings.use()
  const me = currentUser()
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [flash, setFlash] = useState('')
  const say = (m: string) => { setFlash(m); setTimeout(() => setFlash(''), 2400) }

  async function restore(file?: File) {
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text) as { families?: Family[]; settings?: typeof s }
      if (!Array.isArray(data.families)) { say('Backup file theek nahi lagti.'); return }
      replaceAll(data.families, me?.name ?? 'owner')
      if (data.settings) settings.set({ ...settings.get(), ...data.settings })
      say(`${data.families.length} households restore ho gaye.`)
    } catch {
      say('Backup file padhi nahi ja saki.')
    }
  }

  const { canInstall, installed, install } = useInstallPrompt()

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Settings" sub="Appearance, language, backup aur app version." />

      {flash && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[12.5px] font-bold text-emerald-700">{flash}</div>}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Appearance</h3>
          <div className="flex gap-3">
            {(['light', 'dark'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => settings.update((p) => ({ ...p, theme: t }))}
                className={clsx('flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[13px] font-bold transition', s.theme === t ? 'border-azure-600 bg-azure-600 text-white' : 'border-line text-ink-soft hover:border-azure-200')}
              >
                {t === 'light' ? <Sun size={16} /> : <Moon size={16} />} {t === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Language</h3>
          <div className="grid grid-cols-2 gap-2">
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => settings.update((p) => ({ ...p, lang: l.id }))}
                className={clsx('rounded-xl border px-4 py-3 text-[13px] font-bold transition', s.lang === l.id ? 'border-azure-600 bg-azure-600 text-white' : 'border-line text-ink-soft hover:border-azure-200')}
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] text-ink-mute">Urdu select karne par layout RTL ho jata hai.</p>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Backup & restore</h3>
          <p className="mb-4 text-[11.5px] text-ink-mute">{getAllFamilies().length} households currently stored on this device.</p>
          <div className="flex flex-wrap gap-2">
            <Btn variant="ghost" onClick={() => { jsonBackup({ families: getAllFamilies(), settings: settings.get() }); audit.log(me?.name ?? 'owner', 'data.backup', 'manual backup'); say('Backup downloaded.') }}>
              <Download size={15} /> Download backup
            </Btn>
            <Btn variant="ghost" onClick={() => fileRef.current?.click()}>
              <Upload size={15} /> Restore from file
            </Btn>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => restore(e.target.files?.[0])} />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Install app</h3>
          {installed ? (
            <p className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-700"><Check size={14} /> App already installed on this device.</p>
          ) : canInstall ? (
            <>
              <p className="mb-4 text-[11.5px] text-ink-mute">Phone/desktop par install karo — offline bhi chalega, home screen par icon aa jayega.</p>
              <Btn onClick={() => install()}><Smartphone size={15} /> Install app</Btn>
            </>
          ) : (
            <p className="text-[11.5px] leading-relaxed text-ink-mute">
              Browser menu se install karo — Chrome: <b>⋮ → Install app</b>; iPhone Safari: <b>Share → Add to Home Screen</b>.
            </p>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">App</h3>
          <div className="flex items-center justify-between border-b border-line pb-3 text-[12.5px]">
            <span className="text-ink-mute">Version</span>
            <span className="font-bold text-ink">{APP_VER}</span>
          </div>
          <div className="flex items-center justify-between border-b border-line py-3 text-[12.5px]">
            <span className="text-ink-mute">Storage</span>
            <span className="font-bold text-ink">On-device</span>
          </div>
          <div className="flex items-center justify-between py-3 text-[12.5px]">
            <span className="text-ink-mute">Works offline</span>
            <span className="font-bold text-ink">Yes</span>
          </div>
          <p className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-700"><Check size={13} /> Auto-update on.</p>
          <Btn variant="ghost" className="mt-3" onClick={() => hardReload()}><RefreshCw size={15} /> Force update</Btn>
        </Card>
      </div>

      <p className="mt-5 inline-flex items-start gap-2 text-[11.5px] leading-relaxed text-ink-mute">
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        Data browser ke localStorage me hai. Browser data clear karne se record bhi hat jayega — isliye waqt-waqt par backup lete raho.
      </p>
    </div>
  )
}
