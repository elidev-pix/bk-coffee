import { formatFCFA } from '../lib/format'

/** Histogramme simple (sans dépendance). Description textuelle pour les lecteurs d'écran ; valeurs visibles au survol et sur les barres non nulles. */
export default function BarChart({ data, ariaLabel }: { data: { label: string; value: number }[]; ariaLabel: string }) {
  const max = Math.max(...data.map((d) => d.value), 0)
  const every = Math.ceil(data.length / 10)
  if (max === 0) return <p role="status" className="py-12 text-center text-muted">Aucune vente encaissée sur cette période.</p>
  const summary = `${ariaLabel} : ${data.filter((d) => d.value > 0).map((d) => `${d.label} ${formatFCFA(d.value)}`).join(', ')}`
  return (
    <div role="img" aria-label={summary}>
      <div className="flex h-56 items-end gap-1.5" aria-hidden>
        {data.map((d) => (
          <div key={d.label} className="flex h-full flex-1 flex-col justify-end" title={`${d.label} : ${formatFCFA(d.value)}`}>
            <div className="w-full rounded-t-[3px] bg-brand transition-[height] duration-300" style={{ height: `${(d.value / max) * 100}%`, opacity: d.value === max ? 1 : 0.55, minHeight: d.value > 0 ? 3 : 0 }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 text-xs text-muted" aria-hidden>{data.map((d, i) => <span key={d.label} className="flex-1 text-center">{i % every === 0 ? d.label : ''}</span>)}</div>
    </div>
  )
}
