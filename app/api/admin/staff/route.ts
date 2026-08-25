import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import { requireSuperAdmin } from '@/lib/server/authorization'
import { db } from '@/lib/server/db'

const schema = z.object({ displayName: z.string().trim().min(2).max(120), email: z.string().trim().email().endsWith('.edu'), role: z.enum(['ADMIN', 'INVESTIGATOR']), temporaryPassword: z.string().min(12).max(128) })

export async function GET() {
  try {
    await requireSuperAdmin()
    const staff = await db.user.findMany({ select: { id: true, displayName: true, email: true, role: true, active: true, createdAt: true, lastLoginAt: true }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ staff })
  } catch {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
  }
}

export async function POST(request: Request) {
  try {
    await requireSuperAdmin()
    const input = schema.parse(await request.json())
    const staff = await db.user.create({ data: { ...input, email: input.email.toLowerCase(), passwordHash: await hash(input.temporaryPassword, 12) }, select: { id: true, displayName: true, email: true, role: true, active: true } })
    return NextResponse.json({ staff }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unable to create staff account.' }, { status: 400 })
  }
}
