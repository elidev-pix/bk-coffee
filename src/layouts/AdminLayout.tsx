import { Link, NavLink, Outlet } from 'react-router-dom'
import BrandMark from '../components/BrandMark'

const items = [
  ['/admin', 'Dashboard', true], ['/admin/commandes', 'Commandes', false], ['/admin/produits', 'Produits', false],
  ['/admin/employes', 'Employés', false], ['/admin/horaires', 'Horaires', false], ['/admin/parametres', 'Paramètres', false],
] as const

const link = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-control px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand text-brand-contrast' : 'text-muted hover:bg-surface-alt'}`

export default function AdminLayout() {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-line bg-surface lg:w-60 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-3 lg:block">
          <BrandMark className="text-xl text-brand" />
          <Link to="/" className="text-xs text-muted hover:text-ink lg:mt-1 lg:block">Retour accueil</Link>
        </div>
        <nav aria-label="Administration" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
          {items.map(([to, label, end]) => <NavLink key={to} to={to} end={end} className={link}>{label}</NavLink>)}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <p role="note" className="bg-accent-soft px-4 py-2 text-xs text-brand-strong">Interface de démonstration : aucune authentification réelle, données stockées localement dans ce navigateur.</p>
        <main><Outlet /></main>
      </div>
    </div>
  )
}
