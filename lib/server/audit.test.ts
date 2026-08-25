import { describe, expect, it } from 'vitest'
import { eventHash } from './audit'

describe('audit integrity', () => {
  it('chains events with the previous hash', () => {
    const first = { id: 'a', complaintId: 'c', actorId: 'u', action: 'SUBMITTED', metadata: { safe: true }, createdAt: new Date('2026-08-23T10:00:00.000Z') }
    const second = { id: 'b', complaintId: 'c', actorId: 'u', action: 'ASSIGNED', metadata: { investigatorId: 'i' }, createdAt: new Date('2026-08-23T10:01:00.000Z') }
    const firstHash = eventHash(first, null)
    const secondHash = eventHash(second, firstHash)
    expect(secondHash).not.toBe(firstHash)
    expect(eventHash(second, firstHash)).toBe(secondHash)
    expect(eventHash(second, null)).not.toBe(secondHash)
  })
})
