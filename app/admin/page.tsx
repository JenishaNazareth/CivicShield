import { redirect } from 'next/navigation'
import { getStaffSession } from '@/lib/server/staff-auth'

export default async function AdminDashboardRoute() {
  const user = await getStaffSession()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) redirect('/staff/login')
  redirect('/staff/admin')
}
