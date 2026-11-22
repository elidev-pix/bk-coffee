import { Link, Outlet } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import ThemeToggle from '../components/ThemeToggle'

export default function PosLayout() {
  return (
    <div className="bg-pattern flex h-screen flex-col">
      <header className="glass flex items-center justify-between border-x-0 border-t-0 px-4 py-2">
        <div className="flex items-center gap-3"><BrandMark size={36} text /><span className="hidden text-sm text-muted md:inline">Caisse — démonstration, sans authentification réelle</span></div>
        <div className="flex items-center gap-4"><ThemeToggle compact /><Link to="/" className="text-sm text-muted hover:text-brand">Retour accueil</Link></div>
      </header>
      <main className="min-h-0 flex-1"><Outlet /></main>
    </div>
  )
}
