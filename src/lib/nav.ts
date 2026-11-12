import {
  LayoutDashboard, Users, Search, PlusCircle, BarChart3, Download, FileText,
  Landmark, QrCode, Building2, Bell, UserCog, ScrollText, Trash2, User, Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem { to: string; label: string; icon: LucideIcon; ownerOnly?: boolean }
export interface NavGroup { title: string; items: NavItem[] }

export const NAV: NavGroup[] = [
  {
    title: 'Records',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/households', label: 'Households', icon: Users },
      { to: '/find', label: 'Find Family', icon: Search },
      { to: '/add', label: 'Add Household', icon: PlusCircle },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
      { to: '/exports', label: 'Exports & Print', icon: Download, ownerOnly: true },
    ],
  },
  {
    title: 'Profiles',
    items: [
      { to: '/documents', label: 'Documents', icon: FileText },
      { to: '/schemes', label: 'Government Schemes', icon: Landmark },
      { to: '/idcards', label: 'ID Card Designer', icon: QrCode, ownerOnly: true },
      { to: '/masjid', label: 'Masjid Profile', icon: Building2 },
    ],
  },
  {
    title: 'Administration',
    items: [
      { to: '/users', label: 'Users', icon: UserCog, ownerOnly: true },
      { to: '/admin', label: 'Administration', icon: Settings, ownerOnly: true },
      { to: '/audit', label: 'Audit Log', icon: ScrollText, ownerOnly: true },
      { to: '/recycle', label: 'Recycle Bin', icon: Trash2, ownerOnly: true },
      { to: '/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/profile', label: 'My Profile', icon: User },
      { to: '/settings', label: 'Settings', icon: Settings, ownerOnly: true },
    ],
  },
]

/** Nav filtered for the signed-in role. */
export function navFor(isOwner: boolean): NavGroup[] {
  return NAV
    .map((g) => ({ ...g, items: g.items.filter((i) => isOwner || !i.ownerOnly) }))
    .filter((g) => g.items.length > 0)
}
