import { Router, Request, Response } from 'express';
import { ServiceRegistry } from './service-registry';
import { CircuitBreakerManager } from './circuit-breaker';
import { RedisService } from '../core/redis.service';
import { ResponseFormatter } from '../core/api-response';
import { prisma } from '../core/prisma.service';

export const gatewayRouter = Router();

/**
 * Endpoint Kiểm tra sức khỏe toàn diện chuẩn Consul (Consul-compatible Health Check)
 */
gatewayRouter.get('/health', async (req: Request, res: Response) => {
  const startTime = Date.now();

  let dbOk = false;
  let redisOk = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (e) {
    dbOk = false;
  }

  try {
    const pingRes = await RedisService.ping();
    redisOk = pingRes === 'PONG' || pingRes === 'IN_MEMORY_PONG';
  } catch (e) {
    redisOk = false;
  }

  const services = ServiceRegistry.getAllServices();
  const circuitStates = CircuitBreakerManager.getStates();

  const isHealthy = dbOk && (services.every((s) => s.status !== 'DOWN'));

  res.status(isHealthy ? 200 : 503).json(
    ResponseFormatter.success({
      status: isHealthy ? 'PASSING' : 'CRITICAL',
      infrastructure: {
        mysql: dbOk ? 'CONNECTED' : 'DOWN',
        redis: redisOk ? (RedisService.isHealthy() ? 'ONLINE_CLUSTER' : 'IN_MEMORY_FALLBACK') : 'DOWN'
      },
      services,
      circuits: circuitStates,
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMb: Number((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2))
    }, {
      service: 'api-gateway',
      latencyMs: Date.now() - startTime
    })
  );
});

/**
 * Endpoint danh sách dịch vụ đăng ký (Service Discovery Endpoint)
 */
gatewayRouter.get('/services', (req: Request, res: Response) => {
  res.json(ResponseFormatter.success(ServiceRegistry.getAllServices(), { service: 'api-gateway' }));
});

/**
 * Endpoint trạng thái các mạch ngắt (Circuit Breakers)
 */
gatewayRouter.get('/circuits', (req: Request, res: Response) => {
  res.json(ResponseFormatter.success(CircuitBreakerManager.getStates(), { service: 'api-gateway' }));
});
