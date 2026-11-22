import { Minus, Plus } from 'lucide-react'
import { MAX_QTY } from '../../lib/orders'
import { cx } from '../../lib/cx'

export default function QtyStepper({ value, onChange, label, big = false, min = 0 }: { value: number; onChange: (v: number) => void; label: string; big?: boolean; min?: number }) {
  const btn = cx('flex items-center justify-center rounded-control border border-line-strong text-ink hover:border-brand hover:text-brand disabled:opacity-40', big ? 'size-12' : 'size-9')
  return (
    <div className="inline-flex items-center gap-2" role="group" aria-label={`Quantité : ${label}`}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Diminuer la quantité de ${label}`}><Minus size={big ? 22 : 16} aria-hidden /></button>
      <output className={cx('text-center font-display font-semibold tabular-nums', big ? 'w-10 text-2xl' : 'w-7 text-lg')} aria-live="polite">{value}</output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} aria-label={`Augmenter la quantité de ${label}`}><Plus size={big ? 22 : 16} aria-hidden /></button>
    </div>
  )
}
