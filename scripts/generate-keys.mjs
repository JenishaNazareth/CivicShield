#!/usr/bin/env node

import { generateKeyPairSync } from "node:crypto"

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
})

const toEnvValue = (value) => value.replace(/\r?\n/g, "\\n")

console.log("Generated a fresh RSA-2048 key pair using Node.js crypto.")
console.log("Paste these values into server-side environment variables only.\n")
console.log(`GRIEVANCE_MASTER_PUBLIC_KEY=${toEnvValue(publicKey)}`)
console.log(`GRIEVANCE_MASTER_PRIVATE_KEY=${toEnvValue(privateKey)}`)
console.log("\nSecurity notes:")
console.log("- Keep GRIEVANCE_MASTER_PRIVATE_KEY out of source control and frontend-exposed variables.")
console.log("- Store the private key in the backend environment or secret manager only.")
console.log("- Use the public key to wrap per-complaint AES-256-GCM keys; never encrypt large content with RSA.")
console.log("- Generate a new pair for each environment and rotate it through a planned key-rotation process.")
