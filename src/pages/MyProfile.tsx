import { useState } from 'react'
import { Check, Eye, EyeOff, KeyRound, Save, ShieldCheck, User } from 'lucide-react'
import { changePassword, currentUser, hashPassword, updateAccount } from '../lib/auth'
import type { Account } from '../lib/auth'
import { Btn, Card, Field, Input, PageHeader } from '../components/ui'

export default function MyProfile() {
  const me = currentUser()
  if (!me) return null
  return <ProfileInner me={me} />
}

function ProfileInner({ me }: { me: Account }) {
  const [name, setName] = useState(me.name)
  const [phone, setPhone] = useState(me.phone)
  const [flash, setFlash] = useState('')
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwErr, setPwErr] = useState('')
  const [show, setShow] = useState(false)

  const isOwner = me.role === 'owner'
  const say = (m: string) => { setFlash(m); setTimeout(() => setFlash(''), 2000) }

  function saveInfo() {
    updateAccount(me.id, { name: name.trim() || me.name, phone: phone.trim() })
    say('Profile updated.')
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwErr('')
    if (pw.next !== pw.confirm) { setPwErr('Naye passwords match nahi karte.'); return }
    if (pw.next.length < 6) { setPwErr('Password kam se kam 6 characters ka ho.'); return }
    const cur = await hashPassword(pw.current)
    if (cur !== me.hash) { setPwErr('Current password galat hai.'); return }
    const res = await changePassword(me.id, pw.next)
    if (!res.ok) { setPwErr(res.error ?? 'Password change nahi hua.'); return }
    setPw({ current: '', next: '', confirm: '' })
    say('Password changed.')
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="My Profile" sub="Apni details aur password manage karo." />

      {flash && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[12.5px] font-bold text-emerald-700">{flash}</div>}

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <Card className="p-6 text-center">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-azure-600 font-display text-3xl font-bold text-white">
            {me.name.slice(0, 1).toUpperCase()}
          </span>
          <h2 className="mt-4 font-display text-lg font-bold text-ink">{me.name}</h2>
          <p className="text-[12px] text-ink-mute">{me.email}</p>
          <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${isOwner ? 'bg-azure-600 text-white' : 'bg-azure-50 text-azure-600'}`}>
            {isOwner ? <ShieldCheck size={13} /> : <User size={13} />} {isOwner ? 'Owner · Admin' : 'User · data entry'}
          </span>
          <div className="mt-5 grid gap-2 border-t border-line pt-4 text-left text-[12px]">
            <div className="flex justify-between"><span className="text-ink-mute">User ID</span><span className="mono font-bold text-ink">{me.id}</span></div>
            <div className="flex justify-between"><span className="text-ink-mute">Status</span><span className="font-bold text-emerald-600">{me.active ? 'Active' : 'Disabled'}</span></div>
            <div className="flex justify-between"><span className="text-ink-mute">Last login</span><span className="font-semibold text-ink-soft">{me.lastLogin ? new Date(me.lastLogin).toLocaleDateString() : '—'}</span></div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Personal details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" /></Field>
              <Field label="Email" hint="Email change karne ke liye owner se rabta karo."><Input value={me.email} disabled className="opacity-60" /></Field>
            </div>
            <Btn className="mt-4" onClick={saveInfo}><Save size={15} /> Save changes</Btn>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute"><KeyRound size={14} /> Change password</h3>
            {pwErr && <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] font-semibold text-red-600">{pwErr}</div>}
            <form onSubmit={savePassword} className="grid gap-4 sm:grid-cols-3">
              <Field label="Current"><Input type={show ? 'text' : 'password'} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" /></Field>
              <Field label="New password"><Input type={show ? 'text' : 'password'} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" /></Field>
              <Field label="Confirm new"><Input type={show ? 'text' : 'password'} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" /></Field>
              <div className="sm:col-span-3 flex flex-wrap items-center gap-3">
                <Btn type="submit"><Check size={15} /> Update password</Btn>
                <button type="button" onClick={() => setShow((v) => !v)} className="inline-flex items-center gap-1.5 text-[12px] font-bold text-ink-mute hover:text-azure-600">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />} {show ? 'Hide' : 'Show'} passwords
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
