import { NextResponse } from 'next/server'
import { z } from 'zod'
import { signInStaff } from '@/lib/server/staff-auth'

const schema = z.object({ email: z.string().email().max(254), password: z.string().min(8).max(200) })

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json())
    const user = await signInStaff(input.email, input.password)
    if (!user) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    return NextResponse.json({ role: user.role })
  } catch { return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 }) }
}
