import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/server/db'
import { createTrackingToken, encryptSensitive } from '@/lib/server/crypto'

const submissionSchema = z.object({ category: z.string().min(2).max(80), generalLocation: z.string().min(2).max(160), description: z.string().min(20).max(20000), safetyFlag: z.boolean().default(false), priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).default('NORMAL') })

export async function POST(request: Request) {
  try {
    const input = submissionSchema.parse(await request.json())
    const { token, hash } = createTrackingToken()
    const referenceCode = `GR-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    const payload = encryptSensitive({ description: input.description })
    const complaint = await db.complaint.create({ data: { referenceCode, trackingTokenHash: hash, category: input.category, generalLocation: input.generalLocation, safetyFlag: input.safetyFlag, priority: input.priority, encryptedPayload: { create: payload }, events: { create: { title: 'Grievance received', publicUpdate: 'Your encrypted submission was received by the redressal office.' } } }, select: { referenceCode: true } })
    return NextResponse.json({ referenceCode: complaint.referenceCode, trackingToken: token }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unable to process this submission.' }, { status: 400 })
  }
}
