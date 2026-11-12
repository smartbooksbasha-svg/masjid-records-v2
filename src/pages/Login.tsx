import { useState } from 'react'
import { Eye, EyeOff, Lock, ShieldCheck, UserPlus, ArrowRight } from 'lucide-react'
import { createAccount, hasOwner, hashPassword, login } from '../lib/auth'
import { settings } from '../lib/settings'
import { asset } from '../lib/asset'
import { Btn, Field, Input } from '../components/ui'

const MAX_TRIES = 5
const LOCK_MS = 5 * 60 * 1000
const LOCK_KEY = 'mkr_login_lock_v2'

interface Lock { fails: number; until: number }
const readLock = (): Lock => {
  try { return JSON.parse(localStorage.getItem(LOCK_KEY) || '') as Lock } catch { return { fails: 0, until: 0 } }
}
const writeLock = (l: Lock) => localStorage.setItem(LOCK_KEY, JSON.stringify(l))

export default function Login() {
  const s = settings.use()
  const [mode, setMode] = useState<'login' | 'setup'>(hasOwner() ? 'login' : 'setup')
  const [form, setForm] = useState({ name: '', email: '', loginId: '', password: '', confirm: '' })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const lock = readLock()
  const locked = lock.until > Date.now()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (locked) {
      setError(`Too many attempts. Try again in ${Math.ceil((lock.until - Date.now()) / 60000)} min.`)
      return
    }
    setBusy(true)
    try {
      if (mode === 'setup') {
        if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
        const res = await createAccount({ name: form.name, email: form.email, role: 'owner', password: form.password })
        if (!res.ok) { setError(res.error ?? 'Could not create account.'); return }
        const li = await login(form.email, form.password)
        if (!li.ok) setError(li.error ?? 'Login failed.')
      } else {
        const res = await login(form.loginId, form.password)
        if (!res.ok) {
          const next = { fails: lock.fails + 1, until: 0 }
          if (next.fails >= MAX_TRIES) { next.until = Date.now() + LOCK_MS; next.fails = 0 }
          writeLock(next)
          setError(res.error ?? 'Login failed.')
          return
        }
        writeLock({ fails: 0, until: 0 })
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden lg:block">
        <img src={asset('hero.jpg')} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="scrim-hero absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 21V11l8-6 8 6v10" /><path d="M9 21v-5h6v5" /><path d="M12 5V2.5" />
              </svg>
            </span>
            <div>
              <div className="font-display text-[16px] font-bold leading-tight">{s.name}</div>
              <div className="text-[9.5px] font-bold uppercase tracking-[.24em] text-white/70">{s.tagline}</div>
            </div>
          </div>
          <div>
            <h1 className="max-w-sm font-display text-3xl font-bold leading-[1.12] tracking-tight">
              Mohalle ka poora record, ek jagah.
            </h1>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-white/80">
              Har ghar, har fard — masjid ki khidmat ka hisaab, mehfooz aur tarteeb ke saath.
            </p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center bg-paper px-5 py-12">
        <form onSubmit={submit} className="w-full max-w-[380px]">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-azure-600 text-white">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 21V11l8-6 8 6v10" /><path d="M9 21v-5h6v5" /><path d="M12 5V2.5" />
              </svg>
            </span>
            <div className="font-display text-[15px] font-bold">{s.name}</div>
          </div>

          <div className="mb-5">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-azure-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-azure-600">
              {mode === 'setup' ? <ShieldCheck size={12} /> : <Lock size={12} />}
              {mode === 'setup' ? 'First-time setup' : 'Secure sign-in'}
            </div>
            <h2 className="font-display text-[24px] font-bold tracking-tight text-ink">
              {mode === 'setup' ? 'Create the owner account' : 'Welcome back'}
            </h2>
            <p className="mt-1 text-[12.5px] text-ink-mute">
              {mode === 'setup'
                ? 'Yeh pehla owner account hai — isi se poora record manage hoga.'
                : 'Apna email ya User ID daal ke andar aao.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] font-semibold text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {mode === 'setup' ? (
              <>
                <Field label="Full name">
                  <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Isthiyaque Basha" autoComplete="name" />
                </Field>
                <Field label="Email">
                  <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" autoComplete="email" />
                </Field>
              </>
            ) : (
              <Field label="Email or User ID">
                <Input value={form.loginId} onChange={(e) => set('loginId', e.target.value)} placeholder="you@example.com" autoComplete="username" />
              </Field>
            )}

            <Field label="Password">
              <div className="relative">
                <Input
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
                  className="pr-11"
                />
                <button
                  type="button"
                  aria-label={show ? 'Hide password' : 'Show password'}
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink-mute hover:text-azure-600"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            {mode === 'setup' && (
              <Field label="Confirm password">
                <Input type={show ? 'text' : 'password'} value={form.confirm} onChange={(e) => set('confirm', e.target.value)} placeholder="Repeat password" autoComplete="new-password" />
              </Field>
            )}
          </div>

          <Btn type="submit" disabled={busy || locked} className="mt-5 w-full">
            {mode === 'setup' ? <UserPlus size={16} /> : <ArrowRight size={16} />}
            {busy ? 'Please wait…' : mode === 'setup' ? 'Create account & continue' : 'Log in'}
          </Btn>

          {hasOwner() && mode === 'setup' && (
            <button type="button" onClick={() => setMode('login')} className="mt-4 w-full text-center text-[12px] font-bold text-azure-600">
              Back to sign-in
            </button>
          )}

          <p className="mt-6 text-center text-[11px] leading-relaxed text-ink-mute">
            Record is device par safely mehfooz rehta hai. Password hashed (SHA-256) form me store hota hai.
          </p>
        </form>
      </div>
    </div>
  )
}

/** Exposed for tests. */
export { hashPassword }
