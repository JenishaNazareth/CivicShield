import 'server-only'
import { createCipheriv, createDecipheriv, createHash, createPrivateKey, createPublicKey, privateDecrypt, publicEncrypt, randomBytes } from 'node:crypto'

const RSA_OAEP = { key: process.env.GRIEVANCE_MASTER_PUBLIC_KEY ?? '', oaepHash: 'sha256' } as const

function requireKeyMaterial() {
  if (!process.env.GRIEVANCE_MASTER_PRIVATE_KEY || !process.env.GRIEVANCE_MASTER_PUBLIC_KEY) throw new Error('Server encryption key material is not configured')
}

export function createTrackingToken() {
  const token = `CS-${randomBytes(18).toString('base64url').toUpperCase()}`
  return { token, hash: hashToken(token) }
}

export function hashToken(token: string) {
  return createHash('sha256').update(token.trim()).digest('hex')
}

export function encryptSensitive(value: unknown) {
  requireKeyMaterial()
  const plaintext = Buffer.from(JSON.stringify(value), 'utf8')
  const dataKey = randomBytes(32)
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', dataKey, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const authTag = cipher.getAuthTag()
  const wrappedKey = publicEncrypt(RSA_OAEP, dataKey)
  return { ciphertext: ciphertext.toString('base64'), iv: iv.toString('base64'), authTag: authTag.toString('base64'), wrappedKey: wrappedKey.toString('base64') }
}

export function decryptSensitive<T>(payload: { ciphertext: string; iv: string; authTag: string; wrappedKey: string }): T {
  requireKeyMaterial()
  const key = privateDecrypt({ key: createPrivateKey(process.env.GRIEVANCE_MASTER_PRIVATE_KEY!), oaepHash: 'sha256' }, Buffer.from(payload.wrappedKey, 'base64'))
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(payload.authTag, 'base64'))
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(payload.ciphertext, 'base64')), decipher.final()]).toString('utf8')) as T
}

export function verifyKeyPair() {
  requireKeyMaterial()
  const probe = randomBytes(32)
  const encrypted = publicEncrypt(RSA_OAEP, probe)
  const decrypted = privateDecrypt({ key: createPrivateKey(process.env.GRIEVANCE_MASTER_PRIVATE_KEY!), oaepHash: 'sha256' }, encrypted)
  return probe.equals(decrypted) && createPublicKey(process.env.GRIEVANCE_MASTER_PUBLIC_KEY!).asymmetricKeyDetails?.modulusLength === 2048
}
