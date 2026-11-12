import { useState } from 'react'
import { AlertTriangle, Check, Database, RotateCcw, Save, ShieldCheck, Trash2 } from 'lucide-react'
import { settings } from '../lib/settings'
import { currentUser } from '../lib/auth'
import { getAllFamilies, replaceAll, resetSample } from '../lib/store'
import { audit } from '../lib/audit'
import { jsonBackup } from '../lib/exports'
import { Btn, Card, Field, Input, PageHeader } from '../components/ui'
import { RequireOwner } from '../components/Guard'

export default function Administration() {
  return (
    <RequireOwner>
      <AdminInner />
    </RequireOwner>
  )
}

function AdminInner() {
  const s = settings.use()
  const me = currentUser()
  const [flash, setFlash] = useState('')
  const [confirmWipe, setConfirmWipe] = useState(false)

  const say = (m: string) => { setFlash(m); setTimeout(() => setFlash(''), 2200) }
  const set = <K extends keyof typeof s>(k: K, v: (typeof s)[K]) => settings.update((p) => ({ ...p, [k]: v }))

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Administration" sub="Owner settings, ID formats aur data controls." />

      {flash && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[12.5px] font-bold text-emerald-700">{flash}</div>}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-1 flex items-center gap-2 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute"><ShieldCheck size={14} /> Owner</h3>
          <p className="mb-4 text-[11.5px] text-ink-mute">Owner account sirf yahi se badalta hai. Logged in as <b className="text-ink">{me?.name}</b> ({me?.id}).</p>
          <div className="grid gap-4">
            <Field label="Owner name"><Input value={s.ownerName} onChange={(e) => set('ownerName', e.target.value)} /></Field>
            <Field label="Owner email"><Input type="email" value={s.ownerEmail} onChange={(e) => set('ownerEmail', e.target.value)} /></Field>
          </div>
          <Btn className="mt-4" onClick={() => { say('Owner details saved.'); audit.log(me?.name ?? 'owner', 'settings.owner', s.ownerEmail) }}><Save size={15} /> Save owner</Btn>
        </Card>

        <Card className="p-5">
          <h3 className="mb-1 flex items-center gap-2 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute"><Database size={14} /> Family ID format</h3>
          <p className="mb-4 text-[11.5px] text-ink-mute">Naye households ka ID isi prefix + number se banega.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ID prefix"><Input value={s.idPrefix} onChange={(e) => set('idPrefix', e.target.value.toUpperCase())} className="mono" /></Field>
            <Field label="Next number"><Input type="number" min={1} value={s.idStart} onChange={(e) => set('idStart', Number(e.target.value) || 1)} className="mono" /></Field>
          </div>
          <p className="mt-3 text-[11.5px] text-ink-mute">
            Example: <span className="mono rounded bg-azure-50 px-1.5 py-0.5 font-bold text-azure-600">{s.idPrefix}-{new Date().getFullYear()}-{String(s.idStart).padStart(4, '0')}</span>
          </p>
        </Card>

        <Card className="p-5">
          <h3 className="mb-1 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Data</h3>
          <p className="mb-4 text-[11.5px] text-ink-mute">Current record: <b className="text-ink">{getAllFamilies().length}</b> households.</p>
          <div className="flex flex-wrap gap-2">
            <Btn variant="ghost" onClick={() => { jsonBackup({ families: getAllFamilies(), settings: settings.get() }); say('Backup downloaded.') }}>
              <Database size={15} /> Download backup
            </Btn>
            <Btn variant="ghost" onClick={() => { resetSample(me?.name ?? 'owner'); say('Sample dataset restored.') }}>
              <RotateCcw size={15} /> Reset to sample
            </Btn>
          </div>
        </Card>

        <Card className="border-red-200 p-5">
          <h3 className="mb-1 flex items-center gap-2 text-[13px] font-bold uppercase tracking-[.06em] text-red-600"><AlertTriangle size={14} /> Danger zone</h3>
          <p className="mb-4 text-[11.5px] text-ink-mute">Poora record delete kar dega (backup pehle le lo). Undo nahi hoga.</p>
          {confirmWipe ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5">
              <p className="mb-3 text-[12px] font-bold text-red-700">Pakka? Saara data hat jayega.</p>
              <div className="flex gap-2">
                <Btn variant="danger" onClick={() => { replaceAll([], me?.name ?? 'owner'); setConfirmWipe(false); say('All data cleared.') }}>
                  <Trash2 size={15} /> Yes, clear everything
                </Btn>
                <Btn variant="ghost" onClick={() => setConfirmWipe(false)}>Cancel</Btn>
              </div>
            </div>
          ) : (
            <Btn variant="danger" onClick={() => setConfirmWipe(true)}><Trash2 size={15} /> Clear all data</Btn>
          )}
        </Card>
      </div>

      <Card className="mt-5 p-5">
        <h3 className="mb-3 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">App info</h3>
        <div className="grid gap-2 text-[12.5px] text-ink-soft sm:grid-cols-3">
          <div>Version: <b className="text-ink">0.9 · Sanctum</b></div>
          <div>Storage: <b className="text-ink">On-device (localStorage)</b></div>
          <div>Auth: <b className="text-ink">SHA-256 hashed passwords</b></div>
        </div>
        <p className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-700"><Check size={13} /> Data device par hi rehta hai — koi external server nahi.</p>
      </Card>
    </div>
  )
}
