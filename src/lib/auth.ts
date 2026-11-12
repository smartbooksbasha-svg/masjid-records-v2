import { createStore, uid } from './storeFactory'
import { audit } from './audit'

export type Role = 'owner' | 'user'

export interface Account {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  hash: string
  active: boolean
  createdAt: string
  lastLogin?: string
}

export interface Session {
  token: string
  accountId: string
  exp: number
}

const SESSION_HOURS = 12

/* ---------- password hashing (WebCrypto with a deterministic fallback) ---------- */

function fallbackHash(input: string): string {
  let h = 5381
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0
  let h2 = 52711
  for (let i = input.length - 1; i >= 0; i--) h2 = ((h2 << 5) + h2 + input.charCodeAt(i)) | 0
  return `f${(h >>> 0).toString(36)}${(h2 >>> 0).toString(36)}`
}

export async function hashPassword(password: string): Promise<string> {
  const salted = `mkr::${password}`
  try {
    if (globalThis.crypto?.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salted))
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
    }
  } catch {
    /* fall through */
  }
  return fallbackHash(salted)
}

export const accounts = createStore<Account[]>('mkr_accounts_v2', [])
export const session = createStore<Session | null>('mkr_session_v2', null)

export function hasOwner(): boolean {
  return accounts.get().some((a) => a.role === 'owner')
}

export function getAccount(id: string): Account | undefined {
  return accounts.get().find((a) => a.id === id)
}

export function findByLogin(login: string): Account | undefined {
  const q = login.trim().toLowerCase()
  return accounts.get().find((a) => a.email.toLowerCase() === q || a.id.toLowerCase() === q)
}

export function currentUser(): Account | null {
  const s = session.get()
  if (!s) return null
  if (Date.now() > s.exp) {
    session.set(null)
    return null
  }
  const acc = getAccount(s.accountId)
  if (!acc || !acc.active) {
    session.set(null)
    return null
  }
  return acc
}

export function useCurrentUser(): Account | null {
  accounts.use()
  session.use()
  return currentUser()
}

export function nextAccountId(role: Role): string {
  const year = new Date().getFullYear()
  const prefix = role === 'owner' ? 'OW' : 'AD'
  const n = accounts.get().filter((a) => a.role === role).length + 1
  return `${prefix}${String(year).slice(2)}${String(n).padStart(3, '0')}`
}

export async function createAccount(input: {
  name: string
  email: string
  phone?: string
  role: Role
  password: string
}): Promise<{ ok: boolean; error?: string; account?: Account }> {
  const email = input.email.trim().toLowerCase()
  if (!input.name.trim()) return { ok: false, error: 'Name is required.' }
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: 'Enter a valid email.' }
  if (input.password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' }
  if (accounts.get().some((a) => a.email.toLowerCase() === email)) {
    return { ok: false, error: 'An account with this email already exists.' }
  }
  const account: Account = {
    id: nextAccountId(input.role),
    name: input.name.trim(),
    email,
    phone: input.phone?.trim() ?? '',
    role: input.role,
    hash: await hashPassword(input.password),
    active: true,
    createdAt: new Date().toISOString(),
  }
  accounts.set([account, ...accounts.get()])
  audit.log(account.name, 'account.create', `${account.role} ${account.id} (${account.email})`)
  return { ok: true, account }
}

export async function login(loginId: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const acc = findByLogin(loginId)
  if (!acc) return { ok: false, error: 'No account found for that email or user ID.' }
  if (!acc.active) return { ok: false, error: 'This account is not active.' }
  const hash = await hashPassword(password)
  if (hash !== acc.hash) {
    audit.log(acc.name, 'auth.fail', `wrong password for ${acc.id}`)
    return { ok: false, error: 'Incorrect password.' }
  }
  const token = uid('S')
  session.set({ token, accountId: acc.id, exp: Date.now() + SESSION_HOURS * 3600_000 })
  accounts.update((list) => list.map((a) => (a.id === acc.id ? { ...a, lastLogin: new Date().toISOString() } : a)))
  audit.log(acc.name, 'auth.login', `${acc.role} ${acc.id}`)
  return { ok: true }
}

export function logout() {
  const u = currentUser()
  if (u) audit.log(u.name, 'auth.logout', u.id)
  session.set(null)
}

export function updateAccount(id: string, patch: Partial<Account>) {
  accounts.update((list) => list.map((a) => (a.id === id ? { ...a, ...patch, id: a.id } : a)))
}

export async function changePassword(id: string, password: string): Promise<{ ok: boolean; error?: string }> {
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' }
  const hash = await hashPassword(password)
  updateAccount(id, { hash })
  const u = currentUser()
  audit.log(u?.name ?? 'system', 'account.password', id)
  return { ok: true }
}

export function removeAccount(id: string) {
  const acc = getAccount(id)
  accounts.update((list) => list.filter((a) => a.id !== id))
  audit.log('admin', 'account.remove', acc ? `${acc.id} (${acc.email})` : id)
}
