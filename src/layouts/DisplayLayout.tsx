import { Outlet } from 'react-router-dom'

/** Écran public : aucun lien, ni navigation, ni sidebar. */
export default function DisplayLayout() {
  return <div className="min-h-screen bg-brand-strong text-brand-contrast"><Outlet /></div>
}
