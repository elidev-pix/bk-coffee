import { cx } from '../../lib/cx'

/** Interrupteur : l'état est aussi exprimé par le texte (onLabel / offLabel), pas seulement par la couleur. */
export default function Toggle({ checked, onChange, label, onLabel = 'Actif', offLabel = 'Inactif' }: { checked: boolean; onChange: (v: boolean) => void; label: string; onLabel?: string; offLabel?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className="group inline-flex items-center gap-2 rounded-control p-1">
      <span className={cx('relative h-6 w-11 rounded-full border transition-colors', checked ? 'border-brand bg-brand' : 'border-line-strong bg-surface-raised')}>
        <span className={cx('absolute top-0.5 size-4 rounded-full transition-all', checked ? 'left-[1.45rem] bg-brand-contrast' : 'left-0.5 bg-muted')} />
      </span>
      <span className="text-sm font-semibold text-muted">{checked ? onLabel : offLabel}</span>
    </button>
  )
}
