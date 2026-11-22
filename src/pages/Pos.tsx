import { useMemo, useState } from 'react'
import { Banknote, Plus, Search, Smartphone } from 'lucide-react'
import type { Order, OrderStatus, PaymentMethod, Product, ServiceMode } from '../types'
import { useCatalog } from '../hooks'
import { cartAdd, cartClear, useCart } from '../state/cart'
import { dispatch, getState, useAppState } from '../state/store'
import { createOrder, recordPayment, transitionOrder } from '../state/actions'
import { isActive, lineTotal, ORDER_TRANSITIONS, priceCart } from '../lib/orders'
import { formatDateTime, formatFCFA, formatOrderNumber, formatTime } from '../lib/format'
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL, ROLE_LABEL, SERVICE_MODE_LABEL, SOURCE_LABEL } from '../lib/labels'
import { cx } from '../lib/cx'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { OrderStatusBadge, PaymentStatusBadge } from '../components/ui/Badges'
import CartLines from '../components/CartLines'
import CategoryTabs from '../components/CategoryTabs'
import PaymentSim from '../components/PaymentSim'
import ProductCard from '../components/ProductCard'
import ProductDialog from '../components/ProductDialog'

type Filter = 'actives' | 'toutes' | OrderStatus
const FILTERS: [Filter, string][] = [['actives', 'En cours'], ['nouvelle', 'Nouvelles'], ['en_preparation', 'En préparation'], ['prete', 'Prêtes'], ['remise', 'Remises'], ['annulee', 'Annulées'], ['toutes', 'Toutes']]
const NEXT_LABEL: Partial<Record<OrderStatus, string>> = { en_preparation: 'Lancer la préparation', prete: 'Marquer prête', remise: 'Marquer remise' }
const EMP_KEY = 'bk-coffee:pos-employee'

