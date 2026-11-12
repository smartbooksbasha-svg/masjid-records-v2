/* PWA glue — service worker registration, install prompt capture and a
   force-update escape hatch (unregister + clear caches + cache-busted reload). */
import { useEffect, useState } from 'react'

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  if (!import.meta.env.PROD) return
  window.addEventListener('load', () => {
    const url = `${import.meta.env.BASE_URL}sw.js`
    navigator.serviceWorker.register(url).catch(() => {
      /* offline support is optional — never block the app on it */
    })
  })
}

/** True once the browser fires `beforeinstallprompt` (Android/desktop Chrome). */
export function useInstallPrompt() {
  const [event, setEvent] = useState<any>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setEvent(e)
    }
    const onInstalled = () => {
      setEvent(null)
      setInstalled(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    if (window.matchMedia?.('(display-mode: standalone)').matches) setInstalled(true)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async () => {
    if (!event) return false
    event.prompt()
    const choice = await event.userChoice.catch(() => null)
    setEvent(null)
    return choice?.outcome === 'accepted'
  }

  return { canInstall: !!event, installed, install }
}

/** Drop the service worker + every cache, then reload with a fresh query. */
export async function forceUpdate() {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((r) => r.unregister()))
    }
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    }
  } catch {
    /* best effort */
  }
  const url = new URL(window.location.href)
  url.searchParams.set('v', String(Date.now()))
  window.location.replace(url.toString())
}

/** Reload when a freshly-deployed service worker takes control. */
export function watchForUpdates() {
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (sessionStorage.getItem('mkr_reloaded')) return
    sessionStorage.setItem('mkr_reloaded', '1')
    window.location.reload()
  })
}
