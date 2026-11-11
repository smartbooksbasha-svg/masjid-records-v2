import { useSyncExternalStore } from 'react'
import type { Family, Member } from './types'
import { FAMILIES } from './data'

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
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function commit(next: Family[]) {
  state = next
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

export const getFamilies = () => state

export function useFamilies(): Family[] {
  return useSyncExternalStore(subscribe, getFamilies, getFamilies)
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

export function addFamily(draft: Family): Family {
  const now = new Date().toISOString()
  const exists = state.some((f) => f.id === draft.id)
  const family: Family = {
    ...draft,
    id: exists ? nextFamilyId() : draft.id || nextFamilyId(),
    createdAt: now,
    updatedAt: now,
  }
  commit([family, ...state])
  return family
}

export function updateFamily(id: string, patch: Partial<Family>) {
  commit(
    state.map((f) =>
      f.id === id ? { ...f, ...patch, id: f.id, updatedAt: new Date().toISOString() } : f,
    ),
  )
}

export function deleteFamily(id: string) {
  commit(state.filter((f) => f.id !== id))
}

export function resetSample() {
  commit(FAMILIES)
}
