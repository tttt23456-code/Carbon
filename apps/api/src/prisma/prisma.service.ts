import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('数据库连接成功');
    } catch (error) {
      this.logger.error('数据库连接失败:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('数据库连接已断开');
  }

  /**
   * 清理删除的记录（软删除）
   */
  async cleanupDeletedRecords() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30天前

    const models = [
      'organization',
      'user',
      'facility',
      'project',
      'dataSource',
      'activityRecord',
      'emissionFactor',
    ];

    for (const model of models) {
      const count = await (this as any)[model].deleteMany({
        where: {
          deletedAt: {
            lt: cutoffDate,
          },
        },
      });
      
      if (count > 0) {
        this.logger.log(`清理了 ${count} 条 ${model} 记录`);
      }
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}