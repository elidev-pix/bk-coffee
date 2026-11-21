export type OrderSource = 'site' | 'borne' | 'caisse'
export type ServiceMode = 'sur_place' | 'a_emporter'
export type OrderStatus = 'nouvelle' | 'en_preparation' | 'prete' | 'remise' | 'annulee'
export type PaymentStatus = 'en_attente' | 'paye' | 'echoue' | 'annule'
export type PaymentMethod = 'especes' | 'mobile_money'
export type Role = 'administrateur' | 'responsable' | 'caissier'

export interface Category { id: string; label: string; order: number }
export interface ProductOption { id: string; label: string; extraPrice: number }
export interface Product {
  id: string
  name: string
  description: string
  categoryId: string
  /** Prix en FCFA, entier. */
  price: number
  available: boolean
  image?: string
  options?: ProductOption[]
}

/** Ligne figée à l'achat : un changement de prix ultérieur n'affecte pas les anciennes commandes. */
export interface OrderLine {
  productId: string
  name: string
  unitPrice: number
  quantity: number
  optionLabels: string[]
  optionsExtra: number
}

export interface HistoryEntry { at: string; label: string; by?: string }

export interface Order {
  id: string
  number: number
  createdAt: string
  source: OrderSource
  serviceMode: ServiceMode
  lines: OrderLine[]
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  cashReceived?: number
  employeeId?: string
  customerName?: string
  customerPhone?: string
  readyAt?: string
  history: HistoryEntry[]
}

export interface Employee { id: string; name: string; role: Role; active: boolean }
/** dayOfWeek : 1 = lundi … 7 = dimanche. Heures au format HH:mm. */
export interface Shift { id: string; employeeId: string; dayOfWeek: number; start: string; end: string }
export interface ActivityEntry { id: string; at: string; message: string; employeeId?: string; orderId?: string }
export interface Establishment { name: string; address: string; phone: string; hours: string }

export interface AppState {
  version: number
  products: Product[]
  categories: Category[]
  employees: Employee[]
  shifts: Shift[]
  orders: Order[]
  activity: ActivityEntry[]
  establishment: Establishment
  nextOrderNumber: number
}

export interface CartItem { productId: string; quantity: number; optionIds: string[] }
export type Result<T> = { ok: true; value: T } | { ok: false; error: string }
