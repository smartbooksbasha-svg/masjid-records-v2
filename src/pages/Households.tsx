import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Phone, Search, UserPlus, Users } from 'lucide-react'
import { clsx } from 'clsx'
import { useFamilies, resetSample } from '../lib/store'
import { ageOf } from '../lib/stats'
import { Btn, Card, Chip, Input, PageHeader } from '../components/ui'

type Sort = 'recent' | 'name' | 'size'

export default function Households() {
  const families = useFamilies()
  const [q, setQ] = useState('')
  const [street, setStreet] = useState('All')
  const [status, setStatus] = useState<'All' | 'Active' | 'Archived'>('All')
  const [sort, setSort] = useState<Sort>('recent')

  const streets = useMemo(
    () => ['All', ...[...new Set(families.map((f) => f.street).filter(Boolean))].sort()],
    [families],
  )

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const filtered = families.filter((f) => {
      if (street !== 'All' && f.street !== street) return false
      if (status !== 'All' && f.status !== status) return false
      if (!needle) return true
      const hay = [f.head, f.id, f.phone, f.street, f.houseNo, f.address, ...f.members.map((m) => m.name)]
        .join(' ')
        .toLowerCase()
      return hay.includes(needle)
    })
    const sorted = [...filtered]
    if (sort === 'name') sorted.sort((a, b) => a.head.localeCompare(b.head))
    else if (sort === 'size') sorted.sort((a, b) => b.members.length - a.members.length)
    else sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    return sorted
  }, [families, q, street, status, sort])

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Households"
        sub={`${families.length} households · ${families.reduce((n, f) => n + f.members.length, 0)} people recorded`}
        actions={
          <Link to="/add">
            <Btn><UserPlus size={16} /> Add Household</Btn>
          </Link>
        }
      />

      {/* Filters */}
      <Card className="mb-4 p-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, Family ID, phone, street…"
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <MiniSelect label="Sort" value={sort} onChange={(v) => setSort(v as Sort)}
              options={[['recent', 'Newest'], ['name', 'Name A–Z'], ['size', 'Most members']]} />
            <MiniSelect label="Status" value={status} onChange={(v) => setStatus(v as 'All' | 'Active' | 'Archived')}
              options={[['All', 'All'], ['Active', 'Active'], ['Archived', 'Archived']]} />
          </div>
        </div>
        {streets.length > 2 && (
          <div className="no-scrollbar -mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pt-1">
            {streets.map((s) => (
              <Chip key={s} active={street === s} onClick={() => setStreet(s)}>{s}</Chip>
            ))}
          </div>
        )}
      </Card>

      {/* List */}
      {list.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((f) => {
            const adults = f.members.filter((m) => ageOf(m.dob) >= 18).length
            const kids = f.members.length - adults
            return (
              <Link key={f.id} to={`/households/${f.id}`} className="group block">
                <Card className="flex h-full flex-col p-4 transition hover:border-azure-200 hover:shadow-float">
                  <div className="flex items-start gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-azure-50 font-display text-base font-bold text-azure-600">
                      {f.members.length}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-display text-[15px] font-bold text-ink">{f.head || 'Unnamed household'}</h3>
                        {f.status === 'Archived' && (
                          <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[9px] font-bold text-ink-mute">ARCHIVED</span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-ink-mute">
                        <span className="inline-flex items-center gap-1"><MapPin size={12} /> {f.street || '—'}</span>
                        {f.houseNo && <span>House {f.houseNo}</span>}
                        <span className="mono rounded bg-azure-50 px-1.5 py-0.5 text-[10px] font-bold text-azure-600">{f.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5 text-[10.5px] font-semibold text-ink-mute">
                    <span className="rounded-full bg-paper px-2 py-1">{f.houseType}</span>
                    <span className="rounded-full bg-paper px-2 py-1">{adults} adults</span>
                    {kids > 0 && <span className="rounded-full bg-paper px-2 py-1">{kids} children</span>}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[11.5px] text-ink-mute">
                    <span className="inline-flex items-center gap-1.5">
                      <Phone size={12} /> {f.phone || 'No phone'}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-azure-600 opacity-0 transition group-hover:opacity-100">
                      Open <ArrowRight size={13} />
                    </span>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card className="px-6 py-14 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-azure-50 text-azure-600">
            <Users size={22} />
          </div>
          <h3 className="font-display text-lg font-bold">
            {families.length ? 'No households match your filters' : 'No households yet'}
          </h3>
          <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] text-ink-mute">
            {families.length
              ? 'Search ya filter badal ke dekho.'
              : 'Pehla household add karo, ya demo data load kar lo.'}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link to="/add"><Btn><UserPlus size={16} /> Add Household</Btn></Link>
            {!families.length && <Btn variant="ghost" onClick={() => resetSample()}>Load sample data</Btn>}
          </div>
        </Card>
      )}
    </div>
  )
}

function MiniSelect({ label, value, onChange, options }: {
  label: string
  value: string
  onChange: (v: string) => void
  options: [string, string][]
}) {
  return (
    <label className={clsx('inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-[12px] font-semibold text-ink-mute')}>
      <span className="hidden sm:inline">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent text-[12.5px] font-bold text-ink outline-none"
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  )
}
