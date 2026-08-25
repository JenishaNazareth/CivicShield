import { redirect } from 'next/navigation'
import { getStaffSession } from '@/lib/server/staff-auth'

export default async function InvestigatorDashboardRoute() {
  const user = await getStaffSession()
  if (!user || user.role !== 'INVESTIGATOR') redirect('/staff/login')
  redirect('/staff/investigator')
}
