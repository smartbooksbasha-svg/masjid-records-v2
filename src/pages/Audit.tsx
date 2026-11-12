import { useMemo, useState } from 'react'
import { Download, ScrollText, Search, Trash2 } from 'lucide-react'
import { audit, auditEntries } from '../lib/audit'
import { downloadFile, toCSV } from '../lib/exports'
import { Btn, Card, Chip, Input, PageHeader } from '../components/ui'
import { RequireOwner } from '../components/Guard'

const GROUPS = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'auth', label: 'Auth', match: (a: string) => a.startsWith('auth.') },
  { key: 'family', label: 'Households', match: (a: string) => a.startsWith('family.') },
  { key: 'account', label: 'Users', match: (a: string) => a.startsWith('account.') },
  { key: 'settings', label: 'Settings', match: (a: string) => a.startsWith('settings.') || a.startsWith('data.') },
]

export default function Audit() {
  return (
    <RequireOwner>
      <AuditInner />
    </RequireOwner>
  )
}

function AuditInner() {
  const entries = auditEntries.use()
  const [group, setGroup] = useState('all')
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const g = GROUPS.find((x) => x.key === group)!
    const needle = q.trim().toLowerCase()
    return entries.filter((e) => g.match(e.action) && (!needle || `${e.actor} ${e.action} ${e.detail}`.toLowerCase().includes(needle)))
  }, [entries, group, q])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof list>()
    for (const e of list) {
      const day = e.at.slice(0, 10)
      const arr = map.get(day) ?? []
      arr.push(e)
      map.set(day, arr)
    }
    return [...map.entries()]
  }, [list])

  const exportCSV = () =>
    downloadFile(`audit-log-${new Date().toISOString().slice(0, 10)}.csv`, toCSV([['Time', 'Actor', 'Action', 'Detail'], ...list.map((e) => [e.at, e.actor, e.action, e.detail])]), 'text/csv;charset=utf-8')

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Audit Log"
        sub={`${entries.length} events recorded (latest 1000).`}
        actions={
          <>
            <Btn variant="ghost" onClick={exportCSV} disabled={!list.length}><Download size={15} /> CSV</Btn>
            <Btn variant="danger" onClick={() => audit.clear()} disabled={!entries.length}><Trash2 size={15} /> Clear</Btn>
          </>
        }
      />

      <Card className="mb-4 p-3.5">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search actor, action, detail…" className="pl-9" />
        </div>
        <div className="no-scrollbar -mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1">
          {GROUPS.map((g) => <Chip key={g.key} active={group === g.key} onClick={() => setGroup(g.key)}>{g.label}</Chip>)}
        </div>
      </Card>

      {list.length ? (
        <div className="space-y-5">
          {grouped.map(([day, items]) => (
            <section key={day}>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[.1em] text-ink-mute">{new Date(`${day}T00:00:00`).toDateString()}</h3>
              <Card className="overflow-hidden">
                {items.map((e, i) => (
                  <div key={e.id} className={`flex items-start gap-3 px-4 py-3 ${i ? 'border-t border-line' : ''}`}>
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-azure-50 text-azure-600"><ScrollText size={13} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[12.5px] font-bold text-ink">{e.actor}</span>
                        <span className="mono rounded bg-paper px-1.5 py-0.5 text-[10px] font-bold text-ink-mute">{e.action}</span>
                      </div>
                      <div className="mt-0.5 break-words text-[12px] text-ink-soft">{e.detail}</div>
                    </div>
                    <span className="shrink-0 text-[10.5px] font-semibold text-ink-mute">{new Date(e.at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </Card>
            </section>
          ))}
        </div>
      ) : (
        <Card className="px-6 py-14 text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-azure-50 text-azure-600"><ScrollText size={22} /></span>
          <p className="text-[13px] text-ink-mute">{entries.length ? 'Is filter me kuch nahi mila.' : 'Abhi koi activity record nahi hui.'}</p>
        </Card>
      )}
    </div>
  )
}
