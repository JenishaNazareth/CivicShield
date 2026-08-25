import { NextResponse } from 'next/server'
import { requireCoordinator } from '@/lib/server/authorization'
import { db } from '@/lib/server/db'

export async function GET() {
  try {
    await requireCoordinator()
    const complaints = await db.complaint.findMany({
      select: { id: true, referenceCode: true, category: true, safetyFlag: true, status: true, priority: true, submittedAt: true, updatedAt: true, assignedTo: { select: { displayName: true } }, events: { select: { title: true, publicUpdate: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 10 } },
      orderBy: { updatedAt: 'desc' },
    })
    const counts = complaints.reduce<Record<string, number>>((result, complaint) => { result[complaint.status] = (result[complaint.status] ?? 0) + 1; return result }, {})
    return NextResponse.json({ complaints, counts })
  } catch (error) {
    const status = error instanceof Error && error.message.includes('FORBIDDEN') ? 403 : 401
    return NextResponse.json({ error: 'Not authorized.' }, { status })
  }
}
