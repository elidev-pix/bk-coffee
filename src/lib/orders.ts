import type { CartItem, Order, OrderLine, OrderStatus, PaymentStatus, Product, Result } from '../types'

/** Transitions de statut de commande autorisées. */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  nouvelle: ['en_preparation', 'annulee'],
  en_preparation: ['prete', 'annulee'],
  prete: ['remise', 'annulee'],
  remise: [],
  annulee: [],
}
/** Transitions de statut de paiement autorisées (un paiement « payé » est final : pas de double paiement). */
export const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  en_attente: ['paye', 'echoue', 'annule'],
  echoue: ['paye', 'echoue', 'annule'],
  paye: [],
  annule: [],
}

export const MAX_QTY = 99
export const lineTotal = (l: OrderLine) => (l.unitPrice + l.optionsExtra) * l.quantity
export const orderTotal = (lines: OrderLine[]) => lines.reduce((s, l) => s + lineTotal(l), 0)
export const isActive = (o: Order) => o.status !== 'remise' && o.status !== 'annulee'

/** Construit des lignes figées à partir d'un panier ; refuse produits indisponibles, quantités ou options invalides. */
export function buildLines(items: CartItem[], products: Product[]): Result<OrderLine[]> {
  if (items.length === 0) return { ok: false, error: 'Le panier est vide.' }
  const lines: OrderLine[] = []
  for (const it of items) {
    const p = products.find((x) => x.id === it.productId)
    if (!p) return { ok: false, error: 'Produit introuvable.' }
    if (!p.available) return { ok: false, error: `« ${p.name} » n'est plus disponible.` }
    if (!Number.isInteger(it.quantity) || it.quantity < 1 || it.quantity > MAX_QTY) return { ok: false, error: `Quantité invalide pour « ${p.name} ».` }
    const opts = []
    for (const id of it.optionIds) {
      const o = p.options?.find((x) => x.id === id)
      if (!o) return { ok: false, error: `Option invalide pour « ${p.name} ».` }
      opts.push(o)
    }
    lines.push({
      productId: p.id, name: p.name, unitPrice: p.price, quantity: it.quantity,
      optionLabels: opts.map((o) => o.label), optionsExtra: opts.reduce((s, o) => s + o.extraPrice, 0),
    })
  }
  return { ok: true, value: lines }
}

export interface PricedRow { key: string; item: CartItem; product?: Product; optionLabels: string[]; unit: number; total: number; unavailable: boolean }
/** Prix courants du catalogue (le prix est figé seulement à la création de la commande). */
export function priceCart(items: CartItem[], products: Product[]) {
  const rows: PricedRow[] = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)
    const opts = (product?.options ?? []).filter((o) => item.optionIds.includes(o.id))
    const unit = (product?.price ?? 0) + opts.reduce((s, o) => s + o.extraPrice, 0)
    return { key: cartKey(item), item, product, optionLabels: opts.map((o) => o.label), unit, total: unit * item.quantity, unavailable: !product || !product.available }
  })
  return { rows, total: rows.filter((r) => !r.unavailable).reduce((s, r) => s + r.total, 0), count: items.reduce((s, i) => s + i.quantity, 0), hasUnavailable: rows.some((r) => r.unavailable) }
}
export const cartKey = (i: CartItem) => `${i.productId}|${[...i.optionIds].sort().join(',')}`
