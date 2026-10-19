export type ServiceStatus = 'UP' | 'DEGRADED' | 'DOWN';

export interface ServiceDescriptor {
  name: string;
  version: string;
  description: string;
  status: ServiceStatus;
  endpointPrefix: string;
  lastHeartbeat: string;
  totalRequests: number;
  totalErrors: number;
  avgLatencyMs: number;
}

export class ServiceRegistry {
  private static services = new Map<string, ServiceDescriptor>();

  static register(descriptor: Omit<ServiceDescriptor, 'status' | 'lastHeartbeat' | 'totalRequests' | 'totalErrors' | 'avgLatencyMs'>): void {
    this.services.set(descriptor.name, {
      ...descriptor,
      status: 'UP',
      lastHeartbeat: new Date().toISOString(),
      totalRequests: 0,
      totalErrors: 0,
      avgLatencyMs: 0
    });
    console.log(`📋 [SERVICE REGISTRY] Registered context: ${descriptor.name} (${descriptor.endpointPrefix})`);
  }

  static recordRequest(serviceName: string, latencyMs: number, isError = false): void {
    const service = this.services.get(serviceName);
    if (!service) return;

    service.totalRequests += 1;
    if (isError) service.totalErrors += 1;
    service.lastHeartbeat = new Date().toISOString();

    // Cập nhật rolling average latency
    service.avgLatencyMs = Number(((service.avgLatencyMs * (service.totalRequests - 1) + latencyMs) / service.totalRequests).toFixed(2));

    // Đánh giá trạng thái dịch vụ (Consul Health Check Rule)
    const errorRate = service.totalErrors / service.totalRequests;
    if (errorRate > 0.3) {
      service.status = 'DOWN';
    } else if (errorRate > 0.05 || service.avgLatencyMs > 1000) {
      service.status = 'DEGRADED';
    } else {
      service.status = 'UP';
    }
  }

  static getService(name: string): ServiceDescriptor | undefined {
    return this.services.get(name);
  }

  static getAllServices(): ServiceDescriptor[] {
    return Array.from(this.services.values());
  }

  static getHealthSummary() {
    const all = this.getAllServices();
    const isAllHealthy = all.every((s) => s.status === 'UP');
    const isAnyDown = all.some((s) => s.status === 'DOWN');

    return {
      status: isAllHealthy ? 'HEALTHY' : isAnyDown ? 'UNHEALTHY' : 'DEGRADED',
      servicesCount: all.length,
      timestamp: new Date().toISOString(),
      services: all
    };
  }
}

// Khởi tạo các Bounded Contexts mặc định của hệ sinh thái Edu
ServiceRegistry.register({
  name: 'auth-service',
  version: '1.0.0',
  description: 'Quản lý phiên, xác thực JWT và phân quyền người học',
  endpointPrefix: '/api/auth'
});

ServiceRegistry.register({
  name: 'kanji-service',
  version: '1.0.0',
  description: 'Tra cứu 2.138 Hán tự, đồ thị bộ thủ và nhận diện nét vẽ',
  endpointPrefix: '/api/kanji'
});

ServiceRegistry.register({
  name: 'vocabulary-service',
  version: '1.0.0',
  description: 'Giáo trình từ vựng (Minna, Tango, Mimikara) và phòng luyện tập',
  endpointPrefix: '/api/vocabulary'
});

ServiceRegistry.register({
  name: 'ai-tutor-service',
  version: '1.0.0',
  description: 'Trợ giảng AI đàm thoại, chẩn đoán lỗi ngữ pháp và sinh mẹo nhớ chiết tự',
  endpointPrefix: '/api/ai'
});

ServiceRegistry.register({
  name: 'reading-shadowing-service',
  version: '1.0.0',
  description: 'Đọc hiểu JLPT Dokkai, Báo song ngữ NHK và Video YouTube Shadowing & Dictation',
  endpointPrefix: '/api/reading'
});

ServiceRegistry.register({
  name: 'exam-service',
  version: '1.0.0',
  description: 'Thi thử JLPT theo các năm 2020-2025, chấm điểm tự động chuẩn 180 điểm',
  endpointPrefix: '/api/exam'
});

ServiceRegistry.register({
  name: 'notebook-service',
  version: '1.0.0',
  description: 'Sổ tay cá nhân lưu trữ CSDL MySQL, Flashcard SRS thông minh (Từ vựng, Hán tự, Ngữ pháp, Ghi chú)',
  endpointPrefix: '/api/notebook'
});

