import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/server/db'
import { hashToken } from '@/lib/server/crypto'

const tokenSchema = z.object({ token: z.string().min(20).max(160) })

export async function POST(request: Request) {
  try {
    const { token } = tokenSchema.parse(await request.json())
    const complaint = await db.complaint.findUnique({
      where: { trackingTokenHash: hashToken(token) },
      select: { referenceCode: true, status: true, priority: true, category: true, submittedAt: true, updatedAt: true, events: { select: { title: true, publicUpdate: true, createdAt: true }, orderBy: { createdAt: 'asc' } } },
    })
    if (!complaint) return NextResponse.json({ error: 'We could not verify that tracking token.' }, { status: 401 })
    return NextResponse.json({ complaint })
  } catch {
    return NextResponse.json({ error: 'We could not verify that tracking token.' }, { status: 400 })
  }
}
