import { PrismaClient, Role, ComplaintStatus, Priority } from '@prisma/client'
import { createHash } from 'node:crypto'
import { hash } from 'bcryptjs'
import { encryptSensitive } from '../lib/server/crypto'

const db = new PrismaClient()

const staff = [
  { email: 'admin@college.demo', displayName: 'College Administrator', role: Role.ADMIN, password: 'Admin@12345' },
  { email: 'investigator1@college.demo', displayName: 'Investigator One', role: Role.INVESTIGATOR, password: 'Investigator@12345' },
  { email: 'investigator2@college.demo', displayName: 'Investigator Two', role: Role.INVESTIGATOR, password: 'Investigator@12345' },
  { email: 'superadmin@college.demo', displayName: 'Super Administrator', role: Role.SUPER_ADMIN, password: 'SuperAdmin@12345' },
]

async function main() {
  const users = []
  for (const account of staff) {
    const user = await db.user.upsert({
      where: { email: account.email },
      update: { displayName: account.displayName, role: account.role, active: true, passwordHash: await hash(account.password, 12) },
      create: { email: account.email, displayName: account.displayName, role: account.role, passwordHash: await hash(account.password, 12) },
    })
    users.push(user)
  }

  const investigator = users.find((user) => user.email === 'investigator1@college.demo')!
  const existing = await db.complaint.findUnique({ where: { referenceCode: 'GR-2026-A81D4C2E' } })
  if (!existing) {
    await db.complaint.create({
      data: {
        referenceCode: 'GR-2026-A81D4C2E', trackingTokenHash: createHash('sha256').update('demo-tracking-token').digest('hex'), category: 'Harassment or discrimination', generalLocation: 'North campus', safetyFlag: false, status: ComplaintStatus.INVESTIGATING, priority: Priority.HIGH, assignedToId: investigator.id,
        encryptedPayload: { create: encryptSensitive({ description: 'Demo data: repeated discriminatory remarks in a group project setting.', evidenceSummary: 'No evidence attached in demo data.' }) },
        events: { create: [{ title: 'Grievance received', publicUpdate: 'Your encrypted submission was received by the redressal office.' }, { title: 'Assigned for review', publicUpdate: 'A designated investigator has been assigned to review your concern.' }, { title: 'Investigation in progress', publicUpdate: 'Your concern is under active review by the assigned investigator.' }] },
      },
    })
  }
  console.log('Development staff accounts seeded.')
}

main().finally(() => db.$disconnect())

export { staff }
