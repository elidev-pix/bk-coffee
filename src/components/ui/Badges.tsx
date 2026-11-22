import type { OrderStatus, PaymentStatus } from '../../types'
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from '../../lib/labels'
import { cx } from '../../lib/cx'

const base = 'inline-flex items-center gap-1.5 rounded-control border px-2 py-0.5 text-xs font-semibold whitespace-nowrap'
const orderTone: Record<OrderStatus, string> = {
  nouvelle: 'border-info/40 bg-info-soft text-info', en_preparation: 'border-brand-strong/50 bg-accent-soft text-brand',
  prete: 'border-ok/50 bg-ok-soft text-ok', remise: 'border-line bg-surface-raised text-muted', annulee: 'border-danger/40 bg-danger-soft text-danger',
}
const payTone: Record<PaymentStatus, string> = {
  en_attente: 'border-brand-strong/50 bg-accent-soft text-brand', paye: 'border-ok/50 bg-ok-soft text-ok',
  echoue: 'border-danger/40 bg-danger-soft text-danger', annule: 'border-line bg-surface-raised text-muted',
}
// Le libellé porte l'information : la couleur n'est qu'un renfort.
export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => <span className={cx(base, orderTone[status])}>{ORDER_STATUS_LABEL[status]}</span>
export const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => <span className={cx(base, payTone[status])}>Paiement : {PAYMENT_STATUS_LABEL[status].toLowerCase()}</span>
