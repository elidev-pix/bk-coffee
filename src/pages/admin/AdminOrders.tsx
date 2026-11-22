import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { Order, OrderSource, OrderStatus, PaymentStatus } from '../../types'
import { dispatch, useAppState } from '../../state/store'
import { transitionOrder } from '../../state/actions'
import { useAdminActor } from '../../hooks'
import { lineTotal, ORDER_TRANSITIONS } from '../../lib/orders'
import { formatDateTime, formatFCFA, formatOrderNumber, formatTime } from '../../lib/format'
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, SERVICE_MODE_LABEL, SOURCE_LABEL } from '../../lib/labels'
import { inputCls } from '../../lib/ui'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/ui/Badges'

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = { en_preparation: 'Lancer la préparation', prete: 'Marquer prête', remise: 'Marquer remise' }

function Detail({ order, by, onClose }: { order: Order; by?: string; onClose: () => void }) {
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const steps = ORDER_TRANSITIONS[order.status].filter((s) => s !== 'annulee')
  const canCancel = ORDER_TRANSITIONS[order.status].includes('annulee')
  const act = (to: OrderStatus) => { const r = dispatch(transitionOrder(order.id, to, by)); setError(r.ok ? null : r.error); setConfirm(false) }
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2"><OrderStatusBadge status={order.status} /><PaymentStatusBadge status={order.paymentStatus} /></div>
      <p className="mt-2 text-sm text-muted">{SERVICE_MODE_LABEL[order.serviceMode]} · {SOURCE_LABEL[order.source]} · {formatDateTime(order.createdAt)} · {PAYMENT_METHOD_LABEL[order.paymentMethod]}{order.customerName && ` · ${order.customerName}`}</p>
      <ul className="mt-4 divide-y divide-line rounded-card border border-line">
        {order.lines.map((l, i) => <li key={i} className="flex justify-between gap-3 p-3 text-sm"><span>{l.quantity} × {l.name}{l.optionLabels.length > 0 && <span className="text-muted"> (+ {l.optionLabels.join(', ')})</span>}</span><span className="whitespace-nowrap text-muted">{formatFCFA(lineTotal(l))}</span></li>)}
        <li className="flex justify-between p-3"><span>Total</span><span className="font-display text-xl font-semibold text-brand">{formatFCFA(order.total)}</span></li>
      </ul>
      {order.paymentStatus !== 'paye' && order.status !== 'annulee' && <p className="mt-3 text-sm text-muted">L’encaissement se fait depuis la caisse.</p>}
      {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
      <h3 className="label-caps mt-5 text-muted">Historique</h3>
      <ol className="mt-2 space-y-1 text-sm">{order.history.map((h, i) => <li key={i} className="text-muted"><span className="font-display text-ink">{formatTime(h.at)}</span> — {h.label}</li>)}</ol>
      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        {confirm ? (
          <><span className="mr-auto text-sm text-danger">Annuler définitivement cette commande ?</span><Button variant="ghost" onClick={() => setConfirm(false)}>Garder</Button><Button variant="danger" onClick={() => act('annulee')}>Confirmer l’annulation</Button></>
        ) : (
          <>{canCancel && <Button variant="danger" className="mr-auto" onClick={() => setConfirm(true)}>Annuler</Button>}
            {steps.map((s) => <Button key={s} disabled={s === 'remise' && order.paymentStatus !== 'paye'} onClick={() => act(s)}>{NEXT_LABEL[s] ?? ORDER_STATUS_LABEL[s]}</Button>)}
            <Button variant="secondary" onClick={onClose}>Fermer</Button></>
        )}
      </div>
    </div>
  )
}

export default function AdminOrders() {
  const { orders } = useAppState()
  const by = useAdminActor()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [source, setSource] = useState<OrderSource | ''>('')
  const [pay, setPay] = useState<PaymentStatus | ''>('')
  const [openId, setOpenId] = useState<string | null>(null)
  const list = useMemo(() => {
    const n = q.replace(/\D/g, '')
    return orders.filter((o) => (!n || String(o.number).includes(n)) && (!status || o.status === status) && (!source || o.source === source) && (!pay || o.paymentStatus === pay))
  }, [orders, q, status, source, pay])
  const open = orders.find((o) => o.id === openId)
  const sel = (label: string, value: string, set: (v: never) => void, opts: [string, string][]) => (
    <label className="block text-sm"><span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => set(e.target.value as never)} className={`${inputCls} mt-0`} aria-label={label}><option value="">{label} : tous</option>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
    </label>
  )
  return (
    <div className="pb-10">
      <PageHeader title="Commandes" subtitle={`${list.length} commande${list.length > 1 ? 's' : ''}`} />
      <div className="space-y-4 px-4 md:px-8">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="relative block"><span className="sr-only">Rechercher par numéro</span><Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" aria-hidden /><input inputMode="numeric" value={q} onChange={(e) => setQ(e.target.value)} placeholder="N° de commande" className={`${inputCls} mt-0 pl-9`} /></label>
          {sel('Statut', status, setStatus as (v: never) => void, Object.entries(ORDER_STATUS_LABEL))}
          {sel('Source', source, setSource as (v: never) => void, Object.entries(SOURCE_LABEL))}
          {sel('Paiement', pay, setPay as (v: never) => void, Object.entries(PAYMENT_STATUS_LABEL))}
        </div>
        {list.length === 0 ? <p role="status" className="rounded-card border border-line bg-surface p-8 text-center text-muted">Aucune commande ne correspond aux filtres.</p> : (
          <ul className="divide-y divide-line rounded-card border border-line bg-surface">
            {list.map((o) => (
              <li key={o.id}>
                <button type="button" onClick={() => setOpenId(o.id)} className="grid w-full gap-x-4 gap-y-2 p-4 text-left hover:bg-surface-alt md:grid-cols-[5rem_1fr_auto_8rem] md:items-center" aria-label={`Détail de la commande ${formatOrderNumber(o.number)}`}>
                  <span className="font-display text-xl text-brand">{formatOrderNumber(o.number)}</span>
                  <span className="text-sm text-muted">{formatDateTime(o.createdAt)} · {SOURCE_LABEL[o.source]} · {SERVICE_MODE_LABEL[o.serviceMode]}</span>
                  <span className="flex flex-wrap gap-2"><OrderStatusBadge status={o.status} /><PaymentStatusBadge status={o.paymentStatus} /></span>
                  <span className="font-display text-lg text-brand md:text-right">{formatFCFA(o.total)}</span>
                </button>
              </li>))}
          </ul>)}
      </div>
      <Modal size="lg" open={!!open} onClose={() => setOpenId(null)} title={open ? `Commande ${formatOrderNumber(open.number)}` : ''}>
        {open && <Detail key={open.id} order={open} by={by} onClose={() => setOpenId(null)} />}
      </Modal>
    </div>
  )
}
