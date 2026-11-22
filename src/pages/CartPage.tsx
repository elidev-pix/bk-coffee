import { Link } from 'react-router-dom'
import { useCart, cartClear } from '../state/cart'
import { useAppState } from '../state/store'
import { priceCart } from '../lib/orders'
import { formatFCFA } from '../lib/format'
import CartLines from '../components/CartLines'
import Button from '../components/ui/Button'

export default function CartPage() {
  const { products } = useAppState()
  const items = useCart('site')
  const cart = priceCart(items, products)
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl font-bold">Votre panier</h1>
      {items.length === 0 ? (
        <div className="mt-8 rounded-card border border-line bg-surface p-8 text-center">
          <p className="text-muted">Votre panier est vide.</p>
          <Link to="/menu" className="mt-4 inline-flex min-h-11 items-center rounded-control bg-brand px-5 font-bold text-brand-contrast">Parcourir le menu</Link>
        </div>
      ) : (
        <>
          <div className="mt-6 rounded-card border border-line bg-surface px-5"><CartLines scope="site" rows={cart.rows} /></div>
          <div className="mt-6 flex items-center justify-between rounded-card border border-line bg-surface p-5">
            <span className="text-lg">Total</span>
            <span className="font-display text-3xl font-semibold text-brand">{formatFCFA(cart.total)}</span>
          </div>
          <div className="mt-6 flex flex-wrap justify-between gap-3">
            <Button variant="ghost" onClick={() => cartClear('site')}>Vider le panier</Button>
            <div className="flex gap-3">
              <Link to="/menu" className="inline-flex min-h-11 items-center rounded-control border border-brand-strong px-4 font-semibold text-brand">Continuer mes achats</Link>
              {cart.hasUnavailable
                ? <Button disabled>Commander</Button>
                : <Link to="/commande" className="inline-flex min-h-11 items-center rounded-control bg-brand px-5 font-bold text-brand-contrast">Commander</Link>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
