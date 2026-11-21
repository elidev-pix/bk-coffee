import { useSyncExternalStore } from 'react'
import type { AppState } from '../types'
import { createSeedState, SCHEMA_VERSION } from '../data/seed'
import type { Action } from './actions'

// Persistance locale (démonstration) : même navigateur, même origine. Pas de synchronisation entre appareils.
const KEY = 'bk-coffee:state'

function isValid(v: unknown): v is AppState {
  const s = v as Partial<AppState> | null
  return !!s && s.version === SCHEMA_VERSION && Array.isArray(s.products) && Array.isArray(s.categories) && Array.isArray(s.employees)
    && Array.isArray(s.shifts) && Array.isArray(s.orders) && Array.isArray(s.activity) && typeof s.nextOrderNumber === 'number' && !!s.establishment
}
function parse(raw: string | null): AppState | null {
  if (!raw) return null
  try { const v: unknown = JSON.parse(raw); return isValid(v) ? v : null } catch { return null }
}
function read(): string | null { try { return localStorage.getItem(KEY) } catch { return null } }

let state: AppState = parse(read()) ?? createSeedState()
const listeners = new Set<() => void>()

function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* stockage indisponible : l'état reste en mémoire */ } }
// Mise à jour provenant d'un autre onglet (même navigateur) : on recharge sans réécrire.
function onStorage(e: StorageEvent) {
  if (e.key !== KEY && e.key !== null) return
  state = parse(e.newValue) ?? createSeedState()
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  if (listeners.size === 0) window.addEventListener('storage', onStorage)
  listeners.add(l)
  return () => {
    listeners.delete(l)
    if (listeners.size === 0) window.removeEventListener('storage', onStorage)
  }
}

export function dispatch<T>(action: Action<T>) {
  const { state: next, result } = action(state)
  if (next !== state) { state = next; persist(); listeners.forEach((l) => l()) }
  return result
}
export const getState = () => state
export const useAppState = () => useSyncExternalStore(subscribe, getState)
