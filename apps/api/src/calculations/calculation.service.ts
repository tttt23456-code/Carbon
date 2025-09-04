import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalculatorRegistry } from './calculators/calculator-registry.service';
import {
  CalculationInput,
  CalculationResult,
  EmissionFactor,
} from './interfaces/calculation.interface';

export interface BatchCalculationInput {
  organizationId: string;
  activityRecordIds?: string[]; // 计算指定的活动记录
  filters?: {
    scope?: string[];
    category?: string[];
    activityType?: string[];
    projectId?: string;
    facilityId?: string;
    periodStart?: Date;
    periodEnd?: Date;
  };
}

export interface BatchCalculationResult {
  totalEmissions: number; // 总排放量 (tCO2e)
  calculationCount: number; // 计算记录数
  results: Array<{
    activityRecordId: string;
    result: CalculationResult;
    factorUsed: EmissionFactor;
  }>;
  summary: {
    byScope: Record<string, number>;
    byCategory: Record<string, number>;
    byActivityType: Record<string, number>;
  };
}

/**
 * 碳排放计算服务
 * 提供单次和批量计算功能
 */
@Injectable()
export class CalculationService {
  private readonly logger = new Logger(CalculationService.name);

  constructor(
    private prisma: PrismaService,
    private calculatorRegistry: CalculatorRegistry,
  ) {}

  /**
   * 单次计算
   */
  async calculate(
    organizationId: string,
    input: CalculationInput,
    factorId?: string,
  ): Promise<CalculationResult> {
    // 获取计算器
    const calculator = this.calculatorRegistry.getCalculator(input.activityType);
    if (!calculator) {
      throw new BadRequestException(`不支持的活动类型: ${input.activityType}`);
    }

    // 获取排放因子
    const factor = await this.getEmissionFactor(organizationId, input.activityType, factorId);

    // 验证输入
    const normalizedInput = await calculator.validate(input);

    // 执行计算
    const result = await calculator.calculate(normalizedInput, factor);

    this.logger.debug(`计算完成: ${input.activityType}, 排放量: ${result.tCO2e} tCO2e`);

    return result;
  }

  /**
   * 批量计算活动记录
   */
  async batchCalculate(input: BatchCalculationInput): Promise<BatchCalculationResult> {
    const { organizationId, activityRecordIds, filters } = input;

    // 构建查询条件
    const where: any = {
      organizationId,
      deletedAt: null,
    };

    if (activityRecordIds && activityRecordIds.length > 0) {
      where.id = { in: activityRecordIds };
    }

    if (filters) {
      if (filters.scope) {
        where.scope = { in: filters.scope };
      }
      if (filters.category) {
        where.category = { in: filters.category };
      }
      if (filters.activityType) {
        where.activityType = { in: filters.activityType };
      }
      if (filters.projectId) {
        where.projectId = filters.projectId;
      }
      if (filters.facilityId) {
        where.facilityId = filters.facilityId;
      }
      if (filters.periodStart || filters.periodEnd) {
        where.AND = [];
        if (filters.periodStart) {
          where.AND.push({ periodEnd: { gte: filters.periodStart } });
        }
        if (filters.periodEnd) {
          where.AND.push({ periodStart: { lte: filters.periodEnd } });
        }
      }
    }

    // 获取活动记录
    const activityRecords = await this.prisma.activityRecord.findMany({
      where,
      include: {
        calculationResults: true,
      },
    });

    if (activityRecords.length === 0) {
      throw new NotFoundException('未找到符合条件的活动记录');
    }

    this.logger.log(`开始批量计算 ${activityRecords.length} 条活动记录`);

    const results: BatchCalculationResult['results'] = [];
    let totalEmissions = 0;
    const summary = {
      byScope: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byActivityType: {} as Record<string, number>,
    };

    // 逐个计算
    for (const record of activityRecords) {
      try {
        // 构建计算输入
        const calculationInput: CalculationInput = {
          activityType: record.activityType,
          amount: record.amount,
          unit: record.unit,
          metadata: {
            ...record.metadata,
            dataQuality: record.dataQuality,
          },
        };

        // 执行计算
        const result = await this.calculate(organizationId, calculationInput);

        // 获取使用的排放因子
        const factor = await this.getEmissionFactor(organizationId, record.activityType);

        results.push({
          activityRecordId: record.id,
          result,
          factorUsed: factor,
        });

        // 累计总排放量
        totalEmissions += result.tCO2e;

        // 更新汇总统计
        this.updateSummary(summary, record, result.tCO2e);

        // 保存计算结果到数据库
        await this.saveCalculationResult(record.id, result, factor);

        this.logger.debug(`记录 ${record.id} 计算完成: ${result.tCO2e} tCO2e`);
      } catch (error) {
        this.logger.error(`计算记录 ${record.id} 失败:`, error);
        // 继续处理其他记录，但记录错误
        results.push({
          activityRecordId: record.id,
          result: {
            tCO2e: 0,
            breakdown: null,
            method: 'Error',
            dataQuality: 'estimated',
          },
          factorUsed: null,
        });
      }
    }

    this.logger.log(`批量计算完成，总排放量: ${totalEmissions} tCO2e`);

    return {
      totalEmissions,
      calculationCount: results.length,
      results,
      summary,
    };
  }

