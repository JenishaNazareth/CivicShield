import { NextResponse } from 'next/server'
import { requireCoordinator } from '@/lib/server/authorization'
import { verifyAuditIntegrity } from '@/lib/server/audit'

export async function POST() {
  try {
    const actor = await requireCoordinator()
    const result = await verifyAuditIntegrity()
    return NextResponse.json({ ...result, actor: actor.id, message: result.valid ? 'Audit chain is valid.' : 'Audit integrity violation detected.' })
  } catch {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
  }
}
