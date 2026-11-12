import { createStore } from './storeFactory'

export type Lang = 'en' | 'hi' | 'ta' | 'ur'

export interface MasjidSettings {
  name: string
  tagline: string
  address: string
  phone: string
  email: string
  regNo: string
  incharge: string
  ownerName: string
  ownerEmail: string
  idPrefix: string
  idStart: number
  theme: 'light' | 'dark'
  lang: Lang
  autoFix: boolean
  logo: string
  photos: string[]
}

export const DEFAULT_SETTINGS: MasjidSettings = {
  name: 'Masjid Khidmat Committee',
  tagline: 'Community Records',
  address: 'Mohalla East, Tamil Nadu',
  phone: '',
  email: '',
  regNo: '',
  incharge: '',
  ownerName: 'Isthiyaque Basha',
  ownerEmail: 'smartbooksbasha@gmail.com',
  idPrefix: 'MK',
  idStart: 1,
  theme: 'light',
  lang: 'en',
  autoFix: true,
  logo: '',
  photos: [],
}

export const settings = createStore<MasjidSettings>('mkr_settings_v2', DEFAULT_SETTINGS)

export function applyTheme(theme: MasjidSettings['theme']) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

export function applyDir(lang: Lang) {
  document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr'
  document.documentElement.lang = lang
}
