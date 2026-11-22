import { useSyncExternalStore } from 'react'
import type { CartItem } from '../types'
import { cartKey, MAX_QTY } from '../lib/orders'

/** Un panier par interface : le panier du site (persisté) ne se mélange pas à celui de la borne ou de la caisse. */
export type CartScope = 'site' | 'borne' | 'caisse'
const SITE_KEY = 'bk-coffee:cart:site'

function loadSite(): CartItem[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(SITE_KEY) ?? '[]')
    if (!Array.isArray(v)) return []
    return v.filter((i): i is CartItem => !!i && typeof i.productId === 'string' && Number.isInteger(i.quantity) && i.quantity > 0 && Array.isArray(i.optionIds))
  } catch { return [] }
}

const carts: Record<CartScope, CartItem[]> = { site: loadSite(), borne: [], caisse: [] }
const listeners: Record<CartScope, Set<() => void>> = { site: new Set(), borne: new Set(), caisse: new Set() }

function set(scope: CartScope, items: CartItem[]) {
  carts[scope] = items
  if (scope === 'site') { try { localStorage.setItem(SITE_KEY, JSON.stringify(items)) } catch { /* ignoré */ } }
  listeners[scope].forEach((l) => l())
}

export function cartAdd(scope: CartScope, item: CartItem) {
  const items = carts[scope]
  const k = cartKey(item)
  const found = items.find((i) => cartKey(i) === k)
  set(scope, found
    ? items.map((i) => (cartKey(i) === k ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + item.quantity) } : i))
    : [...items, { ...item, quantity: Math.min(MAX_QTY, item.quantity) }])
}
export function cartSetQty(scope: CartScope, key: string, quantity: number) {
  set(scope, quantity < 1 ? carts[scope].filter((i) => cartKey(i) !== key) : carts[scope].map((i) => (cartKey(i) === key ? { ...i, quantity: Math.min(MAX_QTY, quantity) } : i)))
}
export const cartRemove = (scope: CartScope, key: string) => set(scope, carts[scope].filter((i) => cartKey(i) !== key))
export const cartClear = (scope: CartScope) => set(scope, [])

export function useCart(scope: CartScope) {
  return useSyncExternalStore(
    (l) => { listeners[scope].add(l); return () => { listeners[scope].delete(l) } },
    () => carts[scope],
  )
}
