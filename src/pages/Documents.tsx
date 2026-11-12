import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, FileText, X } from 'lucide-react'
import { clsx } from 'clsx'
import { useFamilies } from '../lib/store'
import { DOCS } from '../lib/data'
import { Card, Chip, PageHeader } from '../components/ui'

export default function Documents() {
  const families = useFamilies()
  const [sel, setSel] = useState(DOCS[0])

  const rows = useMemo(
    () =>
      DOCS.map((d) => {
        const holders = families.flatMap((f) =>
          f.members.filter((m) => m.docs[d]).map((m) => ({ member: m, family: f })),
        )
        return { doc: d, holders }
      }),
    [families],
  )

  const total = families.reduce((n, f) => n + f.members.length, 0)
  const current = rows.find((r) => r.doc === sel) ?? rows[0]

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Documents" sub={`Har kaagaz kitne logon ke paas hai — ${total} members ka record.`} />

      {/* Overview tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {rows.map((r) => {
          const p = total ? Math.round((r.holders.length / total) * 100) : 0
          return (
            <button key={r.doc} type="button" onClick={() => setSel(r.doc)} className="text-left">
              <Card className={clsx('h-full p-4 transition', sel === r.doc ? 'border-azure-400 ring-2 ring-azure-100' : 'hover:border-azure-200')}>
                <div className="flex items-center gap-2 text-azure-600">
                  <FileText size={15} />
                  <span className="text-[10px] font-bold uppercase tracking-[.06em] text-ink-mute">Document</span>
                </div>
                <div className="mt-1.5 text-[13px] font-bold leading-snug text-ink">{r.doc}</div>
                <div className="num mt-2 font-display text-xl font-bold text-ink">{r.holders.length}</div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-azure-50">
                  <div className="h-full rounded-full bg-azure-600" style={{ width: `${p}%` }} />
                </div>
                <div className="mt-1 text-[10.5px] font-semibold text-ink-mute">{p}% of members</div>
              </Card>
            </button>
          )
        })}
      </div>

      {/* Detail list */}
      <section className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[15px] font-bold">{current.doc} — {current.holders.length} holders</h2>
          <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
            {DOCS.map((d) => (
              <Chip key={d} active={sel === d} onClick={() => setSel(d)}>{d}</Chip>
            ))}
          </div>
        </div>

        {current.holders.length ? (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-line bg-paper text-[10.5px] uppercase tracking-[.06em] text-ink-mute">
                    <th className="px-4 py-2.5 font-bold">Member</th>
                    <th className="px-4 py-2.5 font-bold">Relation</th>
                    <th className="px-4 py-2.5 font-bold">Household</th>
                    <th className="px-4 py-2.5 font-bold">Street</th>
                  </tr>
                </thead>
                <tbody>
                  {current.holders.map(({ member, family }) => (
                    <tr key={`${family.id}-${member.id}`} className="border-b border-line last:border-0">
                      <td className="px-4 py-2.5 font-semibold text-ink">
                        <span className="inline-flex items-center gap-1.5"><Check size={13} className="text-emerald-600" /> {member.name || '—'}</span>
                      </td>
                      <td className="px-4 py-2.5 text-ink-soft">{member.relation || '—'}</td>
                      <td className="px-4 py-2.5">
                        <Link to={`/households/${family.id}`} className="font-semibold text-azure-600 hover:underline">{family.head || family.id}</Link>
                      </td>
                      <td className="px-4 py-2.5 text-ink-soft">{family.street || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="px-6 py-12 text-center">
            <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-azure-50 text-azure-600"><X size={20} /></span>
            <p className="text-[13px] text-ink-mute">Abhi kisi member ke paas <b>{current.doc}</b> record nahi hai.</p>
          </Card>
        )}
      </section>
    </div>
  )
}
