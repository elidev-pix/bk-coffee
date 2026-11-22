import { Monitor, Moon, Sun } from 'lucide-react'
import { setTheme, useTheme, type ThemePref } from '../state/theme'
import { cx } from '../lib/cx'

const OPTIONS: [ThemePref, string, typeof Sun][] = [['light', 'Clair', Sun], ['dark', 'Sombre', Moon], ['system', 'Système', Monitor]]

/** compact : icônes seules (barres d'en-tête) ; sinon libellés visibles (Paramètres). */
export default function ThemeToggle({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { pref } = useTheme()
  return (
    <div role="group" aria-label="Thème d’affichage" className={cx('inline-flex rounded-control border border-line p-0.5', className)}>
      {OPTIONS.map(([v, label, Icon]) => (
        <button key={v} type="button" aria-pressed={pref === v} aria-label={compact ? `Thème ${label.toLowerCase()}` : undefined} title={label} onClick={() => setTheme(v)}
          className={cx('inline-flex items-center gap-1.5 rounded-[3px] text-sm font-semibold transition-colors', compact ? 'size-8 justify-center' : 'min-h-10 px-3', pref === v ? 'bg-brand text-brand-contrast' : 'text-muted hover:text-brand')}>
          <Icon size={16} aria-hidden />{!compact && label}
        </button>
      ))}
    </div>
  )
}
