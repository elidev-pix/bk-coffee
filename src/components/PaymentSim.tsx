import { useState } from 'react'
import { CircleAlert, ShieldAlert } from 'lucide-react'
import type { Order } from '../types'
import { dispatch } from '../state/store'
import { recordPayment } from '../state/actions'
import { formatFCFA } from '../lib/format'
import Button from './ui/Button'

/** Simulation Mobile Money : aucun opérateur, aucun numéro, aucun PIN/OTP — uniquement un scénario choisi par l'opérateur de la démo. */
export default function PaymentSim({ order, by, big = false, onCancelled }: { order: Order; by?: string; big?: boolean; onCancelled?: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const run = (outcome: 'paye' | 'echoue' | 'annule') => {
    const r = dispatch(recordPayment(order.id, outcome, { method: 'mobile_money', by }))
    if (!r.ok) setError(r.error)
    else { setError(null); if (outcome === 'annule') onCancelled?.() }
  }
  const size = big ? 'lg' : 'md'
  return (
    <section aria-label="Paiement Mobile Money simulé" className="rounded-card border border-brand-strong/40 bg-accent-soft p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-brand"><ShieldAlert size={18} aria-hidden /> Paiement simulé — aucun débit réel</p>
      <p className="mt-1 text-sm text-muted">Montant à régler : <strong className="font-display text-lg text-brand">{formatFCFA(order.total)}</strong>. Aucun code PIN ni OTP n’est demandé. Choisissez le résultat à simuler :</p>
      {order.paymentStatus === 'echoue' && <p role="status" className="mt-3 flex items-center gap-2 text-sm text-danger"><CircleAlert size={16} aria-hidden /> Le paiement a échoué. Vous pouvez réessayer.</p>}
      {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size={size} onClick={() => run('paye')}>{order.paymentStatus === 'echoue' ? 'Réessayer (succès)' : 'Simuler un succès'}</Button>
        <Button size={size} variant="secondary" onClick={() => run('echoue')}>Simuler un échec</Button>
        <Button size={size} variant="danger" onClick={() => run('annule')}>Simuler une annulation</Button>
      </div>
    </section>
  )
}
