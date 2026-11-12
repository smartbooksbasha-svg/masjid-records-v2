import { useState } from 'react'
import { Download, FileSpreadsheet, FileText, Printer, QrCode, Database } from 'lucide-react'
import { useFamilies } from '../lib/store'
import { computeStats, ageOf } from '../lib/stats'
import { DOCS, SCHEMES } from '../lib/data'
import { settings } from '../lib/settings'
import { downloadFile, familiesToCSV, familySheets, jsonBackup, printHTML, toXLS } from '../lib/exports'
import { familyQrPayload, qrDataUrl } from '../lib/qr'
import { Btn, Card, PageHeader } from '../components/ui'
import type { Family } from '../lib/types'

const esc = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function summaryHTML(families: Family[]): string {
  const s = computeStats(families)
  const streetRows = s.streetRows
    .map((r) => `<tr><td>${esc(r.label)}</td><td>${r.value}</td><td>${esc(r.sub ?? '')}</td></tr>`)
    .join('')
  return `
    <div class="print-sub">${esc(settings.get().name)} — ${esc(settings.get().tagline)}</div>
    <h3>Overview</h3>
    <table>
      <tr><th>Households</th><th>People</th><th>Men</th><th>Women</th><th>Children</th><th>Students</th><th>Widows</th><th>Disabled</th></tr>
      <tr><td>${s.families}</td><td>${s.population}</td><td>${s.male}</td><td>${s.female}</td><td>${s.children}</td><td>${s.students}</td><td>${s.widows}</td><td>${s.disabled}</td></tr>
    </table>
    <h3>Population by street</h3>
    <table><tr><th>Street</th><th>People</th><th>Households</th></tr>${streetRows}</table>
    <h3>Documents</h3>
    <table><tr><th>Document</th><th>Members</th></tr>${s.docs.map((d) => `<tr><td>${esc(d.label)}</td><td>${d.value}</td></tr>`).join('')}</table>
    <h3>Government schemes</h3>
    <table><tr><th>Scheme</th><th>Members</th></tr>${s.schemes.map((d) => `<tr><td>${esc(d.label)}</td><td>${d.value}</td></tr>`).join('')}</table>
    <p class="muted">Generated ${new Date().toLocaleString()}</p>
  `
}

async function familiesHTML(families: Family[]): Promise<string> {
  const cards: string[] = []
  for (const f of families) {
    const qr = await qrDataUrl(familyQrPayload(f.id), { size: 200 })
    const rows = f.members
      .map((m) => `<tr><td>${esc(m.name)}</td><td>${esc(m.relation)}</td><td>${m.dob ? ageOf(m.dob) : ''}</td><td>${esc(m.gender)}</td><td>${esc(m.marital)}</td><td>${esc(m.education)}</td><td>${esc(m.occupation)}</td><td>${DOCS.filter((d) => m.docs[d]).length}</td><td>${m.schemes.length}</td></tr>`)
      .join('')
    cards.push(`
      <div class="fam-card">
        <img class="qr" src="${qr}" alt="QR" />
        <h4>${esc(f.head || 'Unnamed household')}</h4>
        <div class="fam-meta">Family ID <b>${esc(f.id)}</b> · ${esc(f.street || '—')} · House ${esc(f.houseNo || '—')} · ${esc(f.houseType)}${f.phone ? ` · ${esc(f.phone)}` : ''}</div>
        <table>
          <tr><th>Name</th><th>Relation</th><th>Age</th><th>Gender</th><th>Marital</th><th>Education</th><th>Occupation</th><th>Docs</th><th>Schemes</th></tr>
          ${rows}
        </table>
        ${f.address ? `<div class="kv"><b>Address</b> ${esc(f.address)}</div>` : ''}
        ${f.notes ? `<div class="kv"><b>Notes</b> ${esc(f.notes)}</div>` : ''}
      </div>`)
  }
  return cards.join('')
}

export default function Exports() {
  const families = useFamilies()
  const [busy, setBusy] = useState('')

  const stamp = new Date().toISOString().slice(0, 10)

  const downloadCSV = () => downloadFile(`masjid-records-${stamp}.csv`, familiesToCSV(families), 'text/csv;charset=utf-8')
  const downloadXLS = () => downloadFile(`masjid-records-${stamp}.xls`, toXLS(familySheets(families)), 'application/vnd.ms-excel')
  const backupJSON = () => jsonBackup({ families, settings: settings.get() })

  const printSummary = () => printHTML(summaryHTML(families), `${settings.get().name} — Summary`)
  const printAll = async () => {
    setBusy('print')
    try {
      const html = await familiesHTML(families)
      printHTML(html, `${settings.get().name} — Family Records`)
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Exports & Print" sub={`${families.length} households export ke liye taiyar.`} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ExportCard
          icon={<FileText size={18} />}
          title="Members CSV"
          note="Har member ek row me — Excel/Sheets me kholne ke liye."
          action={<Btn onClick={downloadCSV}><Download size={15} /> Download CSV</Btn>}
        />
        <ExportCard
          icon={<FileSpreadsheet size={18} />}
          title="Excel workbook (.xls)"
          note="5 sheets: Members, Households, Streets, Schemes, Documents."
          action={<Btn onClick={downloadXLS}><Download size={15} /> Download Excel</Btn>}
        />
        <ExportCard
          icon={<Database size={18} />}
          title="Full backup (JSON)"
          note="Poora data + settings — restore ke liye safe copy."
          action={<Btn onClick={backupJSON}><Download size={15} /> Download backup</Btn>}
        />
        <ExportCard
          icon={<Printer size={18} />}
          title="Print summary report"
          note="Overview + street + documents + schemes tables (A4)."
          action={<Btn onClick={printSummary}><Printer size={15} /> Print summary</Btn>}
        />
        <ExportCard
          icon={<QrCode size={18} />}
          title="Print all family records"
          note="Har ghar ka poora card + verify QR code."
          action={<Btn onClick={printAll} disabled={busy === 'print'}><Printer size={15} /> {busy === 'print' ? 'Taiyar ho raha…' : 'Print all'}</Btn>}
        />
      </div>

      <Card className="mt-6 p-5">
        <h3 className="text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Quick reference</h3>
        <div className="mt-3 grid gap-2 text-[12.5px] text-ink-soft sm:grid-cols-2 lg:grid-cols-3">
          <div>Members exported: <b className="text-ink">{families.reduce((n, f) => n + f.members.length, 0)}</b></div>
          <div>Documents in list: <b className="text-ink">{DOCS.length}</b></div>
          <div>Schemes in list: <b className="text-ink">{SCHEMES.length}</b></div>
        </div>
      </Card>
    </div>
  )
}

function ExportCard({ icon, title, note, action }: { icon: React.ReactNode; title: string; note: string; action: React.ReactNode }) {
  return (
    <Card className="flex flex-col p-5">
      <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-azure-50 text-azure-600">{icon}</span>
      <h3 className="font-display text-[14.5px] font-bold text-ink">{title}</h3>
      <p className="mt-1 flex-1 text-[12px] leading-relaxed text-ink-mute">{note}</p>
      <div className="mt-4">{action}</div>
    </Card>
  )
}
