import { useState, type FormEvent } from 'react'
import { Pencil, Plus } from 'lucide-react'
import type { Employee, Role } from '../../types'
import { dispatch, useAppState } from '../../state/store'
import { upsertEmployee } from '../../state/actions'
import { formatDateTime } from '../../lib/format'
import { ROLE_LABEL } from '../../lib/labels'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import Modal from '../../components/ui/Modal'
import Toggle from '../../components/ui/Toggle'

function EmployeeForm({ employee, onClose }: { employee: Employee | null; onClose: () => void }) {
  const [name, setName] = useState(employee?.name ?? '')
  const [role, setRole] = useState<Role>(employee?.role ?? 'caissier')
  const [active, setActive] = useState(employee?.active ?? true)
  const [error, setError] = useState<string | undefined>()
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Le nom est obligatoire.'); return }
    const r = dispatch(upsertEmployee({ id: employee?.id, name, role, active }))
    if (!r.ok) { setError(r.error); return }
    onClose()
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label="Nom *" error={error}>{(p) => <input {...p} value={name} onChange={(e) => setName(e.target.value)} />}</Field>
      <Field label="Rôle de démonstration" hint="Information d’organisation : ce rôle ne constitue pas une protection d’accès.">{(p) => <select {...p} value={role} onChange={(e) => setRole(e.target.value as Role)}>{Object.entries(ROLE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>}</Field>
      <Toggle checked={active} onChange={setActive} label="Employé actif" />
      <div className="flex justify-end gap-3 pt-2"><Button variant="ghost" onClick={onClose}>Annuler</Button><Button type="submit">{employee ? 'Enregistrer' : 'Ajouter'}</Button></div>
    </form>
  )
}

export default function AdminEmployees() {
  const { employees, activity } = useAppState()
  const [editing, setEditing] = useState<Employee | 'new' | null>(null)
  const nameOf = (id?: string) => employees.find((e) => e.id === id)?.name
  return (
    <div className="pb-10">
      <PageHeader title="Employés" subtitle="Équipe fictive de démonstration." actions={<Button onClick={() => setEditing('new')}><Plus size={18} aria-hidden /> Nouvel employé</Button>} />
      <div className="space-y-6 px-4 md:px-8">
        {employees.length === 0 ? <p role="status" className="rounded-card border border-line bg-surface p-8 text-center text-muted">Aucun employé enregistré.</p> : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {employees.map((e) => (
              <li key={e.id} className="rounded-card border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-2"><div><p className="font-semibold text-ink">{e.name}</p><p className="text-sm text-muted">{ROLE_LABEL[e.role]}</p></div>
                  <button type="button" onClick={() => setEditing(e)} aria-label={`Modifier ${e.name}`} className="rounded-control p-2 text-muted hover:bg-surface-raised hover:text-brand"><Pencil size={18} aria-hidden /></button></div>
                <div className="mt-2"><Toggle checked={e.active} onChange={(v) => dispatch(upsertEmployee({ ...e, active: v }))} label={`Statut de ${e.name}`} /></div>
              </li>))}
          </ul>)}
        <section aria-labelledby="journal" className="rounded-card border border-line bg-surface p-5">
          <h2 id="journal" className="font-display text-xl text-ink">Journal d’activité</h2>
          {activity.length === 0 ? <p role="status" className="py-6 text-center text-muted">Aucune activité enregistrée.</p> : (
            <ul className="mt-3 divide-y divide-line text-sm">{activity.slice(0, 20).map((a) => (
              <li key={a.id} className="flex flex-wrap gap-x-4 gap-y-1 py-2"><span className="w-32 text-muted">{formatDateTime(a.at)}</span><span className="flex-1">{a.message}</span><span className="text-muted">{nameOf(a.employeeId) ?? 'Site / borne / système'}</span></li>
            ))}</ul>)}
        </section>
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'Nouvel employé' : 'Modifier l’employé'}>
        {editing && <EmployeeForm key={editing === 'new' ? 'new' : editing.id} employee={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
