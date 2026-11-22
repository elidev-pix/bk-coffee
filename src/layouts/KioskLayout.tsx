import { Link, Outlet } from 'react-router-dom'
import BrandMark from '../components/BrandMark'

export default function KioskLayout() {
  return (
    <div className="bg-pattern flex h-screen flex-col overflow-hidden">
      <header className="glass flex items-center justify-between border-x-0 border-t-0 px-8 py-3">
        <BrandMark text size={52} />
        <Link to="/" className="text-sm text-muted hover:text-brand">Quitter la borne (démo)</Link>
      </header>
      <main className="min-h-0 flex-1"><Outlet /></main>
    </div>
  )
}
