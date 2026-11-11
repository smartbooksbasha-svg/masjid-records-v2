import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={clsx('rounded-xl2 border border-line bg-white shadow-card', className)}>
      {children}
    </div>
  )
}

export function SectionTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-[15px] font-bold tracking-tight text-ink">{title}</h2>
        {sub && <p className="text-xs text-ink-mute">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatTile({ label, value, sub, accent }: { label: string; value: ReactNode; sub?: string; accent?: boolean }) {
  return (
    <Card className="p-4">
      <div className="text-[10px] font-bold uppercase tracking-[.08em] text-ink-mute">{label}</div>
      <div className={clsx('num mt-1.5 font-display text-2xl font-bold tracking-tight', accent ? 'text-azure-600' : 'text-ink')}>{value}</div>
      {sub && <div className="mt-1 text-[11px] text-ink-mute">{sub}</div>}
    </Card>
  )
}

export interface BarRow { label: string; value: number; sub?: string }

export function BarList({ rows, accent = '#0e5c86' }: { rows: BarRow[]; accent?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
            <span className="truncate font-semibold text-ink-soft">{r.label}</span>
            <span className="num shrink-0 text-ink-mute">{r.sub ?? r.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-azure-50">
            <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(r.value / max) * 100}%`, background: accent }} />
          </div>
        </div>
      ))}
    </div>
  )
}
