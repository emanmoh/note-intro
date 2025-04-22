// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Initialize prisma client instance as a singleton
const prisma = new PrismaClient();

export { prisma };
