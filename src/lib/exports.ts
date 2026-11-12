import type { Family } from './types'
import { DOCS, SCHEMES } from './data'
import { ageOf } from './stats'

export function downloadFile(filename: string, content: string | Blob, mime = 'text/plain;charset=utf-8') {
  const blob = typeof content === 'string' ? new Blob([content], { type: mime }) : content
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

const csvCell = (v: unknown) => {
  const s = v == null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCSV(rows: unknown[][]): string {
  return rows.map((r) => r.map(csvCell).join(',')).join('\r\n')
}

export function familiesToRows(families: Family[]): unknown[][] {
  const head = [
    'Family ID', 'Head', 'Street', 'House No', 'House Type', 'Phone', 'Address',
    'Member Name', 'Relation', 'Gender', 'DOB', 'Age', 'Marital', 'Education',
    'Occupation', 'Deeni', 'Student', 'Disabled', 'Widow', 'Documents', 'Schemes',
  ]
  const rows: unknown[][] = [head]
  for (const f of families) {
    for (const m of f.members) {
      rows.push([
        f.id, f.head, f.street, f.houseNo, f.houseType, f.phone, f.address,
        m.name, m.relation, m.gender, m.dob, m.dob ? ageOf(m.dob) : '', m.marital,
        m.education, m.occupation, m.deeni,
        m.student ? 'Yes' : 'No', m.disabled ? 'Yes' : 'No', m.widow ? 'Yes' : 'No',
        DOCS.filter((d) => m.docs[d]).join('; '),
        m.schemes.join('; '),
      ])
    }
  }
  return rows
}

export function familiesToCSV(families: Family[]): string {
  return toCSV(familiesToRows(families))
}

/* ---------- SpreadsheetML 2003 (.xls) — multi-sheet, opens in Excel/LibreOffice ---------- */

const xmlEsc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export interface Sheet {
  name: string
  rows: unknown[][]
}

export function toXLS(sheets: Sheet[]): string {
  const sheetXml = sheets
    .map((s) => {
      const rows = s.rows
        .map((r) => {
          const cells = r
            .map((c) =>
              typeof c === 'number' && Number.isFinite(c)
                ? `<Cell><Data ss:Type="Number">${c}</Data></Cell>`
                : `<Cell><Data ss:Type="String">${xmlEsc(c)}</Data></Cell>`,
            )
            .join('')
          return `<Row>${cells}</Row>`
        })
        .join('')
      return `<Worksheet ss:Name="${xmlEsc(s.name).slice(0, 31)}"><Table>${rows}</Table></Worksheet>`
    })
    .join('')
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
${sheetXml}
</Workbook>`
}

export function familySheets(families: Family[]): Sheet[] {
  const members = familiesToRows(families)
  const streets = new Map<string, { households: number; people: number }>()
  for (const f of families) {
    const s = streets.get(f.street || '—') ?? { households: 0, people: 0 }
    s.households++
    s.people += f.members.length
    streets.set(f.street || '—', s)
  }
  return [
    { name: 'Members', rows: members },
    {
      name: 'Households',
      rows: [
        ['Family ID', 'Head', 'Street', 'House No', 'House Type', 'Phone', 'Members', 'Status', 'Created'],
        ...families.map((f) => [
          f.id, f.head, f.street, f.houseNo, f.houseType, f.phone, f.members.length, f.status, f.createdAt.slice(0, 10),
        ]),
      ],
    },
    {
      name: 'Streets',
      rows: [['Street', 'Households', 'People'], ...[...streets.entries()].map(([s, v]) => [s, v.households, v.people])],
    },
    {
      name: 'Schemes',
      rows: [
        ['Scheme', 'Members enrolled'],
        ...SCHEMES.map((s) => [s, families.reduce((n, f) => n + f.members.filter((m) => m.schemes.includes(s)).length, 0)]),
      ],
    },
    {
      name: 'Documents',
      rows: [
        ['Document', 'Members holding'],
        ...DOCS.map((d) => [d, families.reduce((n, f) => n + f.members.filter((m) => m.docs[d]).length, 0)]),
      ],
    },
  ]
}

/* ---------- Printing ---------- */

export function printHTML(html: string, title = 'Masjid Khidmat Records') {
  let root = document.getElementById('print-root')
  if (!root) {
    root = document.createElement('div')
    root.id = 'print-root'
    document.body.appendChild(root)
  }
  root.innerHTML = `<div class="print-doc"><div class="print-head">${xmlEsc(title)}</div>${html}</div>`
  const done = () => {
    window.removeEventListener('afterprint', done)
  }
  window.addEventListener('afterprint', done)
  setTimeout(() => window.print(), 120)
}

export function jsonBackup(payload: Record<string, unknown>) {
  downloadFile(
    `masjid-records-backup-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify({ app: 'masjid-records-v2', at: new Date().toISOString(), ...payload }, null, 2),
    'application/json',
  )
}
