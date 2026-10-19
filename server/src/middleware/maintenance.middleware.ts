import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ResponseFormatter } from '../core/api-response';

const prisma = new PrismaClient();

let isMaintenanceCached = false;
let lastCheck = 0;
const CACHE_TTL = 30000; // 30 seconds

export const checkMaintenance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Allow admin routes unconditionally
  if (req.path.startsWith('/api/admin')) {
    next();
    return;
  }
  
  // Allow auth routes related to checking user info
  if (req.path.startsWith('/api/auth/me')) {
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
      res.status(503).json(ResponseFormatter.error('Hệ thống đang bảo trì, vui lòng quay lại sau.', null, 'maintenance-middleware'));
      return;
    }

    next();
  } catch (err) {
    next();
  }
};
