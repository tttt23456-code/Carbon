import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmissionFactorDto, UpdateEmissionFactorDto, EmissionFactorQueryDto } from './dto/emission-factor.dto';

@Injectable()
export class EmissionFactorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateEmissionFactorDto, organizationId?: string) {
    // 设置默认sourceType
    const sourceType = createDto.sourceType || 
      (['IPCC', 'DEFRA', 'EPA', 'GHG_PROTOCOL', 'IEA'].includes(createDto.source) ? 'STANDARD' : 'CUSTOM');
    
    const emissionFactor = await this.prisma.emissionFactor.create({
      data: {
        ...createDto,
        sourceType,
        organizationId: organizationId || null,
        validityStart: createDto.validityStart ? new Date(createDto.validityStart) : null,
        validityEnd: createDto.validityEnd ? new Date(createDto.validityEnd) : null,
        assumptions: createDto.assumptions ? JSON.stringify(createDto.assumptions) : "{}",
        metadata: createDto.metadata ? JSON.stringify(createDto.metadata) : "{}",
      },
    });

    return this.formatEmissionFactor(emissionFactor);
  }

  async findAll(query: EmissionFactorQueryDto, organizationId?: string) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    // 如果指定了组织ID，只查找该组织的自定义因子或系统因子
    if (organizationId) {
      where.OR = [
        { organizationId },
        { organizationId: null },
      ];
    }

    // 构建筛选条件
    if (query.source) {
      where.source = query.source;
    }
    
    if (query.sourceType) {
      where.sourceType = query.sourceType;
    }

    if (query.region) {
      where.region = query.region;
    }

    if (query.year) {
      where.year = query.year;
    }

    if (query.activityType) {
      where.activityType = query.activityType;
    }

    if (query.gas) {
      where.gas = query.gas;
    }

    if (query.activeOnly) {
      where.isActive = true;
    }

    if (query.defaultOnly) {
      where.isDefault = true;
    }

    const [factors, total] = await Promise.all([
      this.prisma.emissionFactor.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { organizationId: { sort: 'desc', nulls: 'last' } },
          { year: 'desc' },
          { priority: 'desc' },
          { isDefault: 'desc' },
        ],
      }),
      this.prisma.emissionFactor.count({ where }),
    ]);

    return {
      data: factors.map(factor => this.formatEmissionFactor(factor)),
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

  async findOne(id: string, organizationId?: string) {
    const factor = await this.prisma.emissionFactor.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: organizationId ? [
          { organizationId },
          { organizationId: null },
        ] : undefined,
      },
    });

    if (!factor) {
      throw new NotFoundException('排放因子不存在');
    }

    return this.formatEmissionFactor(factor);
  }

  async update(id: string, updateDto: UpdateEmissionFactorDto, organizationId?: string) {
    // 验证权限
    const existingFactor = await this.findOne(id, organizationId);
    
    // 只有系统管理员或因子创建者可以修改
    if (existingFactor.organizationId && existingFactor.organizationId !== organizationId) {
      throw new NotFoundException('排放因子不存在或无权限访问');
    }

    const updatedFactor = await this.prisma.emissionFactor.update({
      where: { id },
      data: {
        ...(updateDto.source !== undefined && { source: updateDto.source }),
        ...(updateDto.region !== undefined && { region: updateDto.region }),
        ...(updateDto.year !== undefined && { year: updateDto.year }),
        ...(updateDto.activityType !== undefined && { activityType: updateDto.activityType }),
        ...(updateDto.description !== undefined && { description: updateDto.description }),
        ...(updateDto.unit !== undefined && { unit: updateDto.unit }),
        ...(updateDto.factorValue !== undefined && { factorValue: updateDto.factorValue }),
        ...(updateDto.factorUnit !== undefined && { factorUnit: updateDto.factorUnit }),
        ...(updateDto.gas !== undefined && { gas: updateDto.gas }),
        ...(updateDto.gwp !== undefined && { gwp: updateDto.gwp }),
        ...(updateDto.validityStart !== undefined && { validityStart: updateDto.validityStart ? new Date(updateDto.validityStart) : null }),
        ...(updateDto.validityEnd !== undefined && { validityEnd: updateDto.validityEnd ? new Date(updateDto.validityEnd) : null }),
        ...(updateDto.reference !== undefined && { reference: updateDto.reference }),
        ...(updateDto.methodology !== undefined && { methodology: updateDto.methodology }),
        ...(updateDto.assumptions !== undefined && { assumptions: JSON.stringify(updateDto.assumptions) }),
        ...(updateDto.metadata !== undefined && { metadata: JSON.stringify(updateDto.metadata) }),
        ...(updateDto.isActive !== undefined && { isActive: updateDto.isActive }),
        ...(updateDto.isDefault !== undefined && { isDefault: updateDto.isDefault }),
        ...(updateDto.priority !== undefined && { priority: updateDto.priority }),
      },
    });

    return this.formatEmissionFactor(updatedFactor);
  }

  async remove(id: string, organizationId?: string) {
    // 验证权限
    const existingFactor = await this.findOne(id, organizationId);
    
    // 只有系统管理员或因子创建者可以删除
    if (existingFactor.organizationId && existingFactor.organizationId !== organizationId) {
      throw new NotFoundException('排放因子不存在或无权限访问');
    }

    await this.prisma.emissionFactor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: '排放因子已删除' };
  }

  async getBestFactor(activityType: string, region: string, organizationId?: string) {
    const currentYear = new Date().getFullYear();

    // 优先级：组织自定义 > 指定地区 > 最新年份 > 高优先级 > 默认 > 标准源
    const factor = await this.prisma.emissionFactor.findFirst({
      where: {
        activityType,
        isActive: true,
        deletedAt: null,
        OR: organizationId ? [
          { organizationId },
          { organizationId: null },
        ] : [{ organizationId: null }],
        AND: [
          {
            OR: [
              { validityStart: null },
              { validityStart: { lte: new Date() } },
            ],
          },
          {
            OR: [
              { validityEnd: null },
              { validityEnd: { gte: new Date() } },
            ],
          },
        ],
      },
      orderBy: [
        { organizationId: 'desc' }, // 组织自定义优先
        { region: 'desc' }, // 指定地区优先
        { year: 'desc' }, // 最新年份优先
        { priority: 'desc' }, // 高优先级优先
        { isDefault: 'desc' }, // 默认因子优先
        { sourceType: 'asc' }, // 标准源优先于自定义源
      ],
    });

    if (!factor) {
      throw new NotFoundException(`未找到活动类型 ${activityType} 的排放因子`);
    }

    return this.formatEmissionFactor(factor);
  }

  private formatEmissionFactor(factor: any) {
    return {
      ...factor,
      assumptions: factor.assumptions ? JSON.parse(factor.assumptions) : {},
      metadata: factor.metadata ? JSON.parse(factor.metadata) : {},
      validityStart: factor.validityStart ? factor.validityStart.toISOString() : null,
      validityEnd: factor.validityEnd ? factor.validityEnd.toISOString() : null,
    };
  }
}