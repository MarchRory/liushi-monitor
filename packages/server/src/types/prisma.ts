import { PrismaClient } from '.prisma/client'

export type PrismaTransactionClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0]