import 'server-only'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; pool?: Pool }
export const db = globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })
export const pool = globalForPrisma.pool ?? new Pool({ connectionString: process.env.DATABASE_URL })
if (process.env.NODE_ENV !== 'production') { globalForPrisma.prisma = db; globalForPrisma.pool = pool }
