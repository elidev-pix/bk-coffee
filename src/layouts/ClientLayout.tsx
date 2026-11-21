import { Link, NavLink, Outlet } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import { useAppState } from '../state/store'
import { PENDING_INFO } from '../lib/labels'

const link = ({ isActive }: { isActive: boolean }) =>
  `rounded-control px-3 py-2 text-sm font-medium ${isActive ? 'bg-accent-soft text-brand-strong' : 'text-muted hover:text-ink'}`

export default function ClientLayout() {
  const { establishment: e } = useAppState()
  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass sticky top-0 z-20 border-x-0 border-t-0">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="text-xl text-brand"><BrandMark /></Link>
          <nav aria-label="Navigation principale" className="flex items-center gap-1">
            <NavLink to="/" end className={link}>Accueil</NavLink>
            <NavLink to="/menu" className={link}>Menu</NavLink>
            <NavLink to="/panier" className={link}>Panier</NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-line bg-surface-alt text-sm text-muted">
        <div className="mx-auto grid max-w-6xl gap-2 px-4 py-6 sm:grid-cols-3">
          <p className="font-medium text-ink">{e.name}</p>
          <p>Adresse : {e.address || PENDING_INFO}</p>
          <p>Téléphone : {e.phone || PENDING_INFO} · Horaires : {e.hours || PENDING_INFO}</p>
        </div>
      </footer>
    </div>
  )
}
