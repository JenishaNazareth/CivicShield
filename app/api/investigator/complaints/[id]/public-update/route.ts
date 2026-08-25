import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAssignedInvestigator } from '@/lib/server/authorization'
import { db } from '@/lib/server/db'

const schema = z.object({ message: z.string().trim().min(1).max(2000) })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const actor = await requireAssignedInvestigator(id)
    const { message } = schema.parse(await request.json())
    const event = await db.publicTimelineEvent.create({ data: { complaintId: id, title: 'Investigation update', publicUpdate: message } })
    await db.auditEvent.create({ data: { complaintId: id, actorId: actor.id, action: 'PUBLIC_UPDATE_SENT', metadata: { eventId: event.id }, previousHash: null, eventHash: `${Date.now()}-${event.id}` } })
    return NextResponse.json({ event: { id: event.id, title: event.title, publicUpdate: event.publicUpdate, createdAt: event.createdAt } }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
  }
}
