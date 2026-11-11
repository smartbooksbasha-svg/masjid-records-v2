import { Link } from 'react-router-dom'
import { Hammer } from 'lucide-react'

export default function Placeholder({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-azure-50 text-azure-600">
        <Hammer size={24} strokeWidth={2} />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-mute">
        {note ?? 'Yeh screen agle build me aayegi — Dashboard pehle banaya ja raha hai (ek screen, ek waqt).'}
      </p>
      <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-azure-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_14px_28px_-14px_rgba(14,92,134,.9)]">
        Back to Dashboard
      </Link>
    </div>
  )
}
