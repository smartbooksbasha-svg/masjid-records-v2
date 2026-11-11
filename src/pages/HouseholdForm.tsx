import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, ChevronDown, Plus, Save, Trash2 } from 'lucide-react'
import { clsx } from 'clsx'
import type { Family, Gender, Marital, Member } from '../lib/types'
import { DEENI, DOCS, EDUCATION, HOUSE_TYPES, OCCUPATIONS, SCHEMES, STREETS } from '../lib/data'
import { addFamily, blankFamily, blankMember, getFamily, newMemberId, updateFamily } from '../lib/store'
import { Btn, Card, Field, Input, PageHeader, Select, TextArea } from '../components/ui'

const RELATIONS = ['Head', 'Wife', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Other']
const MARITALS: Marital[] = ['Married', 'Unmarried', 'Widow', 'Widower', 'Child']

export default function HouseholdForm() {
  const { id } = useParams()
  const nav = useNavigate()
  const editing = Boolean(id)
  const [draft, setDraft] = useState<Family>(() => (id ? getFamily(id) ?? blankFamily() : blankFamily()))
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      const f = getFamily(id)
      if (f) setDraft(structuredClone(f))
    }
  }, [id])

  const set = <K extends keyof Family>(k: K, v: Family[K]) => setDraft((d) => ({ ...d, [k]: v }))

  const setMember = (mid: string, patch: Partial<Member>) =>
    setDraft((d) => ({ ...d, members: d.members.map((m) => (m.id === mid ? { ...m, ...patch } : m)) }))

  const addMember = () => setDraft((d) => ({ ...d, members: [...d.members, blankMember('Son')] }))
  const removeMember = (mid: string) => setDraft((d) => ({ ...d, members: d.members.filter((m) => m.id !== mid) }))

  const totals = useMemo(() => {
    const named = draft.members.filter((m) => m.name.trim())
    return {
      members: named.length,
      docs: named.reduce((n, m) => n + DOCS.filter((d) => m.docs[d]).length, 0),
      schemes: named.reduce((n, m) => n + m.schemes.length, 0),
    }
  }, [draft.members])

  function save() {
    if (!draft.head.trim()) {
      setError('Head of household ka naam zaroori hai.')
      return
    }
    const cleaned: Family = {
      ...draft,
      head: draft.head.trim(),
      street: draft.street.trim(),
      members: draft.members
        .filter((m) => m.name.trim())
        .map((m) => ({ ...m, name: m.name.trim(), id: m.id || newMemberId() })),
    }
    if (!cleaned.members.length) {
      setError('Kam se kam ek member ka naam daalo.')
      return
    }
    if (editing && id) {
      updateFamily(id, cleaned)
      nav(`/households/${id}`)
    } else {
      const created = addFamily(cleaned)
      nav(`/households/${created.id}`)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <Link to={editing ? `/households/${id}` : '/households'} className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-ink-mute hover:text-azure-600">
        <ArrowLeft size={15} /> {editing ? 'Back to household' : 'All households'}
      </Link>

      <PageHeader
        title={editing ? 'Edit household' : 'Add household'}
        sub={editing ? `Family ID ${draft.id}` : `New Family ID will be ${draft.id}`}
        actions={
          <>
            <Link to={editing ? `/households/${id}` : '/households'}><Btn variant="ghost">Cancel</Btn></Link>
            <Btn onClick={save}><Save size={16} /> Save household</Btn>
          </>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* Household info */}
      <Card className="p-5">
        <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Household</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Head of household *">
            <Input value={draft.head} onChange={(e) => set('head', e.target.value)} placeholder="e.g. Abdul Rahman" />
          </Field>
          <Field label="Street">
            <Input list="streets" value={draft.street} onChange={(e) => set('street', e.target.value)} placeholder="e.g. Street 3" />
            <datalist id="streets">{STREETS.map((s) => <option key={s} value={s} />)}</datalist>
          </Field>
          <Field label="House no.">
            <Input value={draft.houseNo} onChange={(e) => set('houseNo', e.target.value)} placeholder="e.g. 12/A" />
          </Field>
          <Field label="House type">
            <Select value={draft.houseType} onChange={(e) => set('houseType', e.target.value as Family['houseType'])}>
              {HOUSE_TYPES.map((h) => <option key={h} value={h}>{h}</option>)}
            </Select>
          </Field>
          <Field label="Phone">
            <Input value={draft.phone} onChange={(e) => set('phone', e.target.value)} placeholder="e.g. 98765 43210" inputMode="tel" />
          </Field>
          <Field label="Status">
            <Select value={draft.status} onChange={(e) => set('status', e.target.value as Family['status'])}>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </Select>
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Address">
              <TextArea value={draft.address} onChange={(e) => set('address', e.target.value)} placeholder="Full address" />
            </Field>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Notes">
              <TextArea value={draft.notes ?? ''} onChange={(e) => set('notes', e.target.value)} placeholder="Any remarks about this household" />
            </Field>
          </div>
        </div>
      </Card>

      {/* Members */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-[15px] font-bold">Members ({totals.members})</h2>
        <Btn variant="ghost" onClick={addMember}><Plus size={15} /> Add member</Btn>
      </div>

      <div className="mt-3 space-y-3">
        {draft.members.map((m, i) => (
          <MemberCard
            key={m.id}
            index={i}
            member={m}
            canRemove={draft.members.length > 1}
            onChange={(patch) => setMember(m.id, patch)}
            onRemove={() => removeMember(m.id)}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <p className="text-[12px] text-ink-mute">
          {totals.members} members · {totals.docs} documents · {totals.schemes} scheme entries
        </p>
        <div className="flex gap-2">
          <Link to={editing ? `/households/${id}` : '/households'}><Btn variant="ghost">Cancel</Btn></Link>
          <Btn onClick={save}><Save size={16} /> {editing ? 'Save changes' : 'Save household'}</Btn>
        </div>
      </div>
    </div>
  )
}

function MemberCard({ index, member, canRemove, onChange, onRemove }: {
  index: number
  member: Member
  canRemove: boolean
  onChange: (patch: Partial<Member>) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(index === 0)

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-azure-50 font-display text-[13px] font-bold text-azure-600">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-bold text-ink">{member.name || 'New member'}</span>
          <span className="block truncate text-[11.5px] text-ink-mute">{member.relation} · {member.gender}{member.dob ? ` · ${member.dob}` : ''}</span>
        </span>
        {canRemove && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onRemove() } }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line text-ink-mute hover:border-red-200 hover:text-red-600"
            aria-label="Remove member"
          >
            <Trash2 size={15} />
          </span>
        )}
        <ChevronDown size={17} className={clsx('shrink-0 text-ink-mute transition', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="border-t border-line px-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Full name *">
              <Input value={member.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Member name" />
            </Field>
            <Field label="Relation">
              <Select value={member.relation} onChange={(e) => onChange({ relation: e.target.value })}>
                {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
            </Field>
            <Field label="Gender">
              <Select value={member.gender} onChange={(e) => onChange({ gender: e.target.value as Gender })}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </Select>
            </Field>
            <Field label="Date of birth">
              <Input type="date" value={member.dob} onChange={(e) => onChange({ dob: e.target.value })} />
            </Field>
            <Field label="Marital status">
              <Select value={member.marital} onChange={(e) => onChange({ marital: e.target.value as Marital })}>
                {MARITALS.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
            </Field>
            <Field label="Education">
              <Select value={member.education} onChange={(e) => onChange({ education: e.target.value })}>
                {EDUCATION.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
            </Field>
            <Field label="Occupation">
              <Input list="occupations" value={member.occupation} onChange={(e) => onChange({ occupation: e.target.value })} placeholder="e.g. Plumber" />
              <datalist id="occupations">{OCCUPATIONS.map((o) => <option key={o} value={o} />)}</datalist>
            </Field>
            <Field label="Deeni taleem">
              <Select value={member.deeni} onChange={(e) => onChange({ deeni: e.target.value })}>
                <option value="">None</option>
                {DEENI.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
            </Field>
            <div className="flex flex-wrap items-end gap-2">
              <Toggle on={member.student} onClick={() => onChange({ student: !member.student })}>Student</Toggle>
              <Toggle on={member.disabled} onClick={() => onChange({ disabled: !member.disabled })}>Disabled</Toggle>
              <Toggle on={member.widow} onClick={() => onChange({ widow: !member.widow })}>Widow</Toggle>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[.06em] text-ink-mute">Documents held</div>
              <div className="flex flex-wrap gap-1.5">
                {DOCS.map((d) => (
                  <Toggle key={d} on={Boolean(member.docs[d])} onClick={() => onChange({ docs: { ...member.docs, [d]: !member.docs[d] } })}>
                    {d}
                  </Toggle>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[.06em] text-ink-mute">Government schemes</div>
              <div className="flex flex-wrap gap-1.5">
                {SCHEMES.map((s) => {
                  const on = member.schemes.includes(s)
                  return (
                    <Toggle key={s} on={on} onClick={() => onChange({ schemes: on ? member.schemes.filter((x) => x !== s) : [...member.schemes, s] })}>
                      {s}
                    </Toggle>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-bold transition',
        on ? 'border-azure-600 bg-azure-600 text-white' : 'border-line bg-white text-ink-mute hover:border-azure-200 hover:text-azure-600',
      )}
    >
      {on && <Check size={12} />}
      {children}
    </button>
  )
}
