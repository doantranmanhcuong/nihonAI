import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../core/prisma.service';
import { ResponseFormatter } from '../core/api-response';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_in_env';

let isMaintenanceCached = false;
let lastCheck = 0;
let isRefreshing = false;
const CACHE_TTL = 5 * 60 * 1000; // 5 phút (Admin đổi cài đặt sẽ gọi invalidateMaintenanceCache ngay lập tức)

export const invalidateMaintenanceCache = (): void => {
  lastCheck = 0;
};

const refreshMaintenanceState = async (): Promise<void> => {
  if (isRefreshing) return;
  isRefreshing = true;
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'maintenance_mode' } });
    isMaintenanceCached = setting?.value === 'true';
    lastCheck = Date.now();
  } catch {
    // Giữ nguyên trạng thái cache cũ nếu DB tạm thời chậm
  } finally {
    isRefreshing = false;
  }
};

export const checkMaintenance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Luôn cho phép các route Admin, Auth và Health (để Admin có thể đăng nhập/xác thực khi hệ thống bảo trì)
  if (
    req.path.startsWith('/api/admin') ||
    req.path.startsWith('/api/auth') ||
    req.path.startsWith('/api/health') ||
    req.path.startsWith('/api/gateway')
  ) {
    next();
    return;
  }

  try {
    const now = Date.now();
    if (lastCheck === 0) {
      // Lần đầu tiên hoặc vừa được Admin cập nhật -> đồng bộ 1 lần
      await refreshMaintenanceState();
    } else if (now - lastCheck > CACHE_TTL) {
      // Stale-While-Revalidate: làm mới bất đồng bộ dưới nền, không chặn request của người dùng (< 0.01ms)
      refreshMaintenanceState();
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
