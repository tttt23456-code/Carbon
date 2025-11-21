import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditLogDto, AuditLogQueryDto } from './dto/audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateAuditLogDto, organizationId: string, actorId?: string, ipAddress?: string, userAgent?: string) {
    const auditLog = await this.prisma.auditLog.create({
      data: {
        ...createDto,
        organizationId,
        actorId: actorId || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        before: createDto.before ? JSON.stringify(createDto.before) : null,
        after: createDto.after ? JSON.stringify(createDto.after) : null,
        diff: createDto.diff ? JSON.stringify(createDto.diff) : null,
        metadata: createDto.metadata ? JSON.stringify(createDto.metadata) : "{}",
      },
    });

    return this.formatAuditLog(auditLog);
  }

  async findAll(organizationId: string, query: AuditLogQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
    };

    // 构建筛选条件
    if (query.action) {
      where.action = query.action;
    }

    if (query.entity) {
      where.entity = query.entity;
    }

    if (query.actorId) {
      where.actorId = query.actorId;
    }

    if (query.startDate || query.endDate) {
      where.AND = [];
      if (query.startDate) {
        where.AND.push({
          createdAt: { gte: new Date(query.startDate) },
        });
      }
      if (query.endDate) {
        where.AND.push({
          createdAt: { lte: new Date(query.endDate) },
        });
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs.map(log => this.formatAuditLog(log)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string, organizationId: string) {
    const log = await this.prisma.auditLog.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!log) {
      return null;
    }

    return this.formatAuditLog(log);
  }

  async getStatistics(organizationId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalLogs, logsByAction, logsByEntity] = await Promise.all([
      this.prisma.auditLog.count({
        where: {
          organizationId,
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where: {
          organizationId,
          createdAt: { gte: startDate },
        },
        _count: { action: true },
      }),
      this.prisma.auditLog.groupBy({
        by: ['entity'],
        where: {
          organizationId,
          createdAt: { gte: startDate },
        },
        _count: { entity: true },
      }),
    ]);

    return {
      totalLogs,
      logsByAction: logsByAction.reduce((acc, item) => {
        acc[item.action] = item._count.action;
        return acc;
      }, {} as Record<string, number>),
      logsByEntity: logsByEntity.reduce((acc, item) => {
        acc[item.entity] = item._count.entity;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  private formatAuditLog(log: any) {
    return {
      ...log,
      before: log.before ? JSON.parse(log.before) : null,
      after: log.after ? JSON.parse(log.after) : null,
      diff: log.diff ? JSON.parse(log.diff) : null,
      metadata: log.metadata ? JSON.parse(log.metadata) : {},
    };
  }
}