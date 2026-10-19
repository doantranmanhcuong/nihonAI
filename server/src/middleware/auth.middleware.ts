import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

export interface AuthUserPayload {
  userId: string;
  email: string;
  tokenVersion?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_in_env';
const prisma = new PrismaClient();

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Không tìm thấy mã xác thực. Vui lòng đăng nhập.'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
      expired: true
    });
  }
};

export const optionalAuthenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    // Just ignore invalid tokens for optional routes, or you can throw 401. We'll ignore and proceed as guest.
    next();
  }
};

export const authorizeRole = (roles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      // Check role directly from database to ensure up-to-date permissions and token version
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { role: true, tokenVersion: true }
      });

      if (!user) {
        res.status(401).json({ success: false, message: 'Người dùng không tồn tại' });
        return;
      }

      if (req.user.tokenVersion && user.tokenVersion !== req.user.tokenVersion) {
        res.status(401).json({ success: false, message: 'Phiên đăng nhập đã bị thu hồi' });
        return;
      }

      if (!roles.includes(user.role)) {
        res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập chức năng này' });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi kiểm tra phân quyền' });
    }
  };
};
