import { Link } from 'react-router-dom'
import { Monitor, MonitorSmartphone, ReceiptText, Settings2, Store } from 'lucide-react'
import logo from '../assets/logo-bk-coffee.webp'
import { useAppState } from '../state/store'

const spaces = [
  ['/menu', 'Site client', 'Menu, panier et commande à emporter', Store],
  ['/borne', 'Borne de commande', 'Commande tactile sur place', MonitorSmartphone],
  ['/caisse', 'Caisse POS', 'Encaissement et suivi des commandes', ReceiptText],
  ['/affichage', 'Affichage public', 'Écran TV des numéros de commandes', Monitor],
  ['/admin', 'Administration', 'Dashboard et gestion', Settings2],
] as const

export default function Home() {
  const { products, establishment } = useAppState()
  const open = products.filter((p) => p.available).length
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="label-caps text-brand-strong">Coffee shop</p>
          <h1 className="mt-3 font-display text-5xl leading-tight font-bold text-ink md:text-6xl">Bienvenue chez <span className="text-brand">{establishment.name}</span></h1>
          <p className="mt-5 max-w-lg text-lg text-muted">Une expérience sensorielle unique. Commandez à emporter, retirez au comptoir : {open} produits disponibles aujourd’hui.</p>
          <Link to="/menu" className="mt-8 inline-flex min-h-12 items-center rounded-control bg-brand px-6 font-bold text-brand-contrast transition-shadow hover:shadow-glow">Voir le menu</Link>
        </div>
        <img src={logo} alt="Logo BK Coffee Shop" width={512} height={500} className="mx-auto w-full max-w-sm rounded-card border border-line shadow-card" />
      </section>
      <section aria-labelledby="demo-title" className="border-t border-line bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 id="demo-title" className="label-caps text-muted">Accès démonstration</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map(([to, title, desc, Icon]) => (
              <li key={to}>
                <Link to={to} className="flex h-full items-start gap-3 rounded-card border border-line bg-surface p-4 transition-colors hover:border-brand">
                  <Icon size={22} strokeWidth={1.5} className="mt-0.5 shrink-0 text-brand" aria-hidden />
                  <span><span className="block font-semibold text-ink">{title}</span><span className="block text-sm text-muted">{desc}</span></span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">La synchronisation entre interfaces fonctionne dans le même navigateur (onglets distincts), pas entre appareils.</p>
        </div>
      </section>
    </div>
  )
}
