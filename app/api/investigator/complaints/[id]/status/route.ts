import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAssignedInvestigator } from '@/lib/server/authorization'
import { db } from '@/lib/server/db'

const schema = z.object({ status: z.enum(['INVESTIGATING', 'AWAITING_INFORMATION', 'RESOLVED']) })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const actor = await requireAssignedInvestigator(id)
    const { status } = schema.parse(await request.json())
    const complaint = await db.complaint.update({ where: { id }, data: { status } })
    await db.auditEvent.create({ data: { complaintId: id, actorId: actor.id, action: 'STATUS_CHANGED', metadata: { status }, previousHash: null, eventHash: `${Date.now()}-${id}-${status}` } })
    return NextResponse.json({ complaint: { id: complaint.id, status: complaint.status } })
  } catch {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
  }
}
