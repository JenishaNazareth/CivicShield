import 'server-only'

import { cookies, headers } from 'next/headers'
import { createHash, randomBytes } from 'node:crypto'
import { compare } from 'bcryptjs'
import { db } from './db'

const COOKIE = 'civicshield_staff_session'
const SESSION_DAYS = 8
const LOGIN_WINDOW_MS = 10 * 60 * 1000
const MAX_LOGIN_ATTEMPTS = 8
const attempts = new Map<string, { count: number; resetAt: number }>()

function digest(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

async function clientKey(email: string) {
  const h = await headers()
  return `${h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'}:${normalizeEmail(email)}`
}

function checkRateLimit(key: string) {
  const now = Date.now()
  const current = attempts.get(key)
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
    return true
  }
  if (current.count >= MAX_LOGIN_ATTEMPTS) return false
  current.count += 1
  return true
}

export async function signInStaff(email: string, password: string) {
  if (!checkRateLimit(await clientKey(email))) return null
  const user = await db.user.findUnique({ where: { email: normalizeEmail(email) } })
  if (!user || !user.active || !(await compare(password, user.passwordHash))) return null

  const token = randomBytes(32).toString('base64url')
  await db.$transaction([
    db.session.deleteMany({ where: { userId: user.id, OR: [{ expiresAt: { lte: new Date() } }, { revokedAt: { not: null } }] } }),
    db.session.create({ data: { tokenHash: digest(token), userId: user.id, expiresAt: new Date(Date.now() + SESSION_DAYS * 86400000) } }),
    db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }),
  ])

  const jar = await cookies()
  jar.set(COOKIE, token, { httpOnly: true, secure: true, sameSite: 'none', path: '/', maxAge: SESSION_DAYS * 86400 })
  return { id: user.id, displayName: user.displayName, role: user.role }
}

export async function getStaffSession() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  const session = await db.session.findUnique({ where: { tokenHash: digest(token) }, include: { user: { select: { id: true, email: true, displayName: true, role: true, active: true, createdAt: true, updatedAt: true, lastLoginAt: true } } } })
  if (!session || session.revokedAt || session.expiresAt <= new Date() || !session.user.active) return null
  await db.session.update({ where: { id: session.id }, data: { lastUsedAt: new Date() } })
  return session.user
}

export async function signOutStaff() {
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (token) await db.session.updateMany({ where: { tokenHash: digest(token), revokedAt: null }, data: { revokedAt: new Date() } })
  jar.set(COOKIE, '', { httpOnly: true, secure: true, sameSite: 'none', path: '/', maxAge: 0 })
}

export { COOKIE }
