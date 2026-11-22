import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, Circle } from 'lucide-react'
import { dispatch, useAppState } from '../state/store'
import { transitionOrder } from '../state/actions'
import { formatDateTime, formatFCFA, formatOrderNumber } from '../lib/format'
import { lineTotal } from '../lib/orders'
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL, SERVICE_MODE_LABEL } from '../lib/labels'
import type { OrderStatus } from '../types'
import { cx } from '../lib/cx'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { OrderStatusBadge, PaymentStatusBadge } from '../components/ui/Badges'
import PaymentSim from '../components/PaymentSim'

const STEPS: OrderStatus[] = ['nouvelle', 'en_preparation', 'prete', 'remise']

export default function OrderTracking() {
  const { orderId } = useParams()
  const { orders } = useAppState()
  const order = orders.find((o) => o.id === orderId)
  const [confirm, setConfirm] = useState(false)
  if (!order) return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center"><h1 className="font-display text-3xl">Commande introuvable</h1><p className="mt-2 text-muted">Elle n’existe pas ou les données locales ont été réinitialisées.</p><Link to="/menu" className="mt-4 inline-block text-brand underline">Retour au menu</Link></div>
  )
  const stepIdx = STEPS.indexOf(order.status)
  const payable = order.status !== 'annulee' && (order.paymentStatus === 'en_attente' || order.paymentStatus === 'echoue')
  const canCancel = order.status === 'nouvelle' && order.paymentStatus !== 'paye'
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="label-caps text-brand-strong">Votre commande</p>
      <h1 className="mt-1 font-display text-5xl font-bold text-brand">{formatOrderNumber(order.number)}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2"><OrderStatusBadge status={order.status} /><PaymentStatusBadge status={order.paymentStatus} /></div>
      <p className="mt-2 text-sm text-muted">{SERVICE_MODE_LABEL[order.serviceMode]} · {formatDateTime(order.createdAt)} · {PAYMENT_METHOD_LABEL[order.paymentMethod]}</p>

      {order.status === 'annulee'
        ? <p role="status" className="mt-6 rounded-card border border-danger/40 bg-danger-soft p-4 text-danger">Cette commande a été annulée.</p>
        : <ol aria-label="Avancement" className="mt-6 grid grid-cols-4 gap-2">
            {STEPS.map((s, i) => (
              <li key={s} aria-current={i === stepIdx ? 'step' : undefined} className={cx('rounded-control border p-3 text-center text-xs font-semibold', i < stepIdx ? 'border-ok/50 text-ok' : i === stepIdx ? 'border-brand bg-accent-soft text-brand' : 'border-line text-muted')}>
                {i <= stepIdx ? <Check size={16} className="mx-auto mb-1" aria-hidden /> : <Circle size={16} className="mx-auto mb-1" aria-hidden />}{ORDER_STATUS_LABEL[s]}
              </li>
            ))}
          </ol>}

      {payable && order.paymentMethod === 'mobile_money' && <div className="mt-6"><PaymentSim order={order} onCancelled={() => dispatch(transitionOrder(order.id, 'annulee'))} /></div>}
      {payable && order.paymentMethod === 'especes' && <p className="mt-6 rounded-card border border-line bg-surface p-4 text-sm text-muted">Paiement en espèces à régler au comptoir lors du retrait. Donnez votre numéro <strong className="text-ink">{formatOrderNumber(order.number)}</strong>.</p>}
      {order.status === 'prete' && <p role="status" className="mt-6 rounded-card border border-ok/50 bg-ok-soft p-4 text-ok">Votre commande est prête : présentez-vous au comptoir.</p>}

      <section aria-label="Détail" className="mt-6 rounded-card border border-line bg-surface p-5">
        <ul className="divide-y divide-line">
          {order.lines.map((l, i) => (
            <li key={i} className="flex justify-between gap-3 py-2"><span>{l.quantity} × {l.name}{l.optionLabels.length > 0 && <span className="text-sm text-muted"> (+ {l.optionLabels.join(', ')})</span>}</span><span className="whitespace-nowrap text-muted">{formatFCFA(lineTotal(l))}</span></li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between border-t border-line pt-3"><span>Total</span><span className="font-display text-2xl font-semibold text-brand">{formatFCFA(order.total)}</span></p>
      </section>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/menu" className="inline-flex min-h-11 items-center rounded-control border border-brand-strong px-4 font-semibold text-brand">Nouvelle commande</Link>
        {canCancel && <Button variant="danger" onClick={() => setConfirm(true)}>Annuler la commande</Button>}
      </div>
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Annuler la commande ?">
        <p className="text-muted">Cette action est définitive.</p>
        <div className="mt-5 flex justify-end gap-3"><Button variant="ghost" onClick={() => setConfirm(false)}>Garder</Button><Button variant="danger" onClick={() => { dispatch(transitionOrder(order.id, 'annulee')); setConfirm(false) }}>Annuler la commande</Button></div>
      </Modal>
    </div>
  )
}
