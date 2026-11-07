import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../core/prisma.service';
import { ResponseFormatter } from '../core/api-response';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_in_env';

let isMaintenanceCached = false;
let lastCheck = 0;
const CACHE_TTL = 30000; // 30 seconds

export const invalidateMaintenanceCache = (): void => {
  lastCheck = 0;
};

export const checkMaintenance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Luôn cho phép các route Admin và Auth (để Admin có thể đăng nhập/xác thực khi hệ thống bảo trì)
  if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/auth')) {
    next();
    return;
  }

  try {
    const now = Date.now();
    if (now - lastCheck > CACHE_TTL) {
      const setting = await prisma.systemSetting.findUnique({ where: { key: 'maintenance_mode' } });
      isMaintenanceCached = setting?.value === 'true';
      lastCheck = now;
    }

    if (isMaintenanceCached) {
      // Kiểm tra nếu người gọi có Bearer Token là ADMIN thì cho phép đi qua toàn bộ hệ thống để kiểm thử
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string };
          if (decoded?.userId) {
            const u = await prisma.user.findUnique({
              where: { id: decoded.userId },
              select: { role: true }
            });
            if (u?.role === 'ADMIN') {
              next();
              return;
            }
          }
        } catch {}
      }

      res
        .status(503)
        .json(
          ResponseFormatter.error(
            'Hệ thống đang bảo trì để nâng cấp. Vui lòng quay lại sau ít phút.',
            null,
            'maintenance-middleware'
          )
        );
      return;
    }

    next();
  } catch (err) {
    next();
  }
};
