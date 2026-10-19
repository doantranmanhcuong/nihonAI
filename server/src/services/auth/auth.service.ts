import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RedisService } from '../../core/redis.service';
import { OAuth2Client } from 'google-auth-library';
import { mailService } from '../../core/mail.service';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_in_env';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_change_in_env';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy_client_id'; 

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  targetLevel: string;
  avatar: string | null;
  role: string;
  status?: string;
  banReason?: string | null;
  authProvider?: string;
  isEmailVerified?: boolean;
  tokenVersion?: number;
  studyStreak?: number;
  lastStudyDate?: Date | null;
  createdAt: Date;
}

export interface AuthResult {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
  debugCode?: string;
}

function generateTokens(userId: string, email: string, tokenVersion = 1): { accessToken: string; refreshToken: string } {
  const accessToken = jwt.sign({ userId, email, tokenVersion }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId, tokenVersion }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

function sanitizeUser(user: any): UserResponse {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName || user.email.split('@')[0],
    targetLevel: user.targetLevel,
    avatar: user.avatar,
    role: user.role,
    status: user.status,
    banReason: user.banReason,
    authProvider: user.authProvider || 'LOCAL',
    isEmailVerified: !!user.isEmailVerified,
    tokenVersion: user.tokenVersion || 1,
    studyStreak: user.studyStreak || 0,
    lastStudyDate: user.lastStudyDate || null,
    createdAt: user.createdAt
  };
}

