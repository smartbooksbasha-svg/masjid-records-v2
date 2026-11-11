import {
  LayoutDashboard, Users, Search, PlusCircle, BarChart3, Download, FileText,
  Landmark, QrCode, Building2, Bell, UserCog, ScrollText, Trash2, User, Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem { to: string; label: string; icon: LucideIcon; soon?: boolean }
export interface NavGroup { title: string; items: NavItem[] }

export const NAV: NavGroup[] = [
  {
    title: 'Records',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/households', label: 'Households', icon: Users },
      { to: '/find', label: 'Find Family', icon: Search, soon: true },
      { to: '/add', label: 'Add Household', icon: PlusCircle },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { to: '/reports', label: 'Reports & Analytics', icon: BarChart3, soon: true },
      { to: '/exports', label: 'Exports & Print', icon: Download, soon: true },
    ],
  },
  {
    title: 'Profiles',
    items: [
      { to: '/documents', label: 'Documents', icon: FileText, soon: true },
      { to: '/schemes', label: 'Government Schemes', icon: Landmark, soon: true },
      { to: '/idcards', label: 'ID Card Designer', icon: QrCode, soon: true },
      { to: '/masjid', label: 'Masjid Profile', icon: Building2, soon: true },
    ],
  },
  {
    title: 'Administration',
    items: [
      { to: '/users', label: 'Users', icon: UserCog, soon: true },
      { to: '/admin', label: 'Administration', icon: Settings, soon: true },
      { to: '/audit', label: 'Audit Log', icon: ScrollText, soon: true },
      { to: '/recycle', label: 'Recycle Bin', icon: Trash2, soon: true },
      { to: '/notifications', label: 'Notifications', icon: Bell, soon: true },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/profile', label: 'My Profile', icon: User, soon: true },
      { to: '/settings', label: 'Settings', icon: Settings, soon: true },
    ],
  },
]
