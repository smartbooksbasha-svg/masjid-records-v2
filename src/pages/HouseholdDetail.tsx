import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Check, Pencil, Phone, Trash2, MapPin, Home, X, IdCard,
} from 'lucide-react'
import { deleteFamily, useFamilies } from '../lib/store'
import { ageOf } from '../lib/stats'
import { DOCS, SCHEMES } from '../lib/data'
import { Btn, Card, PageHeader } from '../components/ui'

export default function HouseholdDetail() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const families = useFamilies()
  const family = useMemo(() => families.find((f) => f.id === id), [families, id])
  const [confirm, setConfirm] = useState(false)

  if (!family) {
    return (
      <div className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-xl font-bold">Household not found</h1>
        <p className="mt-1.5 text-[12.5px] text-ink-mute">Family ID <span className="mono">{id}</span> exist nahi karti.</p>
        <Link to="/households" className="mt-5 inline-block"><Btn variant="ghost"><ArrowLeft size={16} /> All households</Btn></Link>
      </div>
    )
  }

  const adults = family.members.filter((m) => ageOf(m.dob) >= 18).length

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <Link to="/households" className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-ink-mute hover:text-azure-600">
        <ArrowLeft size={15} /> All households
      </Link>

      <PageHeader
        title={family.head || 'Unnamed household'}
        sub={`Family ID ${family.id}`}
        actions={
          <>
            <Link to={`/edit/${family.id}`}><Btn variant="ghost"><Pencil size={15} /> Edit</Btn></Link>
            <Btn variant="danger" onClick={() => setConfirm(true)}><Trash2 size={15} /> Delete</Btn>
          </>
        }
      />

      {/* Info */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Household details</h2>
          <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Info icon={<MapPin size={14} />} label="Street" value={family.street} />
            <Info icon={<Home size={14} />} label="House no." value={family.houseNo} />
            <Info icon={<Home size={14} />} label="House type" value={family.houseType} />
            <Info icon={<Phone size={14} />} label="Phone" value={family.phone} />
            <Info icon={<IdCard size={14} />} label="Family ID" value={family.id} mono />
            <Info icon={<Check size={14} />} label="Status" value={family.status} />
          </div>
          {family.address && (
            <div className="mt-4 border-t border-line pt-3">
              <div className="text-[11px] font-bold uppercase tracking-[.06em] text-ink-mute">Address</div>
              <p className="mt-1 text-[13px] text-ink-soft">{family.address}</p>
            </div>
          )}
          {family.notes && (
            <div className="mt-4 border-t border-line pt-3">
              <div className="text-[11px] font-bold uppercase tracking-[.06em] text-ink-mute">Notes</div>
              <p className="mt-1 text-[13px] text-ink-soft">{family.notes}</p>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            <Mini label="Members" value={family.members.length} />
            <Mini label="Adults" value={adults} />
            <Mini label="Children" value={family.members.length - adults} />
            <Mini label="Documents" value={Object.values(family.members.reduce<Record<string, boolean>>((acc, m) => {
              for (const d of DOCS) if (m.docs[d]) acc[`${m.id}-${d}`] = true
              return acc
            }, {})).length} />
          </div>
          <div className="mt-4 border-t border-line pt-3 text-[11.5px] text-ink-mute">
            <div>Added {new Date(family.createdAt).toLocaleDateString()}</div>
            <div>Updated {new Date(family.updatedAt).toLocaleString()}</div>
          </div>
        </Card>
      </div>

      {/* Members */}
      <section className="mt-6">
        <h2 className="mb-3 font-display text-[15px] font-bold">Members ({family.members.length})</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-line bg-paper text-[10.5px] uppercase tracking-[.06em] text-ink-mute">
                  <th className="px-4 py-2.5 font-bold">Name</th>
                  <th className="px-4 py-2.5 font-bold">Relation</th>
                  <th className="px-4 py-2.5 font-bold">Age</th>
                  <th className="px-4 py-2.5 font-bold">Gender</th>
                  <th className="px-4 py-2.5 font-bold">Marital</th>
                  <th className="px-4 py-2.5 font-bold">Education</th>
                  <th className="px-4 py-2.5 font-bold">Occupation</th>
                  <th className="px-4 py-2.5 font-bold">Deeni</th>
                </tr>
              </thead>
              <tbody>
                {family.members.map((m) => (
                  <tr key={m.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-2.5 font-semibold text-ink">
                      {m.name || '—'}
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        {m.student && <Tag>Student</Tag>}
                        {m.disabled && <Tag>Disabled</Tag>}
                        {m.widow && <Tag>Widow</Tag>}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-ink-soft">{m.relation || '—'}</td>
                    <td className="num px-4 py-2.5 text-ink-soft">{m.dob ? ageOf(m.dob) : '—'}</td>
                    <td className="px-4 py-2.5 text-ink-soft">{m.gender}</td>
                    <td className="px-4 py-2.5 text-ink-soft">{m.marital}</td>
                    <td className="px-4 py-2.5 text-ink-soft">{m.education || '—'}</td>
                    <td className="px-4 py-2.5 text-ink-soft">{m.occupation || '—'}</td>
                    <td className="px-4 py-2.5 text-ink-soft">{m.deeni || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Documents */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Documents held</h2>
          <div className="space-y-2">
            {DOCS.map((d) => {
              const holders = family.members.filter((m) => m.docs[d])
              return (
                <div key={d} className="flex items-center justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0">
                  <span className="text-[12.5px] font-semibold text-ink-soft">{d}</span>
                  {holders.length ? (
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-emerald-600">
                      <Check size={13} /> {holders.length}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-ink-mute/70">
                      <X size={13} /> none
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Government schemes</h2>
          {SCHEMES.some((s) => family.members.some((m) => m.schemes.includes(s))) ? (
            <div className="space-y-2">
              {SCHEMES.map((s) => {
                const holders = family.members.filter((m) => m.schemes.includes(s))
                if (!holders.length) return null
                return (
                  <div key={s} className="flex items-center justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0">
                    <span className="text-[12.5px] font-semibold text-ink-soft">{s}</span>
                    <span className="text-[11.5px] font-bold text-azure-600">{holders.length}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="py-3 text-[12.5px] text-ink-mute">Koi scheme enrolled nahi.</p>
          )}
        </Card>
      </section>

      {/* Delete confirm */}
      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm p-5">
            <h3 className="font-display text-[16px] font-bold">Delete this household?</h3>
            <p className="mt-1.5 text-[12.5px] text-ink-mute">
              {family.head || 'This household'} ({family.id}) aur iske {family.members.length} members hamesha ke liye hat jayenge.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Btn variant="ghost" onClick={() => setConfirm(false)}>Cancel</Btn>
              <Btn variant="danger" onClick={() => { deleteFamily(family.id); nav('/households') }}>
                <Trash2 size={15} /> Delete
              </Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function Info({ icon, label, value, mono }: { icon: ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-azure-600">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10.5px] font-bold uppercase tracking-[.06em] text-ink-mute">{label}</div>
        <div className={`truncate text-[13px] font-semibold text-ink-soft ${mono ? 'mono' : ''}`}>{value || '—'}</div>
      </div>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-paper px-3 py-2.5">
      <div className="num font-display text-lg font-bold text-ink">{value}</div>
      <div className="text-[10.5px] font-semibold text-ink-mute">{label}</div>
    </div>
  )
}

function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-azure-50 px-1.5 py-0.5 text-[9px] font-bold text-azure-600">{children}</span>
}
