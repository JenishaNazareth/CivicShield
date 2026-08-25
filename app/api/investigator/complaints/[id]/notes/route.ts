import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAssignedInvestigator } from '@/lib/server/authorization'
import { encryptSensitive } from '@/lib/server/crypto'
import { db } from '@/lib/server/db'

const schema = z.object({ body: z.string().trim().min(1).max(10000) })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const actor = await requireAssignedInvestigator(id)
    const { body } = schema.parse(await request.json())
    const encrypted = encryptSensitive(body)
    const note = await db.internalNote.create({ data: { complaintId: id, authorId: actor.id, ...encrypted } })
    return NextResponse.json({ note: { id: note.id, createdAt: note.createdAt } }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
  }
}
