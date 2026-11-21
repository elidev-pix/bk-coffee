import type { ActivityEntry, AppState, CartItem, Employee, Order, OrderSource, OrderStatus, PaymentMethod, Product, Result, ServiceMode, Shift } from '../types'
import { createSeedState } from '../data/seed'
import { buildLines, isActive, orderTotal, ORDER_TRANSITIONS, PAYMENT_TRANSITIONS } from '../lib/orders'
import { formatOrderNumber } from '../lib/format'
import { ORDER_STATUS_LABEL } from '../lib/labels'

/** Une action est une fonction pure : état → nouvel état + résultat. Remplaçable plus tard par des appels API. */
export type Action<T> = (s: AppState) => { state: AppState; result: Result<T> }

const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
const nowIso = () => new Date().toISOString()
const fail = <T,>(s: AppState, error: string): { state: AppState; result: Result<T> } => ({ state: s, result: { ok: false, error } })

function withLog(s: AppState, message: string, extra: { employeeId?: string; orderId?: string } = {}): AppState {
  const entry: ActivityEntry = { id: uid(), at: nowIso(), message, ...extra }
  return { ...s, activity: [entry, ...s.activity].slice(0, 200) }
}
function replaceOrder(s: AppState, o: Order): AppState { return { ...s, orders: s.orders.map((x) => (x.id === o.id ? o : x)) } }

function allocateNumber(s: AppState): { number: number; next: number } {
  const used = new Set(s.orders.filter(isActive).map((o) => o.number))
  let n = s.nextOrderNumber
  for (let i = 0; i < 999; i++) {
    if (n > 999) n = 1
    if (!used.has(n)) return { number: n, next: n + 1 }
    n++
  }
  return { number: n, next: n + 1 }
}

export interface NewOrderInput {
  source: OrderSource; serviceMode: ServiceMode; items: CartItem[]; paymentMethod: PaymentMethod
  employeeId?: string; customerName?: string; customerPhone?: string
}

export const createOrder = (input: NewOrderInput): Action<Order> => (s) => {
  const built = buildLines(input.items, s.products)
  if (!built.ok) return fail(s, built.error)
  const { number, next } = allocateNumber(s)
  const at = nowIso()
  const order: Order = {
    id: uid(), number, createdAt: at, source: input.source, serviceMode: input.serviceMode, lines: built.value, total: orderTotal(built.value),
    status: 'nouvelle', paymentStatus: 'en_attente', paymentMethod: input.paymentMethod, employeeId: input.employeeId,
    customerName: input.customerName?.trim() || undefined, customerPhone: input.customerPhone?.trim() || undefined,
    history: [{ at, label: 'Commande créée', by: input.employeeId }],
  }
  const state = withLog({ ...s, orders: [order, ...s.orders], nextOrderNumber: next }, `Commande ${formatOrderNumber(number)} créée (${input.source})`, { orderId: order.id, employeeId: input.employeeId })
  return { state, result: { ok: true, value: order } }
}

export const transitionOrder = (id: string, to: OrderStatus, by?: string): Action<Order> => (s) => {
  const o = s.orders.find((x) => x.id === id)
  if (!o) return fail(s, 'Commande introuvable.')
  if (!ORDER_TRANSITIONS[o.status].includes(to)) return fail(s, `Passage impossible : ${ORDER_STATUS_LABEL[o.status]} → ${ORDER_STATUS_LABEL[to]}.`)
  if (to === 'remise' && o.paymentStatus !== 'paye') return fail(s, 'Une commande non payée ne peut pas être remise.')
  const at = nowIso()
  const next: Order = {
    ...o, status: to,
    readyAt: to === 'prete' ? at : o.readyAt,
    paymentStatus: to === 'annulee' && o.paymentStatus !== 'paye' ? 'annule' : o.paymentStatus,
    history: [...o.history, { at, label: ORDER_STATUS_LABEL[to], by }],
  }
  return { state: withLog(replaceOrder(s, next), `Commande ${formatOrderNumber(o.number)} : ${ORDER_STATUS_LABEL[to].toLowerCase()}`, { orderId: o.id, employeeId: by }), result: { ok: true, value: next } }
}

