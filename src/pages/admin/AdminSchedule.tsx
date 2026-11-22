import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import type { Employee, Shift } from '../../types'
import { dispatch, useAppState } from '../../state/store'
import { removeShift, upsertShift } from '../../state/actions'
import { DAY_LABEL, ROLE_LABEL } from '../../lib/labels'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import Modal from '../../components/ui/Modal'

interface Target { employee: Employee; day: number; shift?: Shift }

function ShiftForm({ target, onClose }: { target: Target; onClose: () => void }) {
  const [start, setStart] = useState(target.shift?.start ?? '08:00')
  const [end, setEnd] = useState(target.shift?.end ?? '16:00')
  const [error, setError] = useState<string | undefined>()
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const r = dispatch(upsertShift({ id: target.shift?.id, employeeId: target.employee.id, dayOfWeek: target.day, start, end }))
    if (!r.ok) { setError(r.error); return }
    onClose()
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <p className="text-sm text-muted">{target.employee.name} — {DAY_LABEL[target.day]}</p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Début">{(p) => <input {...p} type="time" value={start} onChange={(e) => setStart(e.target.value)} />}</Field>
        <Field label="Fin" error={error}>{(p) => <input {...p} type="time" value={end} onChange={(e) => setEnd(e.target.value)} />}</Field>
      </div>
      <div className="flex justify-between gap-3 pt-2">
        {target.shift ? <Button variant="danger" onClick={() => { dispatch(removeShift(target.shift!.id)); onClose() }}>Supprimer le créneau</Button> : <span />}
        <span className="flex gap-3"><Button variant="ghost" onClick={onClose}>Annuler</Button><Button type="submit">Enregistrer</Button></span>
      </div>
    </form>
  )
}

export default function AdminSchedule() {
  const { employees, shifts } = useAppState()
  const [target, setTarget] = useState<Target | null>(null)
  const staff = employees.filter((e) => e.active)
  return (
    <div className="pb-10">
      <PageHeader title="Horaires" subtitle="Planning hebdomadaire de démonstration. Sélectionnez une case pour ajouter ou modifier un créneau." />
      <div className="px-4 md:px-8">
        {staff.length === 0 ? <p role="status" className="rounded-card border border-line bg-surface p-8 text-center text-muted">Aucun employé actif à planifier.</p> : (
          <div className="overflow-x-auto rounded-card border border-line bg-surface">
            <table className="w-full min-w-[56rem] border-collapse text-sm">
              <caption className="sr-only">Planning hebdomadaire des employés actifs</caption>
              <thead><tr className="text-left text-muted"><th scope="col" className="p-3">Employé</th>{[1, 2, 3, 4, 5, 6, 7].map((d) => <th key={d} scope="col" className="p-3">{DAY_LABEL[d]}</th>)}</tr></thead>
              <tbody className="divide-y divide-line">
                {staff.map((e) => (
                  <tr key={e.id}>
                    <th scope="row" className="p-3 text-left font-semibold">{e.name}<span className="block text-xs font-normal text-muted">{ROLE_LABEL[e.role]}</span></th>
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => {
                      const s = shifts.find((x) => x.employeeId === e.id && x.dayOfWeek === d)
                      return (
                        <td key={d} className="p-1.5">
                          <button type="button" onClick={() => setTarget({ employee: e, day: d, shift: s })} aria-label={s ? `${e.name}, ${DAY_LABEL[d]} : ${s.start} à ${s.end}, modifier` : `${e.name}, ${DAY_LABEL[d]} : ajouter un créneau`}
                            className={s ? 'min-h-11 w-full rounded-control border border-brand-strong/50 bg-accent-soft px-2 font-display text-brand hover:border-brand' : 'flex min-h-11 w-full items-center justify-center rounded-control border border-dashed border-line text-muted hover:border-brand hover:text-brand'}>
                            {s ? `${s.start}–${s.end}` : <Plus size={16} aria-hidden />}
                          </button>
                        </td>)
                    })}
                  </tr>))}
              </tbody>
            </table>
          </div>)}
      </div>
      <Modal open={!!target} onClose={() => setTarget(null)} title={target?.shift ? 'Modifier le créneau' : 'Nouveau créneau'}>
        {target && <ShiftForm key={`${target.employee.id}-${target.day}`} target={target} onClose={() => setTarget(null)} />}
      </Modal>
    </div>
  )
}
