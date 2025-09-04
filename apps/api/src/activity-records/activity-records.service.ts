import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreateActivityRecordDto, 
  UpdateActivityRecordDto, 
  VerifyActivityRecordDto,
  ActivityRecordQueryDto,
} from './dto/activity-record.dto';

@Injectable()
export class ActivityRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateActivityRecordDto, organizationId: string, userId: string) {
    // 验证项目和设施是否属于该组织
    if (createDto.projectId) {
      await this.validateProject(createDto.projectId, organizationId);
    }
    
    if (createDto.facilityId) {
      await this.validateFacility(createDto.facilityId, organizationId);
    }

    const activityRecord = await this.prisma.activityRecord.create({
      data: {
        activityType: createDto.activityType,
        scope: createDto.scope as any,
        category: createDto.category as any,
        amount: createDto.amount,
        unit: createDto.unit,
        periodStart: new Date(createDto.periodStart),
        periodEnd: new Date(createDto.periodEnd),
        description: createDto.description,
        reference: createDto.reference,
        dataQuality: createDto.dataQuality || 'estimated',
        uncertainty: createDto.uncertainty,
        metadata: createDto.metadata ? JSON.stringify(createDto.metadata) : "{}",
        organizationId,
        ...(createDto.projectId && { projectId: createDto.projectId }),
        ...(createDto.facilityId && { facilityId: createDto.facilityId }),
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
        facility: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    return activityRecord;
  }

  async findAll(organizationId: string, query: ActivityRecordQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
      deletedAt: null,
    };

    // 构建筛选条件
    if (query.scope) {
      where.scope = query.scope;
    }

    if (query.activityType) {
      where.activityType = query.activityType;
    }

    if (query.projectId) {
      where.projectId = query.projectId;
    }

    if (query.facilityId) {
      where.facilityId = query.facilityId;
    }

    if (query.verifiedOnly) {
      where.isVerified = true;
    }

    if (query.startDate || query.endDate) {
      where.AND = [];
      if (query.startDate) {
        where.AND.push({
          periodEnd: { gte: new Date(query.startDate) },
        });
      }
      if (query.endDate) {
        where.AND.push({
          periodStart: { lte: new Date(query.endDate) },
        });
      }
    }

    const [records, total] = await Promise.all([
      this.prisma.activityRecord.findMany({
        where,
        skip,
        take: limit,
        include: {
          project: {
            select: { id: true, name: true },
          },
          facility: {
            select: { id: true, name: true, type: true },
          },
          calculationResults: {
            select: {
              id: true,
              tCO2e: true,
              method: true,
              calculatedAt: true,
            },
            orderBy: { calculatedAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activityRecord.count({ where }),
    ]);

    return {
      data: records,
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
    const record = await this.prisma.activityRecord.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
        facility: {
          select: { id: true, name: true, type: true },
        },
        calculationResults: {
          include: {
            emissionFactor: {
              select: {
                id: true,
                source: true,
                region: true,
                year: true,
                factorValue: true,
                factorUnit: true,
              },
            },
          },
          orderBy: { calculatedAt: 'desc' },
        },
      },
    });

    if (!record) {
      throw new NotFoundException('活动记录不存在');
    }

    return record;
  }

  async update(id: string, updateDto: UpdateActivityRecordDto, organizationId: string, userId: string) {
    const existingRecord = await this.findOne(id, organizationId);

    // 如果记录已经验证，只有管理员和经理可以修改
    if (existingRecord.isVerified) {
      // 这里应该检查用户权限，简化处理
      // await this.checkPermission(organizationId, userId, ['ADMIN', 'MANAGER']);
    }

    // 验证项目和设施
    if (updateDto.projectId) {
      await this.validateProject(updateDto.projectId, organizationId);
    }
    
    if (updateDto.facilityId) {
      await this.validateFacility(updateDto.facilityId, organizationId);
    }

    const updatedRecord = await this.prisma.activityRecord.update({
      where: { id },
      data: {
        ...(updateDto.amount !== undefined && { amount: updateDto.amount }),
        ...(updateDto.unit !== undefined && { unit: updateDto.unit }),
        ...(updateDto.description !== undefined && { description: updateDto.description }),
        ...(updateDto.reference !== undefined && { reference: updateDto.reference }),
        ...(updateDto.dataQuality !== undefined && { dataQuality: updateDto.dataQuality }),
        ...(updateDto.uncertainty !== undefined && { uncertainty: updateDto.uncertainty }),
        ...(updateDto.projectId !== undefined && { projectId: updateDto.projectId }),
        ...(updateDto.facilityId !== undefined && { facilityId: updateDto.facilityId }),
        ...(updateDto.metadata !== undefined && { metadata: JSON.stringify(updateDto.metadata) }),
        periodStart: updateDto.periodStart ? new Date(updateDto.periodStart) : undefined,
        periodEnd: updateDto.periodEnd ? new Date(updateDto.periodEnd) : undefined,
        // 如果数据被修改，重置验证状态
        isVerified: existingRecord.amount !== updateDto.amount ||
                   existingRecord.unit !== updateDto.unit ||
                   existingRecord.periodStart.getTime() !== new Date(updateDto.periodStart || existingRecord.periodStart).getTime() ||
                   existingRecord.periodEnd.getTime() !== new Date(updateDto.periodEnd || existingRecord.periodEnd).getTime()
                   ? false : existingRecord.isVerified,
        verifiedBy: existingRecord.amount !== updateDto.amount ||
                   existingRecord.unit !== updateDto.unit ||
                   existingRecord.periodStart.getTime() !== new Date(updateDto.periodStart || existingRecord.periodStart).getTime() ||
                   existingRecord.periodEnd.getTime() !== new Date(updateDto.periodEnd || existingRecord.periodEnd).getTime()
                   ? null : existingRecord.verifiedBy,
        verifiedAt: existingRecord.amount !== updateDto.amount ||
                   existingRecord.unit !== updateDto.unit ||
                   existingRecord.periodStart.getTime() !== new Date(updateDto.periodStart || existingRecord.periodStart).getTime() ||
                   existingRecord.periodEnd.getTime() !== new Date(updateDto.periodEnd || existingRecord.periodEnd).getTime()
                   ? null : existingRecord.verifiedAt,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
        facility: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    return updatedRecord;
  }

  async verify(id: string, verifyDto: VerifyActivityRecordDto, organizationId: string, userId: string) {
    const record = await this.findOne(id, organizationId);

    const updatedRecord = await this.prisma.activityRecord.update({
      where: { id },
      data: {
        isVerified: verifyDto.isVerified,
        verifiedBy: verifyDto.isVerified ? userId : null,
        verifiedAt: verifyDto.isVerified ? new Date() : null,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
        facility: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    return updatedRecord;
  }

  async remove(id: string, organizationId: string, userId: string) {
    const record = await this.findOne(id, organizationId);

    await this.prisma.activityRecord.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: '活动记录已删除' };
  }

  async getStatistics(organizationId: string, startDate?: string, endDate?: string) {
    const where: any = {
      organizationId,
      deletedAt: null,
    };

    if (startDate || endDate) {
      where.AND = [];
      if (startDate) {
        where.AND.push({ periodEnd: { gte: new Date(startDate) } });
      }
      if (endDate) {
        where.AND.push({ periodStart: { lte: new Date(endDate) } });
      }
    }

    const [
      total,
      byScope,
      byCategory,
      byActivityType,
      verified,
    ] = await Promise.all([
      this.prisma.activityRecord.count({ where }),
      this.prisma.activityRecord.groupBy({
        by: ['scope'],
        where,
        _count: { scope: true },
      }),
      this.prisma.activityRecord.groupBy({
        by: ['category'],
        where,
        _count: { category: true },
      }),
      this.prisma.activityRecord.groupBy({
        by: ['activityType'],
        where,
        _count: { activityType: true },
      }),
      this.prisma.activityRecord.count({
        where: { ...where, isVerified: true },
      }),
    ]);

    return {
      total,
      verified,
      verificationRate: total > 0 ? (verified / total * 100).toFixed(1) : '0',
      byScope: byScope.reduce((acc, item) => {
        acc[item.scope] = item._count.scope;
        return acc;
      }, {} as Record<string, number>),
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = item._count.category;
        return acc;
      }, {} as Record<string, number>),
      byActivityType: byActivityType.reduce((acc, item) => {
        acc[item.activityType] = item._count.activityType;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  private async validateProject(projectId: string, organizationId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundException('项目不存在或无权限访问');
    }

    return project;
  }

  private async validateFacility(facilityId: string, organizationId: string) {
    const facility = await this.prisma.facility.findFirst({
      where: {
        id: facilityId,
        organizationId,
        deletedAt: null,
      },
    });

    if (!facility) {
      throw new NotFoundException('设施不存在或无权限访问');
    }

    return facility;
  }
}