export const recordPayment = (id: string, outcome: 'paye' | 'echoue' | 'annule', opts: { method?: PaymentMethod; cashReceived?: number; by?: string } = {}): Action<Order> => (s) => {
  const o = s.orders.find((x) => x.id === id)
  if (!o) return fail(s, 'Commande introuvable.')
  if (o.status === 'annulee') return fail(s, 'Cette commande est annulée.')
  if (!PAYMENT_TRANSITIONS[o.paymentStatus].includes(outcome)) return fail(s, o.paymentStatus === 'paye' ? 'Cette commande est déjà payée.' : 'Changement de paiement impossible.')
  const method = opts.method ?? o.paymentMethod
  if (outcome === 'paye' && method === 'especes' && (!Number.isInteger(opts.cashReceived) || (opts.cashReceived as number) < o.total)) return fail(s, 'Montant reçu insuffisant.')
  const at = nowIso()
  const labels = { paye: 'Paiement confirmé', echoue: 'Paiement échoué', annule: 'Paiement annulé' }
  const next: Order = {
    ...o, paymentStatus: outcome, paymentMethod: method,
    cashReceived: outcome === 'paye' && method === 'especes' ? opts.cashReceived : o.cashReceived,
    history: [...o.history, { at, label: `${labels[outcome]}${method === 'mobile_money' ? ' (simulé)' : ''}`, by: opts.by }],
  }
  return { state: withLog(replaceOrder(s, next), `Commande ${formatOrderNumber(o.number)} : ${labels[outcome].toLowerCase()}`, { orderId: o.id, employeeId: opts.by }), result: { ok: true, value: next } }
}

export type ProductInput = Omit<Product, 'id'> & { id?: string }
export const upsertProduct = (input: ProductInput): Action<Product> => (s) => {
  const name = input.name.trim()
  if (!name) return fail(s, 'Le nom est obligatoire.')
  if (!Number.isInteger(input.price) || input.price < 0) return fail(s, 'Le prix doit être un entier positif (FCFA).')
  if (!s.categories.some((c) => c.id === input.categoryId)) return fail(s, 'Catégorie invalide.')
  const product: Product = { ...input, name, description: input.description.trim(), id: input.id ?? `p-${uid().slice(0, 8)}` }
  const exists = s.products.some((p) => p.id === product.id)
  const products = exists ? s.products.map((p) => (p.id === product.id ? product : p)) : [...s.products, product]
  return { state: withLog({ ...s, products }, `Produit « ${name} » ${exists ? 'modifié' : 'créé'}`), result: { ok: true, value: product } }
}
export const setProductAvailability = (id: string, available: boolean): Action<Product> => (s) => {
  const p = s.products.find((x) => x.id === id)
  if (!p) return fail(s, 'Produit introuvable.')
  const next = { ...p, available }
  return { state: withLog({ ...s, products: s.products.map((x) => (x.id === id ? next : x)) }, `Produit « ${p.name} » ${available ? 'activé' : 'désactivé'}`), result: { ok: true, value: next } }
}

export const upsertEmployee = (input: Omit<Employee, 'id'> & { id?: string }): Action<Employee> => (s) => {
  const name = input.name.trim()
  if (!name) return fail(s, 'Le nom est obligatoire.')
  const emp: Employee = { ...input, name, id: input.id ?? `emp-${uid().slice(0, 8)}` }
  const exists = s.employees.some((e) => e.id === emp.id)
  const employees = exists ? s.employees.map((e) => (e.id === emp.id ? emp : e)) : [...s.employees, emp]
  return { state: withLog({ ...s, employees }, `Employé « ${name} » ${exists ? 'modifié' : 'ajouté'}`), result: { ok: true, value: emp } }
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/
export const upsertShift = (input: Omit<Shift, 'id'> & { id?: string }): Action<Shift> => (s) => {
  if (!TIME.test(input.start) || !TIME.test(input.end)) return fail(s, 'Heures invalides (HH:mm).')
  if (input.start >= input.end) return fail(s, 'L’heure de fin doit suivre l’heure de début.')
  if (!s.employees.some((e) => e.id === input.employeeId)) return fail(s, 'Employé introuvable.')
  const shift: Shift = { ...input, id: input.id ?? `sh-${uid().slice(0, 8)}` }
  const exists = s.shifts.some((x) => x.id === shift.id)
  const shifts = exists ? s.shifts.map((x) => (x.id === shift.id ? shift : x)) : [...s.shifts, shift]
  return { state: { ...s, shifts }, result: { ok: true, value: shift } }
}
export const removeShift = (id: string): Action<true> => (s) => ({ state: { ...s, shifts: s.shifts.filter((x) => x.id !== id) }, result: { ok: true, value: true } })

export const updateEstablishment = (e: AppState['establishment']): Action<true> => (s) =>
  e.name.trim() ? { state: { ...s, establishment: { ...e, name: e.name.trim() } }, result: { ok: true, value: true } } : fail(s, 'Le nom est obligatoire.')

export const resetAll = (): Action<true> => () => ({ state: createSeedState(), result: { ok: true, value: true } })
