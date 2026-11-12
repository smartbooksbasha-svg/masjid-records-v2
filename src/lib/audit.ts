import { createStore, uid } from './storeFactory'

export interface AuditEntry {
  id: string
  at: string
  actor: string
  action: string
  detail: string
}

const CAP = 1000

export const auditEntries = createStore<AuditEntry[]>('mkr_audit_v2', [])

export const audit = {
  log(actor: string, action: string, detail: string) {
    const entry: AuditEntry = { id: uid('A'), at: new Date().toISOString(), actor, action, detail }
    auditEntries.update((list) => [entry, ...list].slice(0, CAP))
  },
  clear() {
    auditEntries.set([])
  },
}
