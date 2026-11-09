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
function getOptimizedDatabaseUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;
  let url = rawUrl;
  const separator = url.includes('?') ? '&' : '?';
  const paramsToAdd: string[] = [];
  if (!url.includes('connect_timeout=')) paramsToAdd.push('connect_timeout=30');
  if (!url.includes('pool_timeout=')) paramsToAdd.push('pool_timeout=30');
  if (!url.includes('connection_limit=')) paramsToAdd.push('connection_limit=10');
  if (paramsToAdd.length > 0) {
    url = `${url}${separator}${paramsToAdd.join('&')}`;
  }
  return url;
}

const optimizedUrl = getOptimizedDatabaseUrl();

export const prisma: PrismaClient =
  global.__prismaInstance__ ||
  new PrismaClient({
    ...(optimizedUrl ? { datasources: { db: { url: optimizedUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prismaInstance__ = prisma;
}

export default prisma;
