import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/server/db'
import { encryptSensitive, hashToken } from '@/lib/server/crypto'

const schema = z.object({ trackingToken: z.string().min(20).max(120), body: z.string().trim().min(1).max(5000) })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const input = schema.parse(await request.json())
    const complaint = await db.complaint.findFirst({ where: { id, trackingTokenHash: hashToken(input.trackingToken) }, select: { id: true } })
    if (!complaint) return NextResponse.json({ error: 'Unable to verify complaint.' }, { status: 403 })
    const encrypted = encryptSensitive(input.body)
    const message = await db.encryptedMessage.create({ data: { complaintId: id, senderType: 'COMPLAINANT', ...encrypted } })
    return NextResponse.json({ message: { id: message.id, createdAt: message.createdAt, senderType: message.senderType } }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unable to send message.' }, { status: 400 })
  }
}
