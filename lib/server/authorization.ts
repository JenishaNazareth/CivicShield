import 'server-only'

import { Role } from '@prisma/client'
import { forbidden, unauthorized } from 'next/navigation'
import { getStaffSession } from './staff-auth'

export function canCoordinate(role: Role) { return role === Role.ADMIN || role === Role.SUPER_ADMIN }
export function canDecryptComplaint(role: Role, assignedUserId: string | null, actorUserId: string) { return role === Role.INVESTIGATOR && assignedUserId === actorUserId }
export function canVerifyAudit(role: Role) { return role === Role.SUPER_ADMIN }
export function canViewPublicProgress(tokenVerified: boolean) { return tokenVerified }

export async function requireStaff() {
  const user = await getStaffSession()
  if (!user) unauthorized()
  return user
}

export async function requireCoordinator() {
  const user = await requireStaff()
  if (!canCoordinate(user.role)) forbidden()
  return user
}

export async function requireSuperAdmin() {
  const user = await requireStaff()
  if (user.role !== Role.SUPER_ADMIN) forbidden()
  return user
}

export async function requireAssignedInvestigator(assignedToId: string | null) {
  const user = await requireStaff()
  if (user.role !== Role.INVESTIGATOR || assignedToId !== user.id) forbidden()
  return user
}
