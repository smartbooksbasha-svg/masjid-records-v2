import { useState } from 'react'
import { Check, Copy, KeyRound, Pencil, Plus, ShieldCheck, Trash2, UserCog, X } from 'lucide-react'
import { clsx } from 'clsx'
import {
  accounts, createAccount, currentUser, removeAccount, updateAccount, changePassword,
} from '../lib/auth'
import { Btn, Card, Field, Input, PageHeader } from '../components/ui'
import { RequireOwner } from '../components/Guard'

function randomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export default function Users() {
  return (
    <RequireOwner>
      <UsersInner />
    </RequireOwner>
  )
}

function UsersInner() {
  const list = accounts.use()
  const me = currentUser()
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')

  const say = (m: string) => { setFlash(m); setTimeout(() => setFlash(''), 2600) }

  async function add(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await createAccount({ name: form.name, email: form.email, phone: form.phone, role: 'user', password: form.password })
    if (!res.ok) { setError(res.error ?? 'Could not add user.'); return }
    setForm({ name: '', email: '', phone: '', password: '' })
    setAdding(false)
    say(`User added — ID ${res.account?.id}`)
  }

  async function resetPass(id: string) {
    const pw = randomPassword()
    await changePassword(id, pw)
    say(`New password for ${id}: ${pw}`)
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Users"
        sub="Owner + data-entry users. Sirf owner hi yeh screen dekh sakta hai."
        actions={<Btn onClick={() => { setAdding((v) => !v); setError('') }}>{adding ? <X size={16} /> : <Plus size={16} />} {adding ? 'Cancel' : 'Add user'}</Btn>}
      />

      {flash && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[12.5px] font-bold text-emerald-700">{flash}</div>
      )}

      {adding && (
        <Card className="mb-4 p-5">
          <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">New data-entry user</h3>
          {error && <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] font-semibold text-red-600">{error}</div>}
          <form onSubmit={add} className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name *"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mohammed Salim" /></Field>
            <Field label="Email *"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" /></Field>
            <Field label="Password *" hint="Kam se kam 6 characters">
              <div className="flex gap-2">
                <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Set a password" />
                <Btn type="button" variant="ghost" onClick={() => setForm({ ...form, password: randomPassword() })}>Auto</Btn>
              </div>
            </Field>
            <div className="sm:col-span-2"><Btn type="submit"><Plus size={16} /> Create user</Btn></div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-line bg-paper text-[10.5px] uppercase tracking-[.06em] text-ink-mute">
                <th className="px-4 py-2.5 font-bold">User</th>
                <th className="px-4 py-2.5 font-bold">User ID</th>
                <th className="px-4 py-2.5 font-bold">Role</th>
                <th className="px-4 py-2.5 font-bold">Status</th>
                <th className="px-4 py-2.5 font-bold">Last login</th>
                <th className="px-4 py-2.5 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => {
                const isOwner = a.role === 'owner'
                return (
                  <tr key={a.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-bold text-ink">{a.name}</div>
                      <div className="text-[11px] text-ink-mute">{a.email}{a.phone ? ` · ${a.phone}` : ''}</div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => { navigator.clipboard?.writeText(a.id); say(`Copied ${a.id}`) }}
                        className="mono inline-flex items-center gap-1.5 rounded-lg bg-azure-50 px-2 py-1 text-[11px] font-bold text-azure-600"
                      >
                        {a.id} <Copy size={11} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold', isOwner ? 'bg-azure-600 text-white' : 'bg-azure-50 text-azure-600')}>
                        {isOwner ? <ShieldCheck size={12} /> : <UserCog size={12} />} {isOwner ? 'Owner · Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold', a.active ? 'bg-emerald-50 text-emerald-700' : 'bg-ink/5 text-ink-mute')}>
                        {a.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11.5px] text-ink-mute">{a.lastLogin ? new Date(a.lastLogin).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3">
                      {editing === a.id ? (
                        <EditRow
                          id={a.id}
                          name={a.name}
                          phone={a.phone}
                          onDone={() => { setEditing(null); say('User updated') }}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          <IconBtn label="Edit" onClick={() => setEditing(a.id)}><Pencil size={13} /></IconBtn>
                          <IconBtn label="Reset password" onClick={() => resetPass(a.id)}><KeyRound size={13} /></IconBtn>
                          {!isOwner && a.id !== me?.id && (
                            <>
                              <IconBtn label={a.active ? 'Disable' : 'Enable'} onClick={() => { updateAccount(a.id, { active: !a.active }); say(a.active ? 'User disabled' : 'User enabled') }}>
                                {a.active ? <X size={13} /> : <Check size={13} />}
                              </IconBtn>
                              <IconBtn label="Remove" danger onClick={() => { removeAccount(a.id); say('User removed') }}><Trash2 size={13} /></IconBtn>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {!list.length && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-[12.5px] text-ink-mute">Koi user nahi.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-4 text-[11.5px] leading-relaxed text-ink-mute">
        Data-entry users households add/edit kar sakte hain, lekin administration, exports, ID cards
        aur settings sirf owner ke paas hain.
      </p>
    </div>
  )
}

function EditRow({ id, name, phone, onDone }: { id: string; name: string; phone: string; onDone: () => void }) {
  const [n, setN] = useState(name)
  const [p, setP] = useState(phone)
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <input value={n} onChange={(e) => setN(e.target.value)} className="w-32 rounded-lg border border-line px-2 py-1 text-[12px] outline-none focus:border-azure-400" />
      <input value={p} onChange={(e) => setP(e.target.value)} className="w-28 rounded-lg border border-line px-2 py-1 text-[12px] outline-none focus:border-azure-400" />
      <IconBtn label="Save" onClick={() => { updateAccount(id, { name: n, phone: p }); onDone() }}><Check size={13} /></IconBtn>
      <IconBtn label="Cancel" onClick={onDone}><X size={13} /></IconBtn>
    </div>
  )
}

function IconBtn({ label, onClick, danger, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={clsx(
        'grid h-8 w-8 place-items-center rounded-lg border transition',
        danger ? 'border-line text-ink-mute hover:border-red-200 hover:text-red-600' : 'border-line text-ink-mute hover:border-azure-200 hover:text-azure-600',
      )}
    >
      {children}
    </button>
  )
}
