import { createStore, uid } from './storeFactory'

export interface Notice {
  id: string
  title: string
  body: string
  at: string
  pinned: boolean
  author: string
}

export const notices = createStore<Notice[]>('mkr_notices_v2', [
  {
    id: 'N-SEED-1',
    title: 'Welcome to Masjid Khidmat Records',
    body: 'Household survey ka poora record yahan rakha jayega. Har ghar ka data add karo, dashboard khud hisaab dikhayega.',
    at: new Date().toISOString(),
    pinned: true,
    author: 'System',
  },
])

export function addNotice(title: string, body: string, author: string) {
  const n: Notice = { id: uid('N'), title: title.trim(), body: body.trim(), at: new Date().toISOString(), pinned: false, author }
  notices.update((list) => [n, ...list])
}

export function togglePin(id: string) {
  notices.update((list) => list.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)))
}

export function removeNotice(id: string) {
  notices.update((list) => list.filter((n) => n.id !== id))
}
