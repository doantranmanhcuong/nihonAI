export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number; // Số lỗi liên tiếp trước khi ngắt mạch (mặc định: 5)
  cooldownPeriodMs?: number; // Thời gian nghỉ trước khi thử hồi phục (mặc định: 10000ms)
  timeoutMs?: number;        // Thời gian chờ tối đa cho 1 request (mặc định: 4000ms)
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private options: Required<CircuitBreakerOptions>;

  constructor(public readonly serviceName: string, options?: CircuitBreakerOptions) {
    this.options = {
      failureThreshold: options?.failureThreshold || 5,
      cooldownPeriodMs: options?.cooldownPeriodMs || 10000,
      timeoutMs: options?.timeoutMs || 4000
    };
  }

  getState(): CircuitState {
    if (this.state === 'OPEN') {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed > this.options.cooldownPeriodMs) {
        this.state = 'HALF_OPEN';
        console.log(`🔄 [CIRCUIT BREAKER] Service '${this.serviceName}' moved to HALF_OPEN (probing...)`);
      }
    }
    return this.state;
  }

  async execute<T>(action: () => Promise<T>, fallback: () => Promise<T> | T): Promise<{ result: T; fallbackUsed: boolean }> {
    const currentState = this.getState();

    // 1. Mạch đang HỞ (OPEN): Trả fallback ngay lập tức, chống nghẽn cổ chai
    if (currentState === 'OPEN') {
      console.warn(`⚡ [CIRCUIT BREAKER] Service '${this.serviceName}' is OPEN. Triggering instant fallback.`);
      const fbResult = await fallback();
      return { result: fbResult, fallbackUsed: true };
    }

    // 2. Thực thi action có giới hạn timeout
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Service timeout after ${this.options.timeoutMs}ms`)), this.options.timeoutMs);
      });

      const result = await Promise.race([action(), timeoutPromise]);
      this.onSuccess();
      return { result, fallbackUsed: false };
    } catch (error) {
      this.onFailure();
      console.error(`💥 [CIRCUIT BREAKER] Failure in '${this.serviceName}':`, error);
      const fbResult = await fallback();
      return { result: fbResult, fallbackUsed: true };
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log(`✅ [CIRCUIT BREAKER] Service '${this.serviceName}' recovered. Circuit is now CLOSED.`);
    }
  }

  private onFailure(): void {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN' || this.failureCount >= this.options.failureThreshold) {
      this.state = 'OPEN';
      console.warn(`🚨 [CIRCUIT BREAKER] Service '${this.serviceName}' TRIPPED to OPEN! (Failures: ${this.failureCount})`);
    }
  }
}

export class CircuitBreakerManager {
  private static breakers = new Map<string, CircuitBreaker>();

  static get(serviceName: string, options?: CircuitBreakerOptions): CircuitBreaker {
    let breaker = this.breakers.get(serviceName);
    if (!breaker) {
      breaker = new CircuitBreaker(serviceName, options);
      this.breakers.set(serviceName, breaker);
    }
    return breaker;
  }

  static getStates() {
    const states: Record<string, CircuitState> = {};
    for (const [name, breaker] of this.breakers.entries()) {
      states[name] = breaker.getState();
    }
    return states;
  }
}
