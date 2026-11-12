import { useSyncExternalStore } from 'react'
import type { Family, Member } from './types'
import { FAMILIES } from './data'
import { audit } from './audit'

const KEY = 'mkr_families_v2'

function load(): Family[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Family[]
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {
    /* ignore corrupt storage */
  }
  return FAMILIES
}

let state: Family[] = load()
let active: Family[] = []
let deleted: Family[] = []
const listeners = new Set<() => void>()

function recompute() {
  active = state.filter((f) => !f.deletedAt)
  deleted = state.filter((f) => Boolean(f.deletedAt))
}
recompute()

function emit() {
  for (const l of listeners) l()
}

function commit(next: Family[]) {
  state = next
  recompute()
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full / unavailable */
  }
  emit()
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

/** All households (soft-deleted ones excluded). */
export const getFamilies = () => active
export const getAllFamilies = () => state
export const getDeletedFamilies = () => deleted

export function useFamilies(): Family[] {
  return useSyncExternalStore(subscribe, getFamilies, getFamilies)
}
export function useDeletedFamilies(): Family[] {
  return useSyncExternalStore(subscribe, getDeletedFamilies, getDeletedFamilies)
}

export function getFamily(id: string): Family | undefined {
  return state.find((f) => f.id === id)
}

export function nextFamilyId(): string {
  const year = new Date().getFullYear()
  const nums = state
    .map((f) => f.id.match(/(\d{4})$/)?.[1])
    .filter((n): n is string => Boolean(n))
    .map((n) => parseInt(n, 10))
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `MK-${year}-${String(next).padStart(4, '0')}`
}

export function newMemberId(): string {
  return `M${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export function blankMember(relation = 'Head'): Member {
  return {
    id: newMemberId(),
    name: '',
    relation,
    gender: 'Male',
    dob: '',
    marital: 'Unmarried',
    education: 'Secondary',
    occupation: '',
    deeni: '',
    student: false,
    disabled: false,
    widow: false,
    docs: {},
    schemes: [],
  }
}

export function blankFamily(): Family {
  const now = new Date().toISOString()
  return {
    id: nextFamilyId(),
    head: '',
    street: '',
    houseNo: '',
    houseType: 'Cement Sheet',
    phone: '',
    address: '',
    notes: '',
    members: [blankMember('Head')],
    createdAt: now,
    updatedAt: now,
    status: 'Active',
  }
}

export function addFamily(draft: Family, actor = 'system'): Family {
  const now = new Date().toISOString()
  const exists = state.some((f) => f.id === draft.id)
  const family: Family = {
    ...draft,
    id: exists ? nextFamilyId() : draft.id || nextFamilyId(),
    createdAt: now,
    updatedAt: now,
    createdBy: actor,
  }
  commit([family, ...state])
  audit.log(actor, 'family.add', `${family.id} · ${family.head} · ${family.members.length} members`)
  return family
}

export function updateFamily(id: string, patch: Partial<Family>, actor = 'system') {
  const before = state.find((f) => f.id === id)
  commit(
    state.map((f) =>
      f.id === id ? { ...f, ...patch, id: f.id, updatedAt: new Date().toISOString() } : f,
    ),
  )
  audit.log(actor, 'family.edit', `${id}${before ? ` · ${before.head}` : ''}`)
}

/** Soft delete — moves the household to the recycle bin. */
export function deleteFamily(id: string, actor = 'system') {
  const f = state.find((x) => x.id === id)
  commit(state.map((x) => (x.id === id ? { ...x, deletedAt: new Date().toISOString() } : x)))
  audit.log(actor, 'family.delete', `${id}${f ? ` · ${f.head}` : ''} (moved to recycle bin)`)
}

export function restoreFamily(id: string, actor = 'system') {
  commit(state.map((x) => (x.id === id ? { ...x, deletedAt: undefined } : x)))
  audit.log(actor, 'family.restore', id)
}

export function purgeFamily(id: string, actor = 'system') {
  commit(state.filter((f) => f.id !== id))
  audit.log(actor, 'family.purge', `${id} (permanent)`)
}

export function emptyRecycleBin(actor = 'system') {
  const n = deleted.length
  commit(state.filter((f) => !f.deletedAt))
  audit.log(actor, 'recycle.empty', `${n} households purged`)
}

export function resetSample(actor = 'system') {
  commit(FAMILIES)
  audit.log(actor, 'data.sample', 'sample dataset restored')
}

export function replaceAll(families: Family[], actor = 'system') {
  commit(families)
  audit.log(actor, 'data.restore', `${families.length} households imported`)
}
