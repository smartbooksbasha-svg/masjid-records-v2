import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useFamilies } from '../lib/store'
import { ageOf, computeStats } from '../lib/stats'
import { BarList, Card, PageHeader, StatTile } from '../components/ui'

export default function Reports() {
  const families = useFamilies()
  const stats = useMemo(() => computeStats(families), [families])

  const streetTable = useMemo(
    () =>
      stats.streetRows.map((r) => {
        const fs = families.filter((f) => f.street === r.label)
        const ms = fs.flatMap((f) => f.members)
        return {
          street: r.label,
          households: fs.length,
          people: ms.length,
          men: ms.filter((m) => m.gender === 'Male').length,
          women: ms.filter((m) => m.gender === 'Female').length,
          children: ms.filter((m) => ageOf(m.dob) < 18).length,
          students: ms.filter((m) => m.student).length,
        }
      }),
    [families, stats.streetRows],
  )

  const total = stats.population || 1
  const pct = (n: number) => `${Math.round((n / total) * 100)}%`

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Reports & Analytics"
        sub={`${stats.families} households · ${stats.population} people · ${stats.streets} streets`}
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Population" value={stats.population} sub={`${stats.male} M · ${stats.female} F`} accent />
        <StatTile label="Households" value={stats.families} />
        <StatTile label="Children" value={stats.children} sub="under 18" />
        <StatTile label="Students" value={stats.students} sub={pct(stats.students)} />
        <StatTile label="Widows" value={stats.widows} />
        <StatTile label="Disabled" value={stats.disabled} />
        <StatTile label="Married" value={stats.married} sub={pct(stats.married)} />
        <StatTile label="Unmarried" value={stats.unmarried} />
        <StatTile label="Streets" value={stats.streets} />
        <StatTile label="Occupations" value={stats.occupation.length} sub="distinct" />
        <StatTile label="Deeni students" value={stats.deeni.reduce((n, r) => n + r.value, 0)} />
        <StatTile label="Scheme entries" value={stats.schemes.reduce((n, r) => n + r.value, 0)} />
      </div>

      {/* Street chart */}
      <section className="mt-7">
        <h2 className="mb-3 font-display text-[15px] font-bold">Population by street</h2>
        <Card className="p-4">
          <div className="h-[240px] w-full">
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

      {/* Street table */}
      <section className="mt-7">
        <h2 className="mb-3 font-display text-[15px] font-bold">Street-wise breakdown</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-line bg-paper text-[10.5px] uppercase tracking-[.06em] text-ink-mute">
                  <th className="px-4 py-2.5 font-bold">Street</th>
                  <th className="px-4 py-2.5 font-bold">Households</th>
                  <th className="px-4 py-2.5 font-bold">People</th>
                  <th className="px-4 py-2.5 font-bold">Men</th>
                  <th className="px-4 py-2.5 font-bold">Women</th>
                  <th className="px-4 py-2.5 font-bold">Children</th>
                  <th className="px-4 py-2.5 font-bold">Students</th>
                </tr>
              </thead>
              <tbody>
                {streetTable.map((r) => (
                  <tr key={r.street} className="border-b border-line last:border-0">
                    <td className="px-4 py-2.5 font-semibold text-ink">{r.street}</td>
                    <td className="num px-4 py-2.5 text-ink-soft">{r.households}</td>
                    <td className="num px-4 py-2.5 font-bold text-ink">{r.people}</td>
                    <td className="num px-4 py-2.5 text-ink-soft">{r.men}</td>
                    <td className="num px-4 py-2.5 text-ink-soft">{r.women}</td>
                    <td className="num px-4 py-2.5 text-ink-soft">{r.children}</td>
                    <td className="num px-4 py-2.5 text-ink-soft">{r.students}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Breakdowns */}
      <section className="mt-7 grid gap-4 lg:grid-cols-2">
        <Card className="p-5"><h3 className="mb-3 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Housing types</h3><BarList rows={stats.housing} accent="#4e9bc7" /></Card>
        <Card className="p-5"><h3 className="mb-3 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Education levels</h3><BarList rows={stats.education} /></Card>
        <Card className="p-5"><h3 className="mb-3 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Occupations</h3>{stats.occupation.length ? <BarList rows={stats.occupation} accent="#4e9bc7" /> : <p className="py-3 text-[12.5px] text-ink-mute">Koi occupation record nahi.</p>}</Card>
        <Card className="p-5"><h3 className="mb-3 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Deeni taleem</h3>{stats.deeni.length ? <BarList rows={stats.deeni} /> : <p className="py-3 text-[12.5px] text-ink-mute">Koi deeni record nahi.</p>}</Card>
      </section>

      {/* Documents + Schemes tables */}
      <section className="mt-7 grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-3 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Documents held</div>
          <table className="w-full border-collapse text-left text-[12.5px]">
            <tbody>
              {stats.docs.map((d) => (
                <tr key={d.label} className="border-b border-line last:border-0">
                  <td className="px-5 py-2.5 text-ink-soft">{d.label}</td>
                  <td className="num px-5 py-2.5 text-right font-bold text-ink">{d.value}</td>
                  <td className="num w-16 px-5 py-2.5 text-right text-ink-mute">{pct(d.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-3 text-[13px] font-bold uppercase tracking-[.06em] text-ink-mute">Government schemes</div>
          <table className="w-full border-collapse text-left text-[12.5px]">
            <tbody>
              {stats.schemes.map((d) => (
                <tr key={d.label} className="border-b border-line last:border-0">
                  <td className="px-5 py-2.5 text-ink-soft">{d.label}</td>
                  <td className="num px-5 py-2.5 text-right font-bold text-ink">{d.value}</td>
                  <td className="num w-16 px-5 py-2.5 text-right text-ink-mute">{pct(d.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  )
}
