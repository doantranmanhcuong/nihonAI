import rateLimit from 'express-rate-limit';

// Chống Brute Force chung cho các API Auth (Đăng nhập, Đăng ký, Quên MK)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: process.env.NODE_ENV === 'production' ? 20 : 500, // 500 requests trong môi trường phát triển để test thoải mái
  message: {
    success: false,
    message: 'Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Không giới hạn trên localhost khi phát triển
    const ip = req.ip || req.connection?.remoteAddress || '';
    return process.env.NODE_ENV !== 'production' && (ip === '127.0.0.1' || ip === '::1' || ip.includes('127.0.0.1') || ip === '::ffff:127.0.0.1');
  }
});

