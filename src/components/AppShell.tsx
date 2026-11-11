import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import { Menu, X, Bell } from 'lucide-react'
import { NAV } from '../lib/nav'

function Crest({ size = 36 }: { size?: number }) {
  return (
    <div className="grid shrink-0 place-items-center rounded-xl bg-azure-600 text-white shadow-[0_10px_22px_-12px_rgba(14,92,134,.95)]" style={{ width: size, height: size }}>
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 21V11l8-6 8 6v10" />
        <path d="M9 21v-5h6v5" />
        <path d="M12 5V2.5" />
      </svg>
    </div>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <Crest />
        <div className="min-w-0">
          <div className="font-display text-[15px] font-bold leading-tight tracking-tight">Masjid Khidmat</div>
          <div className="text-[9px] font-bold uppercase tracking-[.22em] text-azure-600">Community Records</div>
        </div>
      </div>
      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 pb-4">
        {NAV.map((g) => (
          <div key={g.title} className="mb-4">
            <div className="px-3 pb-1.5 text-[9.5px] font-bold uppercase tracking-[.18em] text-ink-mute/70">{g.title}</div>
            {g.items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === '/'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  clsx(
                    'mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition',
                    isActive
                      ? 'bg-azure-600 text-white shadow-[0_10px_22px_-12px_rgba(14,92,134,.9)]'
                      : 'text-ink-soft hover:bg-azure-50',
                  )
                }
              >
                <it.icon size={17} strokeWidth={2} />
                <span className="truncate">{it.label}</span>
                {it.soon && (
                  <span className="ml-auto shrink-0 rounded-full bg-azure-50 px-2 py-0.5 text-[9px] font-bold text-azure-600">soon</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="border-t border-line px-5 py-4 text-[11px] font-semibold text-ink-mute">
        v0.1 · Sanctum
      </div>
    </div>
  )
}

export default function AppShell() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()

  useEffect(() => { setOpen(false) }, [loc.pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-[264px] shrink-0 border-r border-line bg-white lg:sticky lg:top-0 lg:block lg:h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-white/85 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <Crest size={32} />
          <div className="font-display text-[14px] font-bold leading-tight">Masjid Khidmat</div>
        </div>
        <div className="flex items-center gap-2">
          <button aria-label="Notifications" className="grid h-9 w-9 place-items-center rounded-xl border border-line text-ink-soft">
            <Bell size={17} />
          </button>
          <button aria-label="Menu" onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-xl bg-azure-600 text-white">
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-white shadow-2xl">
            <button aria-label="Close" onClick={() => setOpen(false)} className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-xl border border-line text-ink-soft">
              <X size={17} />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
