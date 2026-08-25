import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireCoordinator } from '@/lib/server/authorization'
import { db } from '@/lib/server/db'

const bodySchema = z.object({ investigatorId: z.string().cuid() })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireCoordinator()
    const { id } = await params
    const body = bodySchema.parse(await request.json())
    const investigator = await db.user.findFirst({ where: { id: body.investigatorId, role: 'INVESTIGATOR', active: true }, select: { id: true } })
    if (!investigator) return NextResponse.json({ error: 'Investigator unavailable.' }, { status: 400 })
    const complaint = await db.complaint.findUnique({ where: { id }, select: { id: true, assignedToId: true } })
    if (!complaint) return NextResponse.json({ error: 'Complaint not found.' }, { status: 404 })
    await db.$transaction(async (tx) => {
      await tx.complaint.update({ where: { id }, data: { assignedToId: investigator.id, status: 'ASSIGNED' } })
      await tx.auditEvent.create({ data: { complaintId: id, actorId: actor.id, action: 'ASSIGNED', metadata: { previousAssignee: complaint.assignedToId, investigatorId: investigator.id }, previousHash: null, eventHash: `${Date.now()}-${id}` } })
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
  }
}