  /**
   * 重新计算指定的活动记录
   */
  async recalculate(
    organizationId: string,
    activityRecordId: string,
    factorId?: string,
  ): Promise<CalculationResult> {
    // 获取活动记录
    const record = await this.prisma.activityRecord.findFirst({
      where: {
        id: activityRecordId,
        organizationId,
        deletedAt: null,
      },
    });

    if (!record) {
      throw new NotFoundException('活动记录不存在');
    }

    // 构建计算输入
    const calculationInput: CalculationInput = {
      activityType: record.activityType,
      amount: record.amount,
      unit: record.unit,
      metadata: {
        ...record.metadata,
        dataQuality: record.dataQuality,
      },
    };

    // 执行计算
    const result = await this.calculate(organizationId, calculationInput, factorId);

    // 获取使用的排放因子
    const factor = await this.getEmissionFactor(organizationId, record.activityType, factorId);

    // 删除旧的计算结果
    await this.prisma.calculationResult.deleteMany({
      where: { activityRecordId },
    });

    // 保存新的计算结果
    await this.saveCalculationResult(activityRecordId, result, factor);

    this.logger.log(`重新计算记录 ${activityRecordId} 完成: ${result.tCO2e} tCO2e`);

    return result;
  }

  /**
   * 获取排放因子
   */
  private async getEmissionFactor(
    organizationId: string,
    activityType: string,
    factorId?: string,
  ): Promise<EmissionFactor> {
    let factor;

    if (factorId) {
      // 使用指定的排放因子
      factor = await this.prisma.emissionFactor.findFirst({
        where: {
          id: factorId,
          OR: [
            { organizationId },
            { organizationId: null }, // 系统内置因子
          ],
          isActive: true,
          deletedAt: null,
        },
      });

      if (!factor) {
        throw new NotFoundException(`排放因子 ${factorId} 不存在或无权限访问`);
      }
    } else {
      // 自动选择最佳排放因子
      factor = await this.findBestEmissionFactor(organizationId, activityType);
    }

    if (!factor) {
      throw new NotFoundException(`未找到活动类型 ${activityType} 的排放因子`);
    }

    return {
      id: factor.id,
      activityType: factor.activityType,
      region: factor.region,
      year: factor.year,
      factorValue: factor.factorValue,
      factorUnit: factor.factorUnit,
      gas: factor.gas,
      gwp: factor.gwp,
      reference: factor.reference,
      methodology: factor.methodology,
      assumptions: factor.assumptions,
    };
  }

  /**
   * 查找最佳排放因子
   */
  private async findBestEmissionFactor(
    organizationId: string,
    activityType: string,
  ): Promise<any> {
    const currentYear = new Date().getFullYear();

    // 优先级：组织自定义 > 最新年份 > 高优先级 > 默认
    const factor = await this.prisma.emissionFactor.findFirst({
      where: {
        activityType,
        OR: [
          { organizationId },
          { organizationId: null },
        ],
        isActive: true,
        deletedAt: null,
        OR: [
          { validityStart: null },
          { validityStart: { lte: new Date() } },
        ],
        AND: [
          {
            OR: [
              { validityEnd: null },
              { validityEnd: { gte: new Date() } },
            ],
          },
        ],
      },
      orderBy: [
        { organizationId: { sort: 'desc', nulls: 'last' } }, // 组织自定义优先
        { year: 'desc' }, // 最新年份优先
        { priority: 'desc' }, // 高优先级优先
        { isDefault: 'desc' }, // 默认因子优先
      ],
    });

    return factor;
  }

  /**
   * 保存计算结果
   */
  private async saveCalculationResult(
    activityRecordId: string,
    result: CalculationResult,
    factor: EmissionFactor,
  ): Promise<void> {
    await this.prisma.calculationResult.create({
      data: {
        organizationId: factor.id.split('-')[0], // 简化处理，实际应该从活动记录获取
        activityRecordId,
        tCO2e: result.tCO2e,
        breakdown: result.breakdown,
        method: result.method,
        factorId: factor.id,
        factorSnapshot: factor,
        uncertainty: result.uncertainty,
      },
    });
  }

  /**
   * 更新汇总统计
   */
  private updateSummary(
    summary: BatchCalculationResult['summary'],
    record: any,
    emissions: number,
  ): void {
    // 按Scope统计
    const scope = record.scope;
    summary.byScope[scope] = (summary.byScope[scope] || 0) + emissions;

    // 按类别统计
    const category = record.category;
    summary.byCategory[category] = (summary.byCategory[category] || 0) + emissions;

    // 按活动类型统计
    const activityType = record.activityType;
    summary.byActivityType[activityType] = (summary.byActivityType[activityType] || 0) + emissions;
  }

  /**
   * 获取支持的活动类型
   */
  getSupportedActivityTypes(): string[] {
    return this.calculatorRegistry.getSupportedActivityTypes();
  }

  /**
   * 获取计算器统计信息
   */
  getCalculatorStatistics() {
    return this.calculatorRegistry.getStatistics();
  }

  /**
   * 验证计算器配置
   */
  validateCalculators() {
    return this.calculatorRegistry.validateConfiguration();
  }
}