import Redis from 'ioredis';

class InMemoryCache {
  private store = new Map<string, { value: any; expiry: number }>();
  private readonly MAX_ENTRIES = 500;

  get<T>(key: string): T | null {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.value as T;
  }

  set(key: string, value: any, ttlSeconds: number): void {
    if (this.store.size >= this.MAX_ENTRIES && !this.store.has(key)) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }
    this.store.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000
    });
  }

  del(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  getKeysByPrefix(prefix: string): string[] {
    const keys: string[] = [];
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    return keys;
  }
}

export class RedisService {
  private static client: Redis | null = null;
  private static isConnected = false;
  private static memoryFallback = new InMemoryCache();
  private static inFlightPromises = new Map<string, Promise<any>>();

  static init(): void {
    if (this.client) return;

    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      this.isConnected = false;
      return;
    }
    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 3000,
        lazyConnect: false,
        retryStrategy(times) {
          const delay = Math.min(times * 100, 2000);
          return delay;
        }
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('⚡ [REDIS] Connected to Redis cluster at:', redisUrl);
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        // console.warn('⚠️ [REDIS] Offline, falling back to In-Memory Cache.');
      });

      this.client.on('close', () => {
        this.isConnected = false;
      });
    } catch (e) {
      console.warn('⚠️ [REDIS] Failed to initialize Redis client, using In-Memory Cache.');
      this.isConnected = false;
    }
  }

  static isHealthy(): boolean {
    return this.isConnected;
  }

  static async ping(): Promise<string> {
    if (this.client && this.isConnected) {
      return await this.client.ping();
    }
    return 'IN_MEMORY_PONG';
  }

  static async get<T>(key: string): Promise<{ data: T | null; cached: boolean }> {
    // 1. L1 RAM Cache (< 0.01ms, không tốn băng thông mạng hay JSON.parse)
    const memVal = this.memoryFallback.get<T>(key);
    if (memVal !== null) {
      return { data: memVal, cached: true };
    }

    // 2. L2 Remote Redis Cache
    if (this.client && this.isConnected) {
      try {
        const raw = await this.client.get(key);
        if (raw) {
          const parsed = JSON.parse(raw) as T;
          this.memoryFallback.set(key, parsed, 600);
          return { data: parsed, cached: true };
        }
      } catch (e) {
        // Fallback to memory on read error
      }
    }

    return { data: null, cached: false };
  }

  static async set(key: string, value: any, ttlSeconds = 3600): Promise<void> {
    this.memoryFallback.set(key, value, ttlSeconds);
    if (this.client && this.isConnected) {
      try {
        const serialized = JSON.stringify(value);
        await this.client.set(key, serialized, 'EX', ttlSeconds);
      } catch (e) {
        // Fallback to memory on write error
      }
    }
  }

  static async del(key: string): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.del(key);
      } catch (e) {}
    }
    this.memoryFallback.del(key);
  }

  static async delPrefix(prefix: string): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        const keys = await this.client.keys(`${prefix}*`);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } catch (e) {}
    }
    // Delete from memory fallback
    const memKeys = this.memoryFallback.getKeysByPrefix(prefix);
    for (const k of memKeys) {
      this.memoryFallback.del(k);
    }
  }

  /**
   * Cache-Aside Pattern với bảo vệ Thundering Herd / Cache Stampede
   * Nếu có 100 requests đồng thời khi cache rỗng, chỉ 1 request gọi database
   */
  static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds = 3600
  ): Promise<{ data: T; cached: boolean }> {
    // 1. Kiểm tra cache trước
    const cached = await this.get<T>(key);
    if (cached.data !== null) {
      return { data: cached.data, cached: true };
    }

    // 2. Chống Thundering Herd: Gộp các promises đang bay
    if (this.inFlightPromises.has(key)) {
      const data = await this.inFlightPromises.get(key);
      return { data, cached: true };
    }

    const fetchPromise = (async () => {
      try {
        const freshData = await fetcher();
        await this.set(key, freshData, ttlSeconds);
        return freshData;
      } finally {
        this.inFlightPromises.delete(key);
      }
    })();

    this.inFlightPromises.set(key, fetchPromise);
    const result = await fetchPromise;
    return { data: result, cached: false };
  }
}

// Tự động khởi tạo kết nối khi module được nạp
RedisService.init();
