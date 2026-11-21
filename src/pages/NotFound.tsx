import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="font-display text-6xl text-brand">404</p>
      <h1 className="text-xl">Page introuvable</h1>
      <p className="text-muted">Cette adresse n’existe pas dans l’application.</p>
      <Link to="/" className="rounded-control bg-brand px-4 py-2 text-brand-contrast">Retour à l’accueil</Link>
    </main>
  )
}
