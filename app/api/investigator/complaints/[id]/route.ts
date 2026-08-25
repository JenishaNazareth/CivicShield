import { NextResponse } from 'next/server'
import { requireStaff } from '@/lib/server/authorization'
import { decryptSensitive } from '@/lib/server/crypto'
import { db } from '@/lib/server/db'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const investigator = await requireStaff()
    if (investigator.role !== 'INVESTIGATOR') return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
    const complaint = await db.complaint.findFirst({ where: { id, assignedToId: investigator.id }, include: { encryptedPayload: true, events: { orderBy: { createdAt: 'asc' } }, notes: { orderBy: { createdAt: 'asc' }, select: { id: true, ciphertext: true, iv: true, authTag: true, wrappedKey: true, createdAt: true, author: { select: { displayName: true } } } }, messages: { orderBy: { createdAt: 'asc' }, select: { id: true, senderType: true, ciphertext: true, iv: true, authTag: true, wrappedKey: true, createdAt: true } }, evidence: { orderBy: { createdAt: 'asc' }, select: { id: true, fileName: true, mimeType: true, byteSize: true, sha256: true, createdAt: true } } } })
    if (!complaint) return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
    const details = complaint.encryptedPayload ? decryptSensitive<{ description?: string; evidenceSummary?: string }>(complaint.encryptedPayload) : {}
    const notes = complaint.notes.map((note) => ({ id: note.id, author: note.author, createdAt: note.createdAt, body: decryptSensitive<string>(note) }))
    const messages = complaint.messages.map((message) => ({ id: message.id, senderType: message.senderType, createdAt: message.createdAt, body: decryptSensitive<string>(message) }))
    return NextResponse.json({ complaint: { id: complaint.id, referenceCode: complaint.referenceCode, category: complaint.category, priority: complaint.priority, status: complaint.status, submittedAt: complaint.submittedAt, updatedAt: complaint.updatedAt, details, events: complaint.events, notes, messages, evidence: complaint.evidence }, actor: { id: investigator.id, displayName: investigator.displayName } })
  } catch {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
  }
}
