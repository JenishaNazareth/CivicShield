import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireSuperAdmin } from '@/lib/server/authorization'
import { db } from '@/lib/server/db'

const schema = z.object({ active: z.boolean() })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireSuperAdmin()
    const { id } = await params
    if (id === actor.id) return NextResponse.json({ error: 'You cannot disable your own account.' }, { status: 400 })
    const { active } = schema.parse(await request.json())
    const staff = await db.user.update({ where: { id }, data: { active }, select: { id: true, active: true } })
    if (!active) await db.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } })
    return NextResponse.json({ staff })
  } catch {
    return NextResponse.json({ error: 'Unable to update staff account.' }, { status: 403 })
  }
}
