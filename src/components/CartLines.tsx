import { Trash2 } from 'lucide-react'
import type { CartScope } from '../state/cart'
import { cartRemove, cartSetQty } from '../state/cart'
import type { PricedRow } from '../lib/orders'
import { formatFCFA } from '../lib/format'
import QtyStepper from './ui/QtyStepper'

export default function CartLines({ scope, rows, big = false }: { scope: CartScope; rows: PricedRow[]; big?: boolean }) {
  return (
    <ul className="divide-y divide-line">
      {rows.map((r) => {
        const name = r.product?.name ?? 'Produit supprimé'
        return (
          <li key={r.key} className="flex gap-3 py-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">{name}</p>
              {r.optionLabels.length > 0 && <p className="text-sm text-muted">+ {r.optionLabels.join(', ')}</p>}
              {r.unavailable && <p role="alert" className="mt-1 text-sm text-danger">Ce produit n’est plus disponible : retirez-le pour continuer.</p>}
              <div className="mt-2 flex items-center gap-3">
                <QtyStepper value={r.item.quantity} onChange={(v) => cartSetQty(scope, r.key, v)} label={name} big={big} />
                <button type="button" onClick={() => cartRemove(scope, r.key)} aria-label={`Retirer ${name} du panier`} className="rounded-control p-2 text-muted hover:bg-danger-soft hover:text-danger"><Trash2 size={18} aria-hidden /></button>
              </div>
            </div>
            <p className="font-display text-lg font-semibold whitespace-nowrap text-brand">{r.unavailable ? '—' : formatFCFA(r.total)}</p>
          </li>
        )
      })}
    </ul>
  )
}
