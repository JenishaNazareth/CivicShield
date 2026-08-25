import { NextResponse } from 'next/server'
import { signOutStaff } from '@/lib/server/staff-auth'

export async function POST() {
  await signOutStaff()
  return NextResponse.json({ ok: true })
}
