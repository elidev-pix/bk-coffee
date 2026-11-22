import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShoppingBag } from 'lucide-react'
import type { Product } from '../types'
import { useCatalog } from '../hooks'
import { cartAdd, useCart } from '../state/cart'
import { useAppState } from '../state/store'
import { priceCart } from '../lib/orders'
import { formatFCFA } from '../lib/format'
import CategoryTabs from '../components/CategoryTabs'
import ProductCard from '../components/ProductCard'
import ProductDialog from '../components/ProductDialog'

export default function Menu() {
  const cat = useCatalog()
  const { products } = useAppState()
  const cart = priceCart(useCart('site'), products)
  const [open, setOpen] = useState<Product | null>(null)
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-28">
      <h1 className="font-display text-4xl font-bold text-ink">Notre menu</h1>
      <p className="mt-2 text-muted">Prix en FCFA (données de démonstration).</p>
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <CategoryTabs categories={cat.categories} value={cat.categoryId} onChange={cat.setCategoryId} />
        <label className="relative block md:w-72">
          <span className="sr-only">Rechercher un produit</span>
          <Search size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" aria-hidden />
          <input type="search" value={cat.query} onChange={(e) => cat.setQuery(e.target.value)} placeholder="Rechercher…" className="min-h-11 w-full rounded-control border border-line-strong bg-surface pr-3 pl-10 text-ink placeholder:text-muted/70" />
        </label>
      </div>
      {cat.visible.length === 0
        ? <p role="status" className="mt-10 rounded-card border border-line bg-surface p-6 text-center text-muted">Aucun produit ne correspond à votre recherche.</p>
        : <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{cat.visible.map((p) => (
            <li key={p.id}><ProductCard product={p} onOpen={setOpen} onAdd={(x) => cartAdd('site', { productId: x.id, quantity: 1, optionIds: [] })} /></li>
          ))}</ul>}
      <ProductDialog product={open} onClose={() => setOpen(null)} onAdd={(i) => cartAdd('site', i)} />
      {cart.count > 0 && (
        <div className="glass fixed inset-x-0 bottom-0 z-10 border-x-0 border-b-0">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <p className="text-sm text-muted"><strong className="text-ink">{cart.count}</strong> article{cart.count > 1 ? 's' : ''} · <span className="font-display text-lg text-brand">{formatFCFA(cart.total)}</span></p>
            <Link to="/panier" className="inline-flex min-h-11 items-center gap-2 rounded-control bg-brand px-5 font-bold text-brand-contrast"><ShoppingBag size={18} aria-hidden /> Voir le panier</Link>
          </div>
        </div>
      )}
    </div>
  )
}
