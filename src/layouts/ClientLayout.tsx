import { Link, NavLink, Outlet } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import BrandMark from '../components/BrandMark'
import { useAppState } from '../state/store'
import { useCart } from '../state/cart'
import { PENDING_INFO } from '../lib/labels'
import { cx } from '../lib/cx'

const link = ({ isActive }: { isActive: boolean }) =>
  cx('rounded-control px-3 py-2 text-sm font-semibold', isActive ? 'bg-accent-soft text-brand' : 'text-muted hover:text-brand')

export default function ClientLayout() {
  const { establishment: e } = useAppState()
  const count = useCart('site').reduce((s, i) => s + i.quantity, 0)
  return (
    <div className="bg-pattern flex min-h-screen flex-col">
      <header className="glass sticky top-0 z-20 border-x-0 border-t-0">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" aria-label="BK Coffee Shop — accueil"><BrandMark text className="[&_span]:hidden sm:[&_span]:inline" /></Link>
          <nav aria-label="Navigation principale" className="flex items-center gap-1">
            <NavLink to="/" end className={link}>Accueil</NavLink>
            <NavLink to="/menu" className={link}>Menu</NavLink>
            <NavLink to="/panier" className={(s) => cx(link(s), 'inline-flex items-center gap-2')}>
              <ShoppingBag size={18} aria-hidden /> Panier
              {count > 0 && <span className="rounded-full bg-brand px-2 text-xs font-bold text-brand-contrast" aria-label={`${count} article${count > 1 ? 's' : ''}`}>{count}</span>}
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-line bg-surface text-sm text-muted">
        <div className="mx-auto grid max-w-6xl gap-2 px-4 py-8 sm:grid-cols-3">
          <p className="font-display text-lg text-brand">{e.name}</p>
          <p>Adresse : {e.address || PENDING_INFO}</p>
          <p>Téléphone : {e.phone || PENDING_INFO}<br />Horaires : {e.hours || PENDING_INFO}</p>
        </div>
        <p className="border-t border-line px-4 py-3 text-center text-xs">Démonstration : données fictives, paiement simulé, stockage local à ce navigateur.</p>
      </footer>
    </div>
  )
}
