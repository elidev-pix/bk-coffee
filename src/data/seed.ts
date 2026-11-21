import type { ActivityEntry, AppState, Category, Employee, Order, Product, Shift } from '../types'
import { buildLines, orderTotal } from '../lib/orders'

export const SCHEMA_VERSION = 1

// DONNÉES DE DÉMONSTRATION — noms, prix et horaires fictifs.
const categories: Category[] = [
  { id: 'cafes', label: 'Cafés', order: 1 },
  { id: 'boissons-fraiches', label: 'Boissons fraîches', order: 2 },
  { id: 'patisseries', label: 'Pâtisseries', order: 3 },
  { id: 'snacks', label: 'Snacks', order: 4 },
]

const size = [{ id: 'grand', label: 'Grand format', extraPrice: 300 }]
const products: Product[] = [
  { id: 'espresso', name: 'Espresso', description: 'Café court, intense et serré.', categoryId: 'cafes', price: 800, available: true },
  { id: 'allonge', name: 'Café allongé', description: 'Espresso allongé à l’eau chaude.', categoryId: 'cafes', price: 900, available: true },
  { id: 'cappuccino', name: 'Cappuccino', description: 'Espresso, lait chaud et mousse onctueuse.', categoryId: 'cafes', price: 1500, available: true, options: size },
  { id: 'latte', name: 'Café latte', description: 'Espresso doux avec beaucoup de lait.', categoryId: 'cafes', price: 1600, available: true, options: size },
  { id: 'cafe-glace', name: 'Café glacé', description: 'Café froid sur glace.', categoryId: 'boissons-fraiches', price: 1700, available: true, options: size },
  { id: 'jus-bissap', name: 'Jus de bissap', description: 'Infusion d’hibiscus servie fraîche.', categoryId: 'boissons-fraiches', price: 1000, available: true },
  { id: 'jus-gingembre', name: 'Jus de gingembre', description: 'Gingembre pressé, relevé.', categoryId: 'boissons-fraiches', price: 1000, available: true },
  { id: 'eau', name: 'Eau minérale', description: 'Bouteille 50 cl.', categoryId: 'boissons-fraiches', price: 500, available: true },
  { id: 'croissant', name: 'Croissant', description: 'Pur beurre, doré au four.', categoryId: 'patisseries', price: 700, available: true },
  { id: 'muffin', name: 'Muffin chocolat', description: 'Moelleux, cœur fondant.', categoryId: 'patisseries', price: 1200, available: true },
  { id: 'cake', name: 'Cake marbré', description: 'Part de cake maison.', categoryId: 'patisseries', price: 1000, available: false },
  { id: 'sandwich', name: 'Sandwich poulet', description: 'Poulet, crudités et sauce douce.', categoryId: 'snacks', price: 2500, available: true },
  { id: 'samoussa', name: 'Samoussas (x3)', description: 'Trois samoussas croustillants.', categoryId: 'snacks', price: 1500, available: true },
]

const employees: Employee[] = [
  { id: 'emp-1', name: 'Awa Ouédraogo (démo)', role: 'administrateur', active: true },
  { id: 'emp-2', name: 'Issa Kaboré (démo)', role: 'responsable', active: true },
  { id: 'emp-3', name: 'Mariam Zongo (démo)', role: 'caissier', active: true },
  { id: 'emp-4', name: 'Boureima Sawadogo (démo)', role: 'caissier', active: false },
]

const shifts: Shift[] = [1, 2, 3, 4, 5].flatMap((d) => [
  { id: `sh-2-${d}`, employeeId: 'emp-2', dayOfWeek: d, start: '07:00', end: '15:00' },
  { id: `sh-3-${d}`, employeeId: 'emp-3', dayOfWeek: d, start: '10:00', end: '18:00' },
])

function seedOrders(now: Date): { orders: Order[]; activity: ActivityEntry[] } {
  const plan: [number, number, string[], 'site' | 'borne' | 'caisse', 'especes' | 'mobile_money'][] = [
    // [jours en arrière, heure, produits, source, paiement]
    [5, 9, ['cappuccino', 'croissant'], 'caisse', 'especes'],
    [4, 11, ['sandwich', 'jus-bissap'], 'borne', 'mobile_money'],
    [3, 8, ['espresso', 'muffin', 'espresso'], 'caisse', 'especes'],
    [2, 15, ['latte', 'samoussa'], 'site', 'mobile_money'],
    [1, 10, ['cafe-glace', 'croissant', 'eau'], 'borne', 'especes'],
    [1, 16, ['cappuccino', 'cappuccino', 'muffin'], 'caisse', 'mobile_money'],
    [0, 8, ['allonge', 'croissant'], 'caisse', 'especes'],
  ]
  const orders: Order[] = []
  const activity: ActivityEntry[] = []
  plan.forEach(([back, hour, ids, source, method], i) => {
    const d = new Date(now); d.setDate(d.getDate() - back); d.setHours(hour, 0, 0, 0)
    if (d > now) d.setTime(now.getTime() - 60_000 * (i + 5))
    const counts = new Map<string, number>()
    ids.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1))
    const built = buildLines([...counts].map(([productId, quantity]) => ({ productId, quantity, optionIds: [] })), products)
    if (!built.ok) return
    const at = d.toISOString()
    const total = orderTotal(built.value)
    orders.push({
      id: `seed-ord-${i + 1}`, number: i + 1, createdAt: at, source, serviceMode: 'sur_place', lines: built.value, total,
      status: 'remise', paymentStatus: 'paye', paymentMethod: method, cashReceived: method === 'especes' ? Math.ceil(total / 500) * 500 : undefined,
      employeeId: source === 'caisse' ? 'emp-3' : undefined, readyAt: at,
      history: [{ at, label: 'Commande créée (démo)' }, { at, label: 'Paiement confirmé' }, { at, label: 'Remise au client' }],
    })
    activity.push({ id: `seed-act-${i + 1}`, at, message: `Commande #${String(i + 1).padStart(3, '0')} encaissée et remise (démo)`, orderId: `seed-ord-${i + 1}`, employeeId: source === 'caisse' ? 'emp-3' : undefined })
  })
  return { orders, activity: activity.reverse() }
}

export function createSeedState(now = new Date()): AppState {
  const { orders, activity } = seedOrders(now)
  return {
    version: SCHEMA_VERSION, products, categories, employees, shifts, orders, activity,
    // Informations non communiquées : à renseigner depuis Paramètres.
    establishment: { name: 'BK Coffee Shop', address: '', phone: '', hours: '' },
    nextOrderNumber: orders.length + 1,
  }
}
