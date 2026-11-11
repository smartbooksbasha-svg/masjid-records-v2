import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  Users, UserPlus, Search, ArrowUpRight, Baby, Heart, GraduationCap, Accessibility, Home, MapPin,
} from 'lucide-react'
import { clsx } from 'clsx'
import { FAMILIES } from '../lib/data'
import { computeStats } from '../lib/stats'
import { useFamilies } from '../lib/store'
import { asset } from '../lib/asset'
import { BarList, Card, SectionTitle, StatTile } from '../components/ui'

const RANGES = [
  { key: 'today', label: 'Today', days: 1 },
  { key: '7d', label: '7 days', days: 7 },
  { key: '30d', label: '30 days', days: 30 },
  { key: 'year', label: 'This year', days: 365 },
  { key: 'all', label: 'All', days: 100000 },
] as const

export default function Dashboard() {
  const families = useFamilies()
  const stats = useMemo(() => computeStats(families.length ? families : FAMILIES), [families])
  const [range, setRange] = useState<(typeof RANGES)[number]['key']>('30d')

  const recent = useMemo(() => {
    const days = RANGES.find((r) => r.key === range)!.days
    const cutoff = Date.now() - days * 86400000
    return [...families]
      .filter((f) => new Date(f.createdAt).getTime() >= cutoff)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 6)
  }, [families, range])

  const hero = asset('hero.jpg')

  return (
    <div className="pb-12">
      {/* HERO */}
      <div className="relative">
        <div className="relative h-[300px] overflow-hidden sm:h-[340px] lg:rounded-b-[28px]">
          <img src={hero} alt="Masjid" className="absolute inset-0 h-full w-full object-cover" />
          <div className="scrim-hero absolute inset-0" />
          <div className="relative z-10 flex h-full flex-col justify-end p-5 text-white sm:p-7">
            <div className="text-[10px] font-bold uppercase tracking-[.24em] text-white/70">Assalamu Alaikum</div>
            <h1 className="mt-1 max-w-md font-display text-[26px] font-bold leading-[1.1] tracking-tight sm:text-4xl">
              Community Records
            </h1>
            <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-white/80">
              Har ghar, har fard — masjid ki khidmat ka poora hisaab, ek jagah.
            </p>
          </div>
        </div>

        {/* Overlapping headline stats */}
        <div className="relative z-20 -mt-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-3">
            <HeroStat icon={<Home size={15} />} label="Households" value={stats.families} />
            <HeroStat icon={<Users size={15} />} label="People" value={stats.population} />
            <HeroStat icon={<Baby size={15} />} label="Children" value={stats.children} />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-7 px-4 sm:px-6 lg:px-8">
        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickAction to="/add" icon={<UserPlus size={17} />} title="Add Household" tone="primary" />
          <QuickAction to="/find" icon={<Search size={17} />} title="Find Family" />
          <QuickAction to="/households" icon={<Users size={17} />} title="View All" />
          <QuickAction to="/reports" icon={<ArrowUpRight size={17} />} title="Reports" />
        </div>

        {/* KPI BENTO */}
        <section>
          <SectionTitle title="At a glance" sub={`Live totals from ${stats.families} households · ${stats.streets} streets`} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile label="Population" value={stats.population} sub={`${stats.male} M · ${stats.female} F`} accent />
            <StatTile label="Men" value={stats.male} />
            <StatTile label="Women" value={stats.female} />
            <StatTile label="Children" value={stats.children} sub="under 18" />
            <StatTile label="Students" value={stats.students} />
            <StatTile label="Widows" value={stats.widows} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat icon={<Heart size={15} />} label="Married" value={stats.married} />
            <MiniStat icon={<Heart size={15} />} label="Unmarried" value={stats.unmarried} />
            <MiniStat icon={<Accessibility size={15} />} label="Disabled" value={stats.disabled} />
            <MiniStat icon={<GraduationCap size={15} />} label="Streets" value={stats.streets} />
          </div>
        </section>

        {/* POPULATION BY STREET */}
        <section>
          <SectionTitle title="Population by street" sub="People counted per mohalla street" />
          <Card className="p-4">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.streetRows} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#eef2f6" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={34} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(14,92,134,.06)' }} contentStyle={{ borderRadius: 12, border: '1px solid #e4eaf0', fontSize: 12 }} />
                  <Bar dataKey="value" name="People" radius={[6, 6, 0, 0]} fill="#0e5c86" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* HOUSING + EDUCATION */}
        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <SectionTitle title="Housing types" sub="Households by construction" />
            <BarList rows={stats.housing} accent="#4e9bc7" />
          </Card>
          <Card className="p-5">
            <SectionTitle title="Education levels" sub="Members by education" />
            <BarList rows={stats.education} />
          </Card>
        </section>

        {/* OCCUPATION + DEENI */}
        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <SectionTitle title="Occupations" sub="Top occupations among members" />
            {stats.occupation.length ? <BarList rows={stats.occupation} accent="#4e9bc7" /> : <Empty text="No occupations recorded yet." />}
          </Card>
          <Card className="p-5">
            <SectionTitle title="Deeni taleem" sub="Quranic education" />
            {stats.deeni.length ? <BarList rows={stats.deeni} /> : <Empty text="No deeni records yet." />}
          </Card>
        </section>

        {/* DOCS + SCHEMES */}
        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <SectionTitle title="Documents held" sub="Members with each document" />
            <BarList rows={stats.docs} accent="#4e9bc7" />
          </Card>
          <Card className="p-5">
            <SectionTitle title="Government schemes" sub="Members enrolled per scheme" />
            <BarList rows={stats.schemes} />
          </Card>
        </section>

        {/* RECENT */}
        <section>
          <SectionTitle
            title="Recently added households"
            sub="Filter by when they were entered"
            action={
              <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto rounded-full bg-azure-50 p-1">
                {RANGES.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setRange(r.key)}
                    className={clsx(
                      'shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-bold transition',
                      range === r.key ? 'bg-white text-azure-600 shadow-sm' : 'text-ink-mute hover:text-ink-soft',
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            }
          />
          {recent.length ? (
            <div className="space-y-2.5">
              {recent.map((f) => (
                <Link key={f.id} to={`/households/${f.id}`} className="block">
                  <Card className="flex items-center gap-4 p-4 transition hover:border-azure-200 hover:shadow-float">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-azure-50 font-display text-sm font-bold text-azure-600">
                      {f.members.length}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-bold text-ink">{f.head}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-ink-mute">
                        <span className="inline-flex items-center gap-1"><MapPin size={12} /> {f.street}</span>
                        <span className="mono rounded bg-azure-50 px-1.5 py-0.5 text-[10px] font-bold text-azure-600">{f.id}</span>
                      </div>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <div className="text-[11px] font-semibold text-ink-mute">{f.houseType}</div>
                      <div className="text-[10.5px] text-ink-mute/80">{new Date(f.createdAt).toLocaleDateString()}</div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-8"><Empty text="Is range me koi household add nahi hua. Filter badal ke dekho." /></Card>
          )}
        </section>
      </div>
    </div>
  )
}

function HeroStat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <Card className="p-3.5 shadow-float sm:p-4">
      <div className="flex items-center gap-2 text-azure-600">
        {icon}
        <span className="text-[9.5px] font-bold uppercase tracking-[.1em] text-ink-mute">{label}</span>
      </div>
      <div className="num mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-[28px]">{value}</div>
    </Card>
  )
}

function QuickAction({ to, icon, title, tone }: { to: string; icon: ReactNode; title: string; tone?: 'primary' }) {
  return (
    <Link
      to={to}
      className={clsx(
        'flex items-center gap-3 rounded-xl2 border p-3.5 text-[13px] font-bold transition',
        tone === 'primary'
          ? 'border-azure-600 bg-azure-600 text-white shadow-[0_16px_30px_-16px_rgba(14,92,134,.95)] hover:brightness-105'
          : 'border-line bg-white text-ink-soft hover:border-azure-200 hover:text-azure-600',
      )}
    >
      <span className={clsx('grid h-9 w-9 shrink-0 place-items-center rounded-xl', tone === 'primary' ? 'bg-white/15' : 'bg-azure-50 text-azure-600')}>
        {icon}
      </span>
      <span className="truncate">{title}</span>
    </Link>
  )
}

function MiniStat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <Card className="flex items-center gap-3 p-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-azure-50 text-azure-600">{icon}</span>
      <div className="min-w-0">
        <div className="num font-display text-lg font-bold leading-none text-ink">{value}</div>
        <div className="mt-0.5 truncate text-[10.5px] font-semibold text-ink-mute">{label}</div>
      </div>
    </Card>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="py-4 text-center text-[12.5px] text-ink-mute">{text}</p>
}
