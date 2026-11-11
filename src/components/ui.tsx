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

/* ---------- Page header ---------- */

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[22px] font-bold tracking-tight text-ink sm:text-[26px]">{title}</h1>
        {sub && <p className="mt-1 text-[12.5px] text-ink-mute">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ---------- Form primitives ---------- */

const controlCls =
  'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] text-ink outline-none transition placeholder:text-ink-mute/60 focus:border-azure-400 focus:ring-2 focus:ring-azure-100'

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[.06em] text-ink-mute">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink-mute">{hint}</span>}
    </label>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(controlCls, props.className)} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(controlCls, 'min-h-[80px] resize-y', props.className)} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx(controlCls, 'appearance-none pr-9', props.className)} />
}

export function Btn({
  variant = 'primary', className, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  return (
    <button
      {...props}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold transition disabled:opacity-50',
        variant === 'primary' && 'bg-azure-600 text-white shadow-[0_14px_26px_-14px_rgba(14,92,134,.9)] hover:brightness-105',
        variant === 'ghost' && 'border border-line bg-white text-ink-soft hover:border-azure-200 hover:text-azure-600',
        variant === 'danger' && 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100',
        className,
      )}
    />
  )
}

export function Chip({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-bold transition',
        active ? 'bg-azure-600 text-white' : 'bg-azure-50 text-ink-mute hover:text-ink-soft',
      )}
    >
      {children}
    </button>
  )
}
