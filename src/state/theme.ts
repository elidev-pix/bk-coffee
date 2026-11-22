import { useSyncExternalStore } from 'react'

/** Préférence de thème : clair, sombre, ou suivre le système. Appliquée via data-theme sur <html>. */
export type ThemePref = 'system' | 'light' | 'dark'
const KEY = 'bk-coffee:theme'
const mq = window.matchMedia('(prefers-color-scheme: dark)')

function readPref(): ThemePref {
  try { const v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : 'system' } catch { return 'system' }
}
const resolve = (p: ThemePref) => (p === 'system' ? (mq.matches ? 'dark' : 'light') : p)

let pref = readPref()
const listeners = new Set<() => void>()

function apply() {
  const r = resolve(pref)
  document.documentElement.dataset.theme = r
  document.documentElement.style.colorScheme = r
}
const emit = () => { apply(); listeners.forEach((l) => l()) }

// Écouteurs valables toute la durée de l'application (un seul de chaque) : suivi du système et des autres onglets.
mq.addEventListener('change', () => { if (pref === 'system') emit() })
window.addEventListener('storage', (e) => { if (e.key === KEY || e.key === null) { pref = readPref(); emit() } })
apply()

export function setTheme(p: ThemePref) {
  pref = p
  try { localStorage.setItem(KEY, p) } catch { /* ignoré */ }
  emit()
}

export function useTheme() {
  const snap = useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l) } }, () => `${pref}:${resolve(pref)}`)
  const [p, r] = snap.split(':') as [ThemePref, 'light' | 'dark']
  return { pref: p, resolved: r }
}
