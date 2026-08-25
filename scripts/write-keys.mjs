import { generateKeyPairSync } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
})

const envPath = '.env'
let existing = existsSync(envPath) ? readFileSync(envPath, 'utf8') : ''

// Remove any old key lines/blocks
existing = existing
  .split('\n')
  .filter(line => !line.startsWith('GRIEVANCE_MASTER_'))
  .join('\n')
  .trim()

const block = [
  existing,
  '',
  `GRIEVANCE_MASTER_PUBLIC_KEY="${publicKey.trim()}"`,
  `GRIEVANCE_MASTER_PRIVATE_KEY="${privateKey.trim()}"`,
  '',
].join('\n')

writeFileSync(envPath, block)
console.log('Keys generated and written directly to .env — no manual editing needed.')