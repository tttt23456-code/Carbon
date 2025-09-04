import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const startTime = Date.now();
    
    try {
      // 检查数据库连接
      const dbHealthy = await this.prisma.healthCheck();
      
      const responseTime = Date.now() - startTime;
      
      const health = {
        status: dbHealthy ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: `${responseTime}ms`,
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        checks: {
          database: dbHealthy ? 'healthy' : 'unhealthy',
          memory: this.getMemoryUsage(),
        },
      };

      return {
        ...health,
        statusCode: dbHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE,
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      };
    }
  }

  private getMemoryUsage() {
    const used = process.memoryUsage();
    return {
      rss: `${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`,
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`,
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`,
      external: `${Math.round(used.external / 1024 / 1024 * 100) / 100} MB`,
    };
  }
}