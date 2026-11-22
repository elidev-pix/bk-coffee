import { useId, type ReactNode } from 'react'
import { inputCls, labelCls } from '../../lib/ui'

/** Champ de formulaire accessible : label, aide, message d'erreur relié (aria-describedby / aria-invalid). */
export default function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: (p: { id: string; className: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode }) {
  const id = useId()
  const descId = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  return (
    <div>
      <label htmlFor={id} className={labelCls}>{label}</label>
      {children({ id, className: inputCls, 'aria-invalid': !!error, 'aria-describedby': descId })}
      {error ? <p id={`${id}-err`} className="mt-1 text-sm text-danger">{error}</p> : hint ? <p id={`${id}-hint`} className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  )
}
