import type { Order } from '../types'
import { orderTotal } from './orders'

/** Règle de démonstration : revenu = commandes au paiement confirmé et non annulées. */
export const isRevenueOrder = (o: Order) => o.paymentStatus === 'paye' && o.status !== 'annulee'

export function computeStats(orders: Order[], since?: Date) {
  const inScope = orders.filter((o) => !since || new Date(o.createdAt) >= since)
  const paid = inScope.filter(isRevenueOrder)
  const revenue = paid.reduce((s, o) => s + o.total, 0)
  const byMethod = { especes: 0, mobile_money: 0 }
  const products = new Map<string, { name: string; quantity: number }>()
  for (const o of paid) {
    byMethod[o.paymentMethod] += o.total
    for (const l of o.lines) {
      const cur = products.get(l.productId) ?? { name: l.name, quantity: 0 }
      cur.quantity += l.quantity
      products.set(l.productId, cur)
    }
  }
  return {
    revenue,
    paidCount: paid.length,
    orderCount: inScope.filter((o) => o.status !== 'annulee').length,
    averageBasket: paid.length ? Math.round(revenue / paid.length) : 0,
    inProgress: inScope.filter((o) => o.status === 'nouvelle' || o.status === 'en_preparation').length,
    byMethod,
    topProducts: [...products.entries()].map(([id, v]) => ({ id, ...v })).sort((a, b) => b.quantity - a.quantity).slice(0, 5),
  }
}

/** Chiffre d'affaires par jour sur les `days` derniers jours (jours sans vente inclus). */
export function salesByDay(orders: Order[], days = 7, now = new Date()) {
  const out: { day: string; revenue: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i)
    const next = new Date(d); next.setDate(d.getDate() + 1)
    const revenue = orders.filter((o) => isRevenueOrder(o) && new Date(o.createdAt) >= d && new Date(o.createdAt) < next)
      .reduce((s, o) => s + orderTotal(o.lines), 0)
    out.push({ day: d.toISOString().slice(0, 10), revenue })
  }
  return out
}
