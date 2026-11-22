import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cx } from '../../lib/cx'

/** Dialogue natif : focus piégé, fermeture à Échap et retour du focus gérés par le navigateur. */
export default function Modal({ open, onClose, title, children, size = 'md', hideClose = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'md' | 'lg'; hideClose?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
      className={cx('m-auto w-[min(94vw,var(--w))] rounded-card border border-line bg-surface p-0 text-ink shadow-card', open && 'animate-pop-in')}
      style={{ ['--w' as string]: size === 'lg' ? '44rem' : '30rem' }}
    >
      {open && (
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 id={titleId} className="font-display text-2xl text-brand">{title}</h2>
            {!hideClose && <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-control p-2 text-muted hover:bg-surface-raised"><X size={20} aria-hidden /></button>}
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}
