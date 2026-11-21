import { Link, Outlet } from 'react-router-dom'
import BrandMark from '../components/BrandMark'

export default function PosLayout() {
  return (
    <div className="flex h-screen flex-col bg-canvas">
      <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-2">
        <div className="flex items-center gap-3"><BrandMark className="text-xl text-brand" /><span className="text-sm text-muted">Caisse — démonstration, sans authentification réelle</span></div>
        <Link to="/" className="text-sm text-muted hover:text-ink">Retour accueil</Link>
      </header>
      <main className="min-h-0 flex-1"><Outlet /></main>
    </div>
  )
}