export class AuthService {
  static async register(data: any): Promise<AuthResult> {
    
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'allow_registration' } });
    if (setting && setting.value === 'false') {
      throw new Error('Hệ thống hiện đang tạm khóa đăng ký mới.');
    }

    const email = data.email.trim().toLowerCase();
    const password = data.password || '';
    if (!email || !password || password.length < 6) {
      throw new Error('Vui lòng nhập Email hợp lệ và Mật khẩu (tối thiểu 6 ký tự).');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('Email này đã được sử dụng.');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const displayName = data.displayName || email.split('@')[0];
    const targetLevel = data.targetLevel || 'N5';

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        targetLevel,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`,
        authProvider: 'LOCAL',
        isEmailVerified: false
      }
    });

    // Tạo OTP xác thực Email
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const redisKey = `auth:verify-email:${email}`;
    await RedisService.set(redisKey, { otp, userId: newUser.id }, 900); // 15 phút
    
    // Gửi email bất đồng bộ (không await để response nhanh)
    mailService.sendOtpEmail(email, otp).catch(err => console.error(err));

    const tokens = generateTokens(newUser.id, newUser.email, newUser.tokenVersion || 1);
    return { user: sanitizeUser(newUser), ...tokens, debugCode: otp };
  }

  static async verifyEmail(data: { email: string; code: string }): Promise<UserResponse> {
    
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'allow_registration' } });
    if (setting && setting.value === 'false') {
      throw new Error('Hệ thống hiện đang tạm khóa đăng ký mới.');
    }

    const email = data.email.trim().toLowerCase();
    const redisKey = `auth:verify-email:${email}`;
    const cached = await RedisService.get<{ otp: string; userId: string }>(redisKey);

    if (!cached.data || cached.data.otp !== data.code.trim()) {
      throw new Error('Mã xác thực không hợp lệ hoặc đã hết hạn.');
    }

    const updatedUser = await prisma.user.update({
      where: { id: cached.data.userId },
      data: { isEmailVerified: true }
    });

    await RedisService.del(redisKey);
    mailService.sendWelcomeEmail(updatedUser.email as string,  updatedUser.displayName as string).catch(err => console.error(err));
    return sanitizeUser(updatedUser);
  }

  static async resendVerifyEmail(emailInput: string): Promise<{ success: boolean; message: string; debugCode?: string }> {
    const email = emailInput.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isEmailVerified) {
      throw new Error('Tài khoản không tồn tại hoặc đã được xác thực.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const redisKey = `auth:verify-email:${email}`;
    await RedisService.set(redisKey, { otp, userId: user.id }, 900);
    
    mailService.sendOtpEmail(email, otp).catch(err => console.error(err));
    return { success: true, message: 'Đã gửi lại mã xác thực tới email của bạn.', debugCode: otp };
  }

  static async login(data: any): Promise<AuthResult> {
    
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'allow_registration' } });
    if (setting && setting.value === 'false') {
      throw new Error('Hệ thống hiện đang tạm khóa đăng ký mới.');
    }

    const email = data.email.trim().toLowerCase();
    const password = data.password || '';

    if (!email || !password) throw new Error('Vui lòng nhập đầy đủ Email và Mật khẩu.');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw new Error('Tài khoản hoặc mật khẩu không chính xác.');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new Error('Tài khoản hoặc mật khẩu không chính xác.');

    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      throw new Error(`Tài khoản đã bị khóa: ${user.banReason || 'Vi phạm chính sách.'}`);
    }

    const tokens = generateTokens(user.id, user.email, user.tokenVersion || 1);
    return { user: sanitizeUser(user), ...tokens };
  }

  static async loginDemo(): Promise<AuthResult> {
    const demoEmail = 'cuong@nihonai.edu.vn';
    let demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });

    if (!demoUser) {
      const defaultHash = await bcrypt.hash('123456', 10);
      demoUser = await prisma.user.create({
        data: {
          email: demoEmail,
          passwordHash: defaultHash,
          displayName: 'Đoàn Trần Mạnh Cường',
          targetLevel: 'N3',
          role: 'ADMIN',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=CuongQNU',
          isEmailVerified: true
        }
      });
    }

    const tokens = generateTokens(demoUser.id, demoUser.email, demoUser.tokenVersion || 1);
    return { user: sanitizeUser(demoUser), ...tokens };
  }

  static async getMe(userId: string, expectedTokenVersion?: number): Promise<UserResponse> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Không tìm thấy thông tin người dùng.');
    if (expectedTokenVersion !== undefined && user.tokenVersion !== expectedTokenVersion) {
      throw new Error('Phiên đăng nhập đã bị thu hồi hoặc đổi mật khẩu. Vui lòng đăng nhập lại.');
    }
    return sanitizeUser(user);
  }

  static async updateTargetLevel(userId: string, targetLevel: string): Promise<UserResponse> {
    const levelUpper = targetLevel.toUpperCase();
    if (!['N5', 'N4', 'N3', 'N2', 'N1'].includes(levelUpper)) {
      throw new Error('Trình độ không hợp lệ. Vui lòng chọn từ N5 đến N1.');
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { targetLevel: levelUpper }
    });
    return sanitizeUser(updatedUser);
  }

  static async loginWithGoogle(data: { credential?: string, email?: string, googleId?: string, displayName?: string, avatar?: string }): Promise<AuthResult> {
    let email = '';
    let googleId = data.googleId || '';
    let displayName = data.displayName || '';
    let avatar = data.avatar || '';

    if (data.credential) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: data.credential,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) throw new Error('Google payload invalid');
        
        email = payload.email.toLowerCase();
        googleId = payload.sub;
        displayName = payload.name || email.split('@')[0];
        avatar = payload.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`;
      } catch (err: any) {
        throw new Error('Xác thực Google ID Token thất bại: ' + err.message);
      }
    } else {
      if (!data.email) throw new Error('Missing Google Credentials');
      email = data.email.trim().toLowerCase();
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(googleId ? [{ googleId }] : []),
          { email }
        ]
      }
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleId || user.googleId,
          authProvider: user.authProvider === 'LOCAL' ? 'GOOGLE' : user.authProvider,
          isEmailVerified: true,
          lastLoginAt: new Date(),
          avatar: user.avatar || avatar
        }
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          displayName,
          avatar,
          googleId,
          authProvider: 'GOOGLE',
          isEmailVerified: true,
          lastLoginAt: new Date(),
          targetLevel: 'N5'
        }
      });
    }

    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      throw new Error(`Tài khoản đã bị khóa: ${user.banReason || 'Vi phạm chính sách.'}`);
    }

    const tokens = generateTokens(user.id, user.email, user.tokenVersion || 1);
    return { user: sanitizeUser(user), ...tokens };
  }

  static async refreshSession(refreshToken: string): Promise<AuthResult> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string, tokenVersion: number };
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      
      if (!user) throw new Error('Tài khoản không tồn tại.');
      if (user.tokenVersion !== decoded.tokenVersion) {
        throw new Error('Phiên đăng nhập đã bị vô hiệu hóa.');
      }
      if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
        throw new Error(`Tài khoản đã bị khóa: ${user.banReason || 'Vi phạm chính sách.'}`);
      }

      const tokens = generateTokens(user.id, user.email, user.tokenVersion);
      return { user: sanitizeUser(user), ...tokens };
    } catch (err) {
      throw new Error('Refresh Token không hợp lệ hoặc đã hết hạn.');
    }
  }

  static async forgotPassword(emailInput: string): Promise<{ success: boolean; message: string; debugCode?: string }> {
    const email = emailInput.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: true, message: 'Nếu email tồn tại, mã xác thực sẽ được tạo.' };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const redisKey = `auth:reset:${email}`;
    await RedisService.set(redisKey, { otp, userId: user.id }, 900);
    
    // Gửi email OTP Khôi phục mật khẩu
    mailService.sendOtpEmail(email, otp).catch(err => console.error(err));

    return { success: true, message: 'Mã khôi phục đã được gửi tới email của bạn (15 phút).', debugCode: otp };
  }

  static async resetPassword(data: { email: string; code: string; newPassword: string }): Promise<AuthResult> {
    
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'allow_registration' } });
    if (setting && setting.value === 'false') {
      throw new Error('Hệ thống hiện đang tạm khóa đăng ký mới.');
    }

    const email = data.email.trim().toLowerCase();
    const redisKey = `auth:reset:${email}`;
    const cached = await RedisService.get<{ otp: string; userId: string }>(redisKey);

    if (!cached.data || cached.data.otp !== data.code.trim()) {
      throw new Error('Mã xác thực không hợp lệ hoặc đã hết hạn.');
    }
    if (!data.newPassword || data.newPassword.length < 6) throw new Error('Mật khẩu tối thiểu 6 ký tự.');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.newPassword, salt);

    const updatedUser = await prisma.user.update({
      where: { id: cached.data.userId },
      data: {
        passwordHash,
        tokenVersion: { increment: 1 },
        lastLoginAt: new Date()
      }
    });
    await RedisService.del(redisKey);
    mailService.sendPasswordResetSuccessEmail(updatedUser.email, updatedUser.displayName as string).catch(err => console.error(err));
    const tokens = generateTokens(updatedUser.id, updatedUser.email, updatedUser.tokenVersion);
    return { user: sanitizeUser(updatedUser), ...tokens };
  }

  static async revokeAllSessions(userId: string): Promise<boolean> {
    await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } }
    });
    return true;
  }
}
