import { Link, Outlet } from 'react-router-dom'
import BrandMark from '../components/BrandMark'

export default function KioskLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex items-center justify-between bg-brand px-8 py-4 text-brand-contrast">
        <BrandMark className="text-3xl" />
        <Link to="/" className="text-sm opacity-70 hover:opacity-100">Quitter la borne (démo)</Link>
      </header>
      <main className="flex-1"><Outlet /></main>
    </div>
  )
}
