import { Link } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import { useAppState } from '../state/store'

const spaces = [
  ['/menu', 'Site client', 'Menu, panier, commande'], ['/borne', 'Borne de commande', 'Commande tactile sur place'],
  ['/caisse', 'Caisse POS', 'Encaissement et suivi'], ['/affichage', 'Affichage public', 'Écran TV des commandes'],
  ['/admin', 'Administration', 'Dashboard et gestion'],
] as const

export default function Home() {
  const { products } = useAppState()
  const open = products.filter((p) => p.available).length
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-5xl text-brand"><BrandMark /></h1>
      <p className="mt-3 max-w-xl text-muted">Démonstration du site et du système de gestion. {open} produits disponibles. Données fictives, paiement simulé, stockage local.</p>
      <Link to="/menu" className="mt-6 inline-block rounded-control bg-brand px-5 py-3 font-medium text-brand-contrast hover:bg-brand-strong">Voir le menu</Link>
      <h2 className="mt-12 text-sm font-semibold uppercase tracking-wide text-muted">Accès démonstration</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {spaces.map(([to, t, d]) => (
          <li key={to}><Link to={to} className="block rounded-card border border-line bg-surface p-4 shadow-card hover:border-accent"><span className="font-medium text-ink">{t}</span><span className="block text-sm text-muted">{d}</span></Link></li>
        ))}
      </ul>
    </section>
  )
}
