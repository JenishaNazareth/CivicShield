import 'server-only'

import { createHash } from 'node:crypto'
import { db } from './db'

function canonical(value: unknown) { return JSON.stringify(value, Object.keys((value ?? {}) as object).sort()) }

export function eventHash(input: { id: string; complaintId: string | null; actorId: string | null; action: string; metadata: unknown; createdAt: Date }, previousHash: string | null) {
  return createHash('sha256').update(`${previousHash ?? ''}|${input.id}|${input.complaintId ?? ''}|${input.actorId ?? ''}|${input.action}|${canonical(input.metadata)}|${input.createdAt.toISOString()}`).digest('hex')
}

export async function verifyAuditIntegrity() {
  const events = await db.auditEvent.findMany({ orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] })
  let previousHash: string | null = null
  for (const event of events) {
    const expected = eventHash(event, previousHash)
    if (expected !== event.eventHash || event.previousHash !== previousHash) return { valid: false, checked: events.indexOf(event) + 1 }
    previousHash = event.eventHash
  }
  return { valid: true, checked: events.length }
}
