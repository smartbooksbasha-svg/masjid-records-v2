import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Landmark, Users } from 'lucide-react'
import { clsx } from 'clsx'
import { useFamilies } from '../lib/store'
import { SCHEMES } from '../lib/data'
import { Card, Chip, PageHeader } from '../components/ui'

export default function Schemes() {
  const families = useFamilies()
  const [sel, setSel] = useState(SCHEMES[0])

  const rows = useMemo(
    () =>
      SCHEMES.map((s) => ({
        scheme: s,
        holders: families.flatMap((f) => f.members.filter((m) => m.schemes.includes(s)).map((m) => ({ member: m, family: f }))),
      })),
    [families],
  )

  const current = rows.find((r) => r.scheme === sel) ?? rows[0]
  const totalEntries = rows.reduce((n, r) => n + r.holders.length, 0)

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Government Schemes" sub={`${totalEntries} scheme entries across ${families.length} households.`} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {rows.map((r) => (
          <button key={r.scheme} type="button" onClick={() => setSel(r.scheme)} className="text-left">
            <Card className={clsx('h-full p-4 transition', sel === r.scheme ? 'border-azure-400 ring-2 ring-azure-100' : 'hover:border-azure-200')}>
              <div className="flex items-center gap-2 text-azure-600">
                <Landmark size={15} />
                <span className="text-[10px] font-bold uppercase tracking-[.06em] text-ink-mute">Scheme</span>
              </div>
              <div className="mt-1.5 text-[13px] font-bold leading-snug text-ink">{r.scheme}</div>
              <div className="mt-2 flex items-center gap-1.5 text-ink-mute">
                <Users size={13} />
                <span className="num font-display text-lg font-bold text-ink">{r.holders.length}</span>
                <span className="text-[10.5px] font-semibold">enrolled</span>
              </div>
            </Card>
          </button>
        ))}
      </div>

      <section className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[15px] font-bold">{current.scheme} — {current.holders.length} members</h2>
          <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
            {SCHEMES.map((s) => <Chip key={s} active={sel === s} onClick={() => setSel(s)}>{s}</Chip>)}
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
                      <td className="px-4 py-2.5 font-semibold text-ink">{member.name || '—'}</td>
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
            <p className="text-[13px] text-ink-mute">Abhi koi member <b>{current.scheme}</b> me enrolled nahi hai.</p>
          </Card>
        )}
      </section>
    </div>
  )
}
