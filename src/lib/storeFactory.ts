import { useSyncExternalStore } from 'react'

export interface Store<T> {
  get: () => T
  set: (next: T) => void
  update: (fn: (prev: T) => T) => void
  subscribe: (l: () => void) => () => void
  use: () => T
}

/**
 * Tiny localStorage-backed store with a React hook.
 * `key` = the localStorage key, `initial` = seed value.
 */
export function createStore<T>(key: string, initial: T): Store<T> {
  function read(): T {
    try {
      const raw = localStorage.getItem(key)
      if (raw != null) return JSON.parse(raw) as T
    } catch {
      /* corrupt / unavailable storage */
    }
    return initial
  }

  let state: T = read()
  const listeners = new Set<() => void>()

  const write = () => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      /* quota / private mode */
    }
    for (const l of listeners) l()
  }

  const store: Store<T> = {
    get: () => state,
    set(next) {
      state = next
      write()
    },
    update(fn) {
      state = fn(state)
      write()
    },
    subscribe(l) {
      listeners.add(l)
      return () => {
        listeners.delete(l)
      }
    },
    use() {
      return useSyncExternalStore(store.subscribe, store.get, store.get)
    },
  }

  return store
}

export const uid = (p = '') => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase()
