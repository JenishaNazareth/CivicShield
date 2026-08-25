import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getStaffSession } from '@/lib/server/staff-auth'

export default async function StaffManagementPage() {
  const user = await getStaffSession()
  if (!user || user.role !== 'SUPER_ADMIN') redirect('/staff/login')
  return <main className="min-h-screen bg-background px-6 py-12"><div className="mx-auto max-w-5xl"><Link href="/admin" className="text-sm text-primary">Back to admin</Link><h1 className="mt-8 text-4xl font-semibold tracking-tight">Staff management</h1><p className="mt-3 max-w-2xl text-muted-foreground">Create, disable, and review authorized institutional staff accounts. Public complainants never appear in this directory.</p><div className="mt-10 rounded-2xl border border-border bg-card p-6"><h2 className="text-xl font-semibold">Account controls</h2><p className="mt-2 text-sm text-muted-foreground">The backend staff API is protected by SUPER_ADMIN authorization and validates institutional email addresses, role, and temporary password requirements.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/admin" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Open coordinator dashboard</Link><Link href="/staff/login" className="rounded-lg border border-border px-4 py-2 text-sm font-semibold">Sign out / switch account</Link></div></div></div></main>
}
