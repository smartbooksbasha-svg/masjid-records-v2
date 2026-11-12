import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw, Trash2, Users } from 'lucide-react'
import { emptyRecycleBin, purgeFamily, restoreFamily, useDeletedFamilies } from '../lib/store'
import { currentUser } from '../lib/auth'
import { Btn, Card, PageHeader } from '../components/ui'
import { RequireOwner } from '../components/Guard'

export default function Recycle() {
  return (
    <RequireOwner>
      <RecycleInner />
    </RequireOwner>
  )
}

function RecycleInner() {
  const deleted = useDeletedFamilies()
  const me = currentUser()
  const [confirmEmpty, setConfirmEmpty] = useState(false)
  const actor = me?.name ?? 'owner'

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Recycle Bin"
        sub={`${deleted.length} deleted household${deleted.length === 1 ? '' : 's'} — restore ya permanently delete karo.`}
        actions={
          confirmEmpty ? (
            <>
              <Btn variant="danger" onClick={() => { emptyRecycleBin(actor); setConfirmEmpty(false) }}><Trash2 size={15} /> Yes, empty bin</Btn>
              <Btn variant="ghost" onClick={() => setConfirmEmpty(false)}>Cancel</Btn>
            </>
          ) : (
            <Btn variant="danger" onClick={() => setConfirmEmpty(true)} disabled={!deleted.length}><Trash2 size={15} /> Empty bin</Btn>
          )
        }
      />

      {deleted.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {deleted.map((f) => (
            <Card key={f.id} className="flex flex-col p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-azure-50 font-display text-sm font-bold text-azure-600">{f.members.length}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-[14.5px] font-bold text-ink">{f.head || 'Unnamed household'}</h3>
                  <div className="mono mt-0.5 text-[10.5px] font-bold text-ink-mute">{f.id}</div>
                  <div className="mt-0.5 text-[11px] text-ink-mute">{f.street || '—'} · deleted {f.deletedAt ? new Date(f.deletedAt).toLocaleDateString() : '—'}</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2 border-t border-line pt-3">
                <Btn variant="ghost" className="flex-1" onClick={() => restoreFamily(f.id, actor)}><RotateCcw size={14} /> Restore</Btn>
                <Btn variant="danger" onClick={() => purgeFamily(f.id, actor)}><Trash2 size={14} /></Btn>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="px-6 py-14 text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-azure-50 text-azure-600"><Trash2 size={22} /></span>
          <h3 className="font-display text-lg font-bold">Recycle bin khali hai</h3>
          <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] text-ink-mute">
            Delete kiye gaye households yahan aate hain — galti se delete ho jaye to restore kar sakte ho.
          </p>
          <Link to="/households" className="mt-5 inline-block"><Btn variant="ghost"><Users size={15} /> All households</Btn></Link>
        </Card>
      )}
    </div>
  )
}
