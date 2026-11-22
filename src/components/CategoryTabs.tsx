import type { Category } from '../types'
import { cx } from '../lib/cx'

export default function CategoryTabs({ categories, value, onChange, big = false }: { categories: Category[]; value: string; onChange: (id: string) => void; big?: boolean }) {
  const items = [{ id: 'all', label: 'Tout' }, ...categories]
  return (
    <div role="group" aria-label="Catégories" className="flex flex-wrap gap-2">
      {items.map((c) => (
        <button key={c.id} type="button" aria-pressed={value === c.id} onClick={() => onChange(c.id)}
          className={cx('label-caps rounded-control border transition-colors', big ? 'min-h-14 px-6 text-sm' : 'min-h-10 px-4',
            value === c.id ? 'border-brand bg-brand text-brand-contrast' : 'border-line text-muted hover:border-brand-strong hover:text-brand')}>
          {c.label}
        </button>
      ))}
    </div>
  )
}
