import { useState } from 'react'
import { Bell, Pin, PinOff, Plus, Trash2 } from 'lucide-react'
import { clsx } from 'clsx'
import { addNotice, notices, removeNotice, togglePin } from '../lib/notices'
import { currentUser } from '../lib/auth'
import { Btn, Card, Field, Input, PageHeader, TextArea } from '../components/ui'

export default function Notifications() {
  const list = notices.use()
  const me = currentUser()
  const isOwner = me?.role === 'owner'
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ title: '', body: '' })

  const ordered = [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned) || +new Date(b.at) - +new Date(a.at))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) return
    addNotice(form.title, form.body, me?.name ?? 'Owner')
    setForm({ title: '', body: '' })
    setAdding(false)
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Notifications"
        sub="Committee ke notices aur reminders."
        actions={isOwner ? <Btn onClick={() => setAdding((v) => !v)}>{adding ? <Trash2 size={16} /> : <Plus size={16} />} {adding ? 'Cancel' : 'New notice'}</Btn> : undefined}
      />

      {adding && isOwner && (
        <Card className="mb-4 p-5">
          <form onSubmit={submit} className="grid gap-4">
            <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Data collection drive — Friday" /></Field>
            <Field label="Message"><TextArea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Poora message likho…" /></Field>
            <div><Btn type="submit"><Plus size={16} /> Publish notice</Btn></div>
          </form>
        </Card>
      )}

      {ordered.length ? (
        <div className="space-y-3">
          {ordered.map((n) => (
            <Card key={n.id} className={clsx('p-5', n.pinned && 'border-azure-300 ring-1 ring-azure-100')}>
              <div className="flex items-start gap-3">
                <span className={clsx('grid h-10 w-10 shrink-0 place-items-center rounded-xl', n.pinned ? 'bg-azure-600 text-white' : 'bg-azure-50 text-azure-600')}>
                  <Bell size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-[14.5px] font-bold text-ink">{n.title}</h3>
                    {n.pinned && <span className="rounded-full bg-azure-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Pinned</span>}
                  </div>
                  <p className="mt-1 whitespace-pre-line text-[12.5px] leading-relaxed text-ink-soft">{n.body}</p>
                  <div className="mt-2 text-[10.5px] font-semibold text-ink-mute">{n.author} · {new Date(n.at).toLocaleString()}</div>
                </div>
                {isOwner && (
                  <div className="flex shrink-0 gap-1.5">
                    <button type="button" aria-label="Pin" onClick={() => togglePin(n.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink-mute hover:border-azure-200 hover:text-azure-600">
                      {n.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                    </button>
                    <button type="button" aria-label="Delete" onClick={() => removeNotice(n.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink-mute hover:border-red-200 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="px-6 py-14 text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-azure-50 text-azure-600"><Bell size={22} /></span>
          <p className="text-[13px] text-ink-mute">Abhi koi notice nahi hai.</p>
        </Card>
      )}
    </div>
  )
}
