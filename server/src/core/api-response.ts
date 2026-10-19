export interface ApiResponseMeta {
  service: string;
  cached?: boolean;
  latencyMs?: number;
  timestamp?: string;
  version?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: ApiResponseMeta;
}

export class ResponseFormatter {
  static success<T>(data: T, meta?: Partial<ApiResponseMeta>, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      meta: {
        service: meta?.service || 'api-gateway',
        cached: meta?.cached || false,
        latencyMs: meta?.latencyMs ? Number(meta.latencyMs.toFixed(2)) : undefined,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        ...meta
      }
    };
  }

  static error(message: string, errorDetail?: any, service = 'api-gateway'): ApiResponse<null> {
    return {
      success: false,
      message,
      error: errorDetail ? String(errorDetail) : undefined,
      meta: {
        service,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }
}
