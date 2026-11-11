import type { Family } from './types'
import { DOCS, SCHEMES } from './data'

export const CHILD_AGE = 18

export function ageOf(dob: string, now = new Date()): number {
  const d = new Date(`${dob}T00:00:00`)
  let a = now.getFullYear() - d.getFullYear()
  const md = now.getMonth() - d.getMonth()
  if (md < 0 || (md === 0 && now.getDate() < d.getDate())) a--
  return a
}

export interface Row { label: string; value: number; sub?: string }

export interface DashboardStats {
  families: number
  population: number
  male: number
  female: number
  children: number
  married: number
  unmarried: number
  widows: number
  disabled: number
  students: number
  houses: number
  streets: number
  streetRows: Row[]
  housing: Row[]
  education: Row[]
  occupation: Row[]
  deeni: Row[]
  docs: Row[]
  schemes: Row[]
}

function groupCount(items: string[]): Row[] {
  const map = new Map<string, number>()
  for (const it of items) if (it) map.set(it, (map.get(it) ?? 0) + 1)
  return [...map.entries()].map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}

export function computeStats(families: Family[]): DashboardStats {
  const members = families.flatMap((f) => f.members)
  const streets = [...new Set(families.map((f) => f.street))]

  const streetRows: Row[] = streets
    .map((s) => {
      const fs = families.filter((f) => f.street === s)
      return { label: s, value: fs.reduce((n, f) => n + f.members.length, 0), sub: `${fs.length} households` }
    })
    .sort((a, b) => b.value - a.value)

  return {
    families: families.length,
    population: members.length,
    male: members.filter((m) => m.gender === 'Male').length,
    female: members.filter((m) => m.gender === 'Female').length,
    children: members.filter((m) => ageOf(m.dob) < CHILD_AGE).length,
    married: members.filter((m) => m.marital === 'Married').length,
    unmarried: members.filter((m) => m.marital === 'Unmarried').length,
    widows: members.filter((m) => m.widow).length,
    disabled: members.filter((m) => m.disabled).length,
    students: members.filter((m) => m.student).length,
    houses: families.length,
    streets: streets.length,
    streetRows,
    housing: groupCount(families.map((f) => f.houseType)),
    education: groupCount(members.map((m) => m.education)),
    occupation: groupCount(members.map((m) => m.occupation)).slice(0, 8),
    deeni: groupCount(members.map((m) => m.deeni)),
    docs: DOCS.map((d) => ({
      label: d,
      value: members.filter((m) => m.docs[d] === true).length,
    })).sort((a, b) => b.value - a.value),
    schemes: SCHEMES.map((s) => ({
      label: s,
      value: members.filter((m) => m.schemes.includes(s)).length,
    })).sort((a, b) => b.value - a.value),
  }
}
