import { Link, NavLink, Outlet } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import ThemeToggle from '../components/ThemeToggle'
import { cx } from '../lib/cx'

const items = [
  ['/admin', 'Dashboard', true], ['/admin/commandes', 'Commandes', false], ['/admin/produits', 'Produits', false],
  ['/admin/employes', 'Employés', false], ['/admin/horaires', 'Horaires', false], ['/admin/parametres', 'Paramètres', false],
] as const

const link = ({ isActive }: { isActive: boolean }) =>
  cx('whitespace-nowrap rounded-control px-3 py-2 text-sm font-semibold', isActive ? 'bg-brand text-brand-contrast' : 'text-muted hover:bg-surface-raised hover:text-brand')

export default function AdminLayout() {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-line bg-surface lg:w-60 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-4 py-3 lg:block">
          <BrandMark text size={36} className="[&_span]:text-base" />
          <div className="flex items-center gap-3 lg:mt-3"><Link to="/" className="text-xs text-muted hover:text-brand">Retour accueil</Link><ThemeToggle compact /></div>
        </div>
        <nav aria-label="Administration" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
          {items.map(([to, label, end]) => <NavLink key={to} to={to} end={end} className={link}>{label}</NavLink>)}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <p role="note" className="bg-accent-soft px-4 py-2 text-xs text-brand">Interface de démonstration : aucune authentification réelle, données stockées localement dans ce navigateur.</p>
        <main><Outlet /></main>
      </div>
    </div>
  )
}
