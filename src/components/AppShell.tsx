import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { Menu, X, Bell, LogOut, Moon, Sun, Globe } from 'lucide-react'
import { navFor } from '../lib/nav'
import { applyDir, applyTheme, settings } from '../lib/settings'
import { logout, useCurrentUser } from '../lib/auth'
import { LANGS, useT } from '../lib/i18n'
import { notices } from '../lib/notices'
import Login from '../pages/Login'

function Crest({ size = 36 }: { size?: number }) {
  const s = settings.use()
  return (
    <div
      className="grid shrink-0 place-items-center overflow-hidden rounded-xl bg-azure-600 text-white shadow-[0_10px_22px_-12px_rgba(14,92,134,.95)]"
      style={{ width: size, height: size }}
    >
      {s.logo ? (
        <img src={s.logo} alt="" className="h-full w-full object-cover" />
      ) : (
        <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 21V11l8-6 8 6v10" />
          <path d="M9 21v-5h6v5" />
          <path d="M12 5V2.5" />
        </svg>
      )}
    </div>
  )
}

function ThemeLangControls() {
  const s = settings.use()
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label="Toggle theme"
        onClick={() => settings.update((p) => ({ ...p, theme: p.theme === 'dark' ? 'light' : 'dark' }))}
        className="grid h-9 w-9 place-items-center rounded-xl border border-line text-ink-soft transition hover:border-azure-200 hover:text-azure-600"
      >
        {s.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <label className="relative grid h-9 place-items-center rounded-xl border border-line text-ink-soft">
        <Globe size={15} className="pointer-events-none absolute left-2.5" />
        <select
          aria-label="Language"
          value={s.lang}
          onChange={(e) => settings.update((p) => ({ ...p, lang: e.target.value as typeof p.lang }))}
          className="h-full cursor-pointer appearance-none bg-transparent pl-8 pr-6 text-[12px] font-bold text-ink outline-none"
        >
          {LANGS.map((l) => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
      </label>
    </div>
  )
}

function SidebarContent({ onNavigate, isOwner }: { onNavigate?: () => void; isOwner: boolean }) {
  const user = useCurrentUser()
  const s = settings.use()
  const t = useT()
  const nav = useNavigate()
  const unread = notices.use().length

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <Crest />
        <div className="min-w-0">
          <div className="truncate font-display text-[15px] font-bold leading-tight tracking-tight">{s.name}</div>
          <div className="text-[9px] font-bold uppercase tracking-[.22em] text-azure-600">{s.tagline}</div>
        </div>
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 pb-4">
        {navFor(isOwner).map((g) => (
          <div key={g.title} className="mb-4">
            <div className="px-3 pb-1.5 text-[9.5px] font-bold uppercase tracking-[.18em] text-ink-mute/70">{t(g.title)}</div>
            {g.items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === '/'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  clsx(
                    'mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition',
                    isActive ? 'bg-azure-600 text-white shadow-[0_10px_22px_-12px_rgba(14,92,134,.9)]' : 'text-ink-soft hover:bg-azure-50',
                  )
                }
              >
                <it.icon size={17} strokeWidth={2} />
                <span className="truncate">{t(it.label)}</span>
                {it.to === '/notifications' && unread > 0 && (
                  <span className="ml-auto shrink-0 rounded-full bg-azure-600 px-1.5 py-0.5 text-[9px] font-bold text-white">{unread}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-3 py-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-paper px-3 py-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-azure-600 font-display text-[12px] font-bold text-white">
            {(user?.name || '?').slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] font-bold text-ink">{user?.name}</div>
            <div className="truncate text-[10.5px] font-semibold text-azure-600">{isOwner ? 'Owner · Admin' : 'User'}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { logout(); nav('/') }}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12.5px] font-bold text-ink-soft transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={16} /> {t('Log out')}
        </button>
        <div className="px-3 pt-2 text-[10px] font-semibold text-ink-mute">v0.9 · Sanctum</div>
      </div>
    </div>
  )
}

export default function AppShell() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const s = settings.use()
  const user = useCurrentUser()
  const isOwner = user?.role === 'owner'

  useEffect(() => {
    applyTheme(s.theme)
    applyDir(s.lang)
  }, [s.theme, s.lang])

  useEffect(() => { setOpen(false) }, [loc.pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!user) return <Login />

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-[264px] shrink-0 border-r border-line bg-white lg:sticky lg:top-0 lg:block lg:h-screen">
        <SidebarContent isOwner={isOwner} />
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-white/85 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <Crest size={32} />
          <div className="truncate font-display text-[14px] font-bold leading-tight">{s.name}</div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeLangControls />
          <button aria-label="Menu" onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-xl bg-azure-600 text-white">
            <Menu size={18} />
          </button>
        </div>
      </header>

      <div className="hidden lg:flex lg:fixed lg:right-6 lg:top-4 lg:z-30 lg:gap-2">
        <ThemeLangControls />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-white shadow-2xl">
            <button aria-label="Close" onClick={() => setOpen(false)} className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-xl border border-line text-ink-soft">
              <X size={17} />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} isOwner={isOwner} />
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
