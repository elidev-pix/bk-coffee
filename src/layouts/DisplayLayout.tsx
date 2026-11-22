import { Outlet } from 'react-router-dom'

/** Écran public : aucun lien, ni navigation, ni sidebar. */
export default function DisplayLayout() {
  return <div className="bg-pattern min-h-screen bg-canvas text-ink"><Outlet /></div>
}
