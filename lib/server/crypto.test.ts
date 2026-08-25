import { generateKeyPairSync } from 'node:crypto'
import { describe, expect, it, beforeAll } from 'vitest'

beforeAll(() => {
  const keys = generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } })
  process.env.GRIEVANCE_MASTER_PUBLIC_KEY = keys.publicKey
  process.env.GRIEVANCE_MASTER_PRIVATE_KEY = keys.privateKey
})

describe('complaint encryption', () => {
  it('round-trips sensitive payloads with hybrid encryption', async () => {
    const { encryptSensitive, decryptSensitive, verifyKeyPair } = await import('./crypto')
    const payload = { description: 'Confidential report', contact: null }
    expect(verifyKeyPair()).toBe(true)
    expect(decryptSensitive(encryptSensitive(payload))).toEqual(payload)
  })

  it('hashes tracking tokens deterministically without storing plaintext', async () => {
    const { hashToken } = await import('./crypto')
    expect(hashToken('CS-example-token')).toBe(hashToken('CS-example-token'))
    expect(hashToken('CS-example-token')).not.toContain('CS-example-token')
  })
})
