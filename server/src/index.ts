import { aiRouter } from './services/ai/ai.routes';
import dns from 'dns';
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { kanjiRouter } from './services/kanji/kanji.routes';
import { authRouter } from './services/auth/auth.routes';
import { vocabularyRouter } from './services/vocabulary/vocabulary.routes';
import { readingRouter } from './services/reading/reading.routes';
import { shadowingRouter } from './services/shadowing/shadowing.routes';
import { examRouter } from './services/exam/exam.routes';
import { notebookRouter } from './services/notebook/notebook.routes';
import { adminRouter } from './services/admin/admin.routes';
import { seedReadingArticles } from './services/reading/reading.seed';
import { ReadingCronService } from './services/reading/reading-cron.service';
import { gatewayRouter } from './gateway/gateway.router';
import { ServiceRegistry } from './gateway/service-registry';
import { RedisService } from './core/redis.service';
import { ResponseFormatter } from './core/api-response';
import { checkMaintenance } from './middleware/maintenance.middleware';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('vercel.app') ||
      origin.includes('nihonai')
    ) {
      return callback(null, true);
    }
    if (process.env.FRONTEND_URL) {
      const cleanFrontend = process.env.FRONTEND_URL.replace(/\/$/, '');
      if (origin === cleanFrontend || origin.includes(cleanFrontend.replace(/^https?:\/\//, ''))) {
        return callback(null, true);
      }
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(cookieParser());
app.use(express.json());
app.use(checkMaintenance);

// Middleware đo lường hiệu năng và ghi nhận sức khỏe Microservices (Consul Health Metrics)
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const path = req.path;

  res.on('finish', () => {
    const latency = Date.now() - startTime;
    const isError = res.statusCode >= 500;

    if (path.startsWith('/api/kanji')) {
      ServiceRegistry.recordRequest('kanji-service', latency, isError);
    } else if (path.startsWith('/api/vocabulary')) {
      ServiceRegistry.recordRequest('vocabulary-service', latency, isError);
    } else if (path.startsWith('/api/reading')) {
      ServiceRegistry.recordRequest('reading-shadowing-service', latency, isError);
    } else if (path.startsWith('/api/shadowing')) {
      ServiceRegistry.recordRequest('shadowing-service', latency, isError);
    } else if (path.startsWith('/api/auth')) {
      ServiceRegistry.recordRequest('auth-service', latency, isError);
    } else if (path.startsWith('/api/exam')) {
      ServiceRegistry.recordRequest('exam-service', latency, isError);
    } else if (path.startsWith('/api/notebook')) {
      ServiceRegistry.recordRequest('notebook-service', latency, isError);
    }
  });

  next();
});

// 1. API Gateway Router (Consul Service Discovery & Health Checks)
app.use('/api/gateway', gatewayRouter);

// 2. Bounded Context Microservices
app.use('/api/auth', authRouter);
app.use('/api/kanji', kanjiRouter);
app.use('/api/vocabulary', vocabularyRouter);
app.use('/api/reading', readingRouter);
app.use('/api/shadowing', shadowingRouter);
app.use('/api/exam', examRouter);
app.use('/api/notebook', notebookRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ai', aiRouter);

// 3. Health check gốc (chuyển tiếp sang Gateway Health)
app.get('/api/health', (req: Request, res: Response) => {
  res.redirect(307, '/api/gateway/health');
});

// 4. API Catalog
app.get('/api', (req: Request, res: Response) => {
  res.json(
    ResponseFormatter.success({
      name: 'NihonAI - Edu Platform API Gateway',
      version: '1.0.0',
      architecture: 'Bounded Contexts (Microservices-Ready)',
      cacheEngine: RedisService.isHealthy() ? 'Redis Online (Port 6379)' : 'In-Memory Fallback',
      endpoints: {
        gatewayHealth: '/api/gateway/health',
        gatewayServices: '/api/gateway/services',
        gatewayCircuits: '/api/gateway/circuits',
        auth: '/api/auth',
        kanji: '/api/kanji',
        vocabulary: '/api/vocabulary',
        reading: '/api/reading',
        shadowing: '/api/shadowing',
        exam: '/api/exam',
        notebook: '/api/notebook',
        admin: '/api/admin'
      }
    }, { service: 'api-gateway' })
  );
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Gateway Error:', err);
  res.status(500).json(ResponseFormatter.error('Internal Gateway Error', err?.message || err));
});

app.listen(PORT, async () => {
  console.log(`🚀 [API GATEWAY] Server is running on: http://localhost:${PORT}`);
  console.log(`📡 [SERVICE REGISTRY & HEALTH] Check at: http://localhost:${PORT}/api/gateway/health`);
  console.log(`⚡ [REDIS ENGINE] Cache status: ${RedisService.isHealthy() ? 'CONNECTED' : 'IN_MEMORY'}`);

  // Tự động seed dữ liệu bài đọc mẫu nếu CSDL chưa có
  try {
    await seedReadingArticles();
  } catch (err) {
    console.error('Seed reading articles error:', err);
  }

  // Khởi chạy bộ lập lịch cào tin tức tự động hàng ngày
  ReadingCronService.initReadingNewsCron();
});
