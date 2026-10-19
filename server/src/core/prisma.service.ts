import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prismaInstance__: PrismaClient | undefined;
}

/**
 * Singleton Prisma Client Instance
 * Đảm bảo toàn bộ backend chỉ dùng chung 1 Connection Pool duy nhất (5-10 kết nối),
 * triệt tiêu hoàn toàn nguy cơ cạn kiệt kết nối MySQL (ER_CON_COUNT_ERROR: Too many connections).
 */
export const prisma: PrismaClient =
  global.__prismaInstance__ ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prismaInstance__ = prisma;
}

export default prisma;
