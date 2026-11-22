import { useEffect, useState } from 'react'
import { ArrowRight, CircleCheck, Smartphone, Banknote } from 'lucide-react'
import type { PaymentMethod, Product, ServiceMode } from '../types'
import { useCatalog } from '../hooks'
import { cartAdd, cartClear, useCart } from '../state/cart'
import { dispatch, useAppState } from '../state/store'
import { createOrder, transitionOrder } from '../state/actions'
import { priceCart } from '../lib/orders'
import { formatFCFA, formatOrderNumber } from '../lib/format'
import { cx } from '../lib/cx'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import CartLines from '../components/CartLines'
import CategoryTabs from '../components/CategoryTabs'
import PaymentSim from '../components/PaymentSim'
import ProductCard from '../components/ProductCard'
import ProductDialog from '../components/ProductDialog'

const AUTO_RESET_SECONDS = 30

/** Compte à rebours visible avant retour à l'accueil de la borne ; le bouton permet de repartir tout de suite. */
function Countdown({ onDone }: { onDone: () => void }) {
  const [left, setLeft] = useState(AUTO_RESET_SECONDS)
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => { if (left <= 0) onDone() }, [left, onDone])
  return <p className="mt-3 text-sm text-muted" aria-live="off">Nouvelle commande automatiquement dans {Math.max(left, 0)} s.</p>
}

export default function Kiosk() {
  const cat = useCatalog()
  const { products, orders } = useAppState()
  const items = useCart('borne')
  const cart = priceCart(items, products)
  const [open, setOpen] = useState<Product | null>(null)
  const [mode, setMode] = useState<ServiceMode>('sur_place')
  const [choosing, setChoosing] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const order = orders.find((o) => o.id === orderId)

  const reset = () => { cartClear('borne'); setOrderId(null); setChoosing(false); setError(null); setMode('sur_place') }
  const place = (method: PaymentMethod) => {
    if (orderId) return // évite une double création
    const r = dispatch(createOrder({ source: 'borne', serviceMode: mode, items, paymentMethod: method }))
    if (!r.ok) { setError(r.error); setChoosing(false); return }
    setOrderId(r.value.id); setChoosing(false); setError(null)
  }

  const phase = !order ? (choosing ? 'choose' : 'browse')
    : order.status === 'annulee' ? 'cancelled'
    : order.paymentMethod === 'mobile_money' && order.paymentStatus !== 'paye' ? 'pay' : 'done'

  return (
    <div className="grid h-full lg:grid-cols-[1fr_26rem]">
      <div className="overflow-y-auto p-8">
        <h1 className="font-display text-4xl font-bold">Bienvenue chez BK Coffee Shop</h1>
        <p className="mt-1 text-lg text-muted">Une expérience sensorielle unique.</p>
        <div className="mt-6"><CategoryTabs big categories={cat.categories} value={cat.categoryId} onChange={cat.setCategoryId} /></div>
        {cat.visible.length === 0
          ? <p role="status" className="mt-8 text-muted">Aucun produit dans cette catégorie.</p>
          : <ul className="mt-6 grid gap-6 pb-8 sm:grid-cols-2 xl:grid-cols-3">{cat.visible.map((p) => (
              <li key={p.id}><ProductCard kiosk product={p} onOpen={setOpen} onAdd={(x) => cartAdd('borne', { productId: x.id, quantity: 1, optionIds: [] })} /></li>
            ))}</ul>}
      </div>

      <aside aria-label="Ma commande" className="flex min-h-0 flex-col border-l border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line p-5">
          <h2 className="font-display text-2xl text-brand">Ma commande</h2>
          <span className="label-caps rounded-control bg-accent-soft px-2 py-1 text-brand">{cart.count} article{cart.count > 1 ? 's' : ''}</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5">
          {items.length === 0 ? <p className="py-10 text-center text-muted">Touchez « Ajouter » pour composer votre commande.</p> : <CartLines big scope="borne" rows={cart.rows} />}
        </div>
        <div className="space-y-4 border-t border-line p-5">
          <div role="group" aria-label="Mode de consommation" className="grid grid-cols-2 gap-2">
            {([['sur_place', 'Sur place'], ['a_emporter', 'À emporter']] as const).map(([v, l]) => (
              <button key={v} type="button" aria-pressed={mode === v} onClick={() => setMode(v)} className={cx('min-h-14 rounded-control border font-semibold', mode === v ? 'border-brand bg-brand text-brand-contrast' : 'border-line text-muted hover:border-brand-strong')}>{l}</button>
            ))}
          </div>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <p className="flex items-end justify-between"><span className="text-lg">Total</span><span className="font-display text-3xl font-semibold text-brand">{formatFCFA(cart.total)}</span></p>
          <Button size="lg" className="w-full" disabled={items.length === 0 || cart.hasUnavailable} onClick={() => setChoosing(true)}>Valider la commande <ArrowRight size={20} aria-hidden /></Button>
        </div>
      </aside>

      <ProductDialog big product={open} onClose={() => setOpen(null)} onAdd={(i) => cartAdd('borne', i)} />

      <Modal open={phase === 'choose'} onClose={() => setChoosing(false)} title="Comment souhaitez-vous payer ?">
        <p className="mb-4 text-muted">Total : <strong className="font-display text-xl text-brand">{formatFCFA(cart.total)}</strong></p>
        <div className="grid gap-3">
          <Button size="lg" onClick={() => place('especes')}><Banknote size={22} aria-hidden /> Payer en caisse (espèces)</Button>
          <Button size="lg" variant="secondary" onClick={() => place('mobile_money')}><Smartphone size={22} aria-hidden /> Mobile Money (simulé)</Button>
          <Button variant="ghost" onClick={() => setChoosing(false)}>Retour à ma commande</Button>
        </div>
      </Modal>

      <Modal open={phase === 'pay'} onClose={() => { /* le paiement doit être résolu ou annulé */ }} hideClose title={order ? `Commande ${formatOrderNumber(order.number)}` : ''}>
        {order && <PaymentSim big order={order} onCancelled={() => dispatch(transitionOrder(order.id, 'annulee'))} />}
      </Modal>

      <Modal open={phase === 'done' || phase === 'cancelled'} onClose={reset} title={phase === 'cancelled' ? 'Commande annulée' : 'Merci !'}>
        {order && phase === 'done' && (
          <div className="text-center">
            <CircleCheck size={44} className="mx-auto text-ok" aria-hidden />
            <p className="mt-2 text-muted">Votre numéro de commande</p>
            <p className="font-display text-7xl font-bold text-brand">{formatOrderNumber(order.number)}</p>
            <p className="mt-3 text-lg">{order.paymentStatus === 'paye' ? 'Paiement confirmé (simulé).' : 'Présentez ce numéro en caisse pour régler en espèces.'}</p>
            <p className="mt-1 text-muted">Suivez l’écran d’affichage : votre numéro apparaîtra quand la commande sera prête.</p>
          </div>
        )}
        {phase === 'cancelled' && <p className="text-muted">Aucun paiement n’a été effectué.</p>}
        <div className="mt-6 flex flex-col items-center"><Button size="lg" onClick={reset}>Nouvelle commande</Button>{phase === 'done' && <Countdown onDone={reset} />}</div>
      </Modal>
    </div>
  )
}