// ───────────── Détail et encaissement d'une commande ─────────────
function OrderPanel({ order, by }: { order: Order; by: string }) {
  const [method, setMethod] = useState<PaymentMethod>(order.paymentMethod)
  const [received, setReceived] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const payable = order.status !== 'annulee' && (order.paymentStatus === 'en_attente' || order.paymentStatus === 'echoue')
  const amount = received === '' ? 0 : Number(received)
  const valid = Number.isInteger(amount) && amount >= order.total
  const quick = [...new Set([order.total, ...[500, 1000, 5000, 10000].map((s) => Math.ceil(order.total / s) * s)])].slice(0, 4)

  const act = (r: { ok: boolean; error?: string }) => setError(r.ok ? null : (r.error ?? 'Action impossible.'))
  const nextSteps = ORDER_TRANSITIONS[order.status].filter((s) => s !== 'annulee')
  const canCancel = ORDER_TRANSITIONS[order.status].includes('annulee')
  const change = order.cashReceived != null ? order.cashReceived - order.total : null

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-4xl font-bold text-brand">{formatOrderNumber(order.number)}</h2>
          <p className="mt-1 text-sm text-muted">{SERVICE_MODE_LABEL[order.serviceMode]} · {SOURCE_LABEL[order.source]} · {formatDateTime(order.createdAt)}{order.customerName && ` · ${order.customerName}`}</p>
        </div>
        <div className="flex flex-wrap gap-2"><OrderStatusBadge status={order.status} /><PaymentStatusBadge status={order.paymentStatus} /></div>
      </header>

      <div className="rounded-card border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Articles de la commande</caption>
          <thead className="text-muted"><tr><th scope="col" className="p-3">Qté</th><th scope="col" className="p-3">Article</th><th scope="col" className="p-3 text-right">Prix unit.</th><th scope="col" className="p-3 text-right">Total</th></tr></thead>
          <tbody className="divide-y divide-line">{order.lines.map((l, i) => (
            <tr key={i}><td className="p-3 font-display">{l.quantity}</td><td className="p-3">{l.name}{l.optionLabels.length > 0 && <span className="block text-xs text-muted">+ {l.optionLabels.join(', ')}</span>}</td><td className="p-3 text-right text-muted">{formatFCFA(l.unitPrice + l.optionsExtra)}</td><td className="p-3 text-right font-display text-brand">{formatFCFA(lineTotal(l))}</td></tr>
          ))}</tbody>
        </table>
        <p className="flex justify-between border-t border-line p-4"><span>Total à payer</span><span className="font-display text-2xl font-semibold text-brand">{formatFCFA(order.total)}</span></p>
      </div>

      {error && <p role="alert" className="rounded-control border border-danger/40 bg-danger-soft p-3 text-sm text-danger">{error}</p>}

      {payable && (
        <section aria-label="Encaissement" className="rounded-card border border-line bg-surface p-4">
          <h3 className="label-caps text-muted">Mode de paiement</h3>
          <div role="group" aria-label="Mode de paiement" className="mt-2 grid grid-cols-2 gap-3">
            {([['especes', 'Espèces', Banknote], ['mobile_money', 'Mobile Money (simulé)', Smartphone]] as const).map(([v, l, Icon]) => (
              <button key={v} type="button" aria-pressed={method === v} onClick={() => setMethod(v)} className={cx('flex min-h-16 flex-col items-center justify-center gap-1 rounded-control border text-sm font-semibold', method === v ? 'border-brand bg-accent-soft text-brand' : 'border-line text-muted hover:border-brand-strong')}><Icon size={22} aria-hidden />{l}</button>
            ))}
          </div>
          {method === 'especes' ? (
            <div className="mt-4">
              <label htmlFor="received" className="label-caps text-muted">Montant reçu (FCFA)</label>
              <input id="received" inputMode="numeric" value={received} onChange={(e) => setReceived(e.target.value.replace(/\D/g, ''))} className="mt-1 min-h-12 w-full rounded-control border border-line-strong bg-canvas px-3 font-display text-xl text-ink" />
              <div className="mt-2 flex flex-wrap gap-2">{quick.map((q) => <button key={q} type="button" onClick={() => setReceived(String(q))} className="rounded-control border border-line px-3 py-2 text-sm text-muted hover:border-brand hover:text-brand">{q === order.total ? 'Montant exact' : formatFCFA(q)}</button>)}</div>
              <p role="status" className={cx('mt-3 text-sm', received !== '' && !valid ? 'text-danger' : 'text-muted')}>
                {received === '' ? 'Saisissez le montant remis par le client.' : valid ? <>Monnaie à rendre : <strong className="font-display text-lg text-brand">{formatFCFA(amount - order.total)}</strong></> : `Montant insuffisant : il manque ${formatFCFA(order.total - amount)}.`}
              </p>
              <Button size="lg" className="mt-3 w-full" disabled={!valid} onClick={() => act(dispatch(recordPayment(order.id, 'paye', { method: 'especes', cashReceived: amount, by })))}>Encaisser {formatFCFA(order.total)}</Button>
            </div>
          ) : (
            <div className="mt-4"><PaymentSim order={order} by={by} onCancelled={() => dispatch(transitionOrder(order.id, 'annulee', by))} /></div>
          )}
        </section>
      )}

      {order.paymentStatus === 'paye' && (
        <p role="status" className="rounded-card border border-ok/50 bg-ok-soft p-4 text-ok">Encaissement confirmé — {PAYMENT_METHOD_LABEL[order.paymentMethod]}{change != null && change > 0 && <> · monnaie rendue : <strong>{formatFCFA(change)}</strong></>}.</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {nextSteps.map((s) => {
          const blocked = s === 'remise' && order.paymentStatus !== 'paye'
          return <Button key={s} size="lg" disabled={blocked} onClick={() => act(dispatch(transitionOrder(order.id, s, by)))}>{NEXT_LABEL[s] ?? ORDER_STATUS_LABEL[s]}</Button>
        })}
        {order.status === 'prete' && order.paymentStatus !== 'paye' && <p className="text-sm text-muted">Encaissez la commande avant de la remettre.</p>}
        {canCancel && <Button variant="danger" onClick={() => setConfirmCancel(true)}>Annuler la commande</Button>}
      </div>

      <section aria-label="Historique"><h3 className="label-caps text-muted">Historique</h3>
        <ol className="mt-2 space-y-1 text-sm">{order.history.map((h, i) => <li key={i} className="text-muted"><span className="font-display text-ink">{formatTime(h.at)}</span> — {h.label}</li>)}</ol>
      </section>

      <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Annuler cette commande ?">
        <p className="text-muted">Commande {formatOrderNumber(order.number)} : cette action est définitive{order.paymentStatus === 'paye' ? ' (le remboursement n’est pas géré dans cette démonstration)' : ''}.</p>
        <div className="mt-5 flex justify-end gap-3"><Button variant="ghost" onClick={() => setConfirmCancel(false)}>Garder</Button><Button variant="danger" onClick={() => { act(dispatch(transitionOrder(order.id, 'annulee', by))); setConfirmCancel(false) }}>Annuler la commande</Button></div>
      </Modal>
    </div>
  )
}

// ───────────── Nouvelle commande (catalogue + ticket) ─────────────
function NewTicket({ by, onCreated }: { by: string; onCreated: (id: string) => void }) {
  const cat = useCatalog()
  const { products } = useAppState()
  const items = useCart('caisse')
  const cart = priceCart(items, products)
  const [open, setOpen] = useState<Product | null>(null)
  const [mode, setMode] = useState<ServiceMode>('sur_place')
  const [error, setError] = useState<string | null>(null)
  const create = () => {
    const r = dispatch(createOrder({ source: 'caisse', serviceMode: mode, items, paymentMethod: 'especes', employeeId: by }))
    if (!r.ok) { setError(r.error); return }
    cartClear('caisse'); setError(null); onCreated(r.value.id)
  }
  return (
    <div className="grid h-full gap-4 xl:grid-cols-[1fr_22rem]">
      <div className="min-h-0 overflow-y-auto">
        <div className="flex flex-wrap items-center gap-3">
          <CategoryTabs categories={cat.categories} value={cat.categoryId} onChange={cat.setCategoryId} />
          <label className="relative ml-auto block w-56"><span className="sr-only">Rechercher un produit</span><Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" aria-hidden /><input type="search" value={cat.query} onChange={(e) => cat.setQuery(e.target.value)} placeholder="Rechercher…" className="min-h-10 w-full rounded-control border border-line-strong bg-surface pr-3 pl-9" /></label>
        </div>
        {cat.visible.length === 0 ? <p role="status" className="mt-6 text-muted">Aucun résultat.</p>
          : <ul className="mt-4 grid gap-4 pb-4 sm:grid-cols-2 2xl:grid-cols-3">{cat.visible.map((p) => <li key={p.id}><ProductCard product={p} onOpen={setOpen} onAdd={(x) => cartAdd('caisse', { productId: x.id, quantity: 1, optionIds: [] })} /></li>)}</ul>}
      </div>
      <aside aria-label="Ticket en cours" className="flex min-h-0 flex-col rounded-card border border-line bg-surface">
        <h2 className="border-b border-line p-4 font-display text-xl text-brand">Nouvelle commande</h2>
        <div className="min-h-0 flex-1 overflow-y-auto px-4">{items.length === 0 ? <p className="py-8 text-center text-sm text-muted">Ajoutez des produits.</p> : <CartLines scope="caisse" rows={cart.rows} />}</div>
        <div className="space-y-3 border-t border-line p-4">
          <div role="group" aria-label="Mode de consommation" className="grid grid-cols-2 gap-2">{([['sur_place', 'Sur place'], ['a_emporter', 'À emporter']] as const).map(([v, l]) => <button key={v} type="button" aria-pressed={mode === v} onClick={() => setMode(v)} className={cx('min-h-11 rounded-control border text-sm font-semibold', mode === v ? 'border-brand bg-brand text-brand-contrast' : 'border-line text-muted')}>{l}</button>)}</div>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <p className="flex justify-between"><span>Total</span><span className="font-display text-2xl font-semibold text-brand">{formatFCFA(cart.total)}</span></p>
          <Button className="w-full" size="lg" disabled={items.length === 0 || cart.hasUnavailable} onClick={create}>Créer la commande</Button>
          <p className="text-xs text-muted">La commande est créée « en attente de paiement » : encaissez-la ensuite depuis son détail.</p>
        </div>
      </aside>
      <ProductDialog product={open} onClose={() => setOpen(null)} onAdd={(i) => cartAdd('caisse', i)} />
    </div>
  )
}

// ───────────── Page caisse ─────────────
export default function Pos() {
  const { orders, employees } = useAppState()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [filter, setFilter] = useState<Filter>('actives')
  const [search, setSearch] = useState('')
  const staff = employees.filter((e) => e.active)
  const [empId, setEmpId] = useState(() => {
    const saved = (() => { try { return localStorage.getItem(EMP_KEY) } catch { return null } })()
    const all = getState().employees.filter((e) => e.active)
    return all.find((e) => e.id === saved)?.id ?? all.find((e) => e.role === 'caissier')?.id ?? all[0]?.id ?? ''
  })
  const by = staff.some((e) => e.id === empId) ? empId : (staff[0]?.id ?? '')
  const list = useMemo(() => {
    const q = search.replace(/\D/g, '')
    return orders.filter((o) => (filter === 'toutes' ? true : filter === 'actives' ? isActive(o) : o.status === filter) && (!q || String(o.number).includes(q)))
  }, [orders, filter, search])
  const selected = orders.find((o) => o.id === selectedId)
  const pick = (id: string) => { setSelectedId(id); setCreating(false) }

  return (
    <div className="grid h-full gap-4 p-4 lg:grid-cols-[22rem_1fr]">
      <section aria-label="Commandes" className="flex min-h-0 flex-col rounded-card border border-line bg-surface">
        <div className="space-y-3 border-b border-line p-4">
          <label className="block text-sm"><span className="label-caps text-muted">Employé (démo)</span>
            <select value={by} onChange={(e) => { setEmpId(e.target.value); try { localStorage.setItem(EMP_KEY, e.target.value) } catch { /* ignoré */ } }} className="mt-1 min-h-10 w-full rounded-control border border-line-strong bg-canvas px-2">
              {staff.map((e) => <option key={e.id} value={e.id}>{e.name} — {ROLE_LABEL[e.role]}</option>)}
            </select>
          </label>
          <Button className="w-full" onClick={() => { setCreating(true); setSelectedId(null) }}><Plus size={18} aria-hidden /> Nouvelle commande</Button>
          <label className="relative block"><span className="sr-only">Rechercher par numéro</span><Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" aria-hidden /><input inputMode="numeric" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="N° de commande" className="min-h-10 w-full rounded-control border border-line-strong bg-canvas pr-3 pl-9" /></label>
          <div role="group" aria-label="Filtrer par statut" className="flex flex-wrap gap-1.5">{FILTERS.map(([v, l]) => <button key={v} type="button" aria-pressed={filter === v} onClick={() => setFilter(v)} className={cx('rounded-control border px-2.5 py-1 text-xs font-semibold', filter === v ? 'border-brand bg-brand text-brand-contrast' : 'border-line text-muted hover:border-brand-strong')}>{l}</button>)}</div>
        </div>
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {list.length === 0 && <li role="status" className="p-4 text-center text-sm text-muted">Aucune commande.</li>}
          {list.map((o) => (
            <li key={o.id}>
              <button type="button" onClick={() => pick(o.id)} aria-current={o.id === selectedId ? 'true' : undefined} className={cx('w-full rounded-card border p-3 text-left transition-colors', o.id === selectedId ? 'border-brand bg-accent-soft' : 'border-line bg-surface-alt hover:border-brand-strong')}>
                <span className="flex items-baseline justify-between"><span className="font-display text-xl text-ink">{formatOrderNumber(o.number)}</span><span className="font-display text-brand">{formatFCFA(o.total)}</span></span>
                <span className="mt-1 block text-xs text-muted">{SERVICE_MODE_LABEL[o.serviceMode]} · {SOURCE_LABEL[o.source]} · {formatTime(o.createdAt)}</span>
                <span className="mt-2 flex flex-wrap gap-1.5"><OrderStatusBadge status={o.status} /><PaymentStatusBadge status={o.paymentStatus} /></span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section aria-label={creating ? 'Nouvelle commande' : 'Détail de la commande'} className="min-h-0 overflow-y-auto">
        {creating ? <NewTicket by={by} onCreated={pick} />
          : selected ? <div className="rounded-card border border-line bg-surface p-5"><OrderPanel key={selected.id} order={selected} by={by} /></div>
          : <p className="rounded-card border border-line bg-surface p-10 text-center text-muted">Sélectionnez une commande ou créez-en une nouvelle.</p>}
      </section>
    </div>
  )
}
