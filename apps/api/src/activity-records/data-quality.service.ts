import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DataQualityAssessment {
  score: number; // 0-100的质量评分
  level: 'measured' | 'calculated' | 'estimated'; // 数据质量等级
  confidence: 'high' | 'medium' | 'low'; // 置信度
  issues: string[]; // 质量问题列表
  recommendations: string[]; // 改进建议
  lastAssessedAt: Date; // 最后评估时间
}

@Injectable()
export class DataQualityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 评估活动记录的数据质量
   */
  async assessActivityRecordQuality(recordId: string, organizationId: string): Promise<DataQualityAssessment> {
    const record = await this.prisma.activityRecord.findFirst({
      where: {
        id: recordId,
        organizationId,
        deletedAt: null,
      },
    });

    if (!record) {
      throw new Error('活动记录不存在');
    }

    // 评估数据质量
    const assessment = this.evaluateDataQuality(record);
    
    // 保存质量评估结果
    await this.saveQualityAssessment(recordId, assessment);
    
    return assessment;
  }

  /**
   * 批量评估活动记录的数据质量
   */
  async assessBatchQuality(organizationId: string, filters?: any): Promise<DataQualityAssessment[]> {
    const where: any = {
      organizationId,
      deletedAt: null,
      ...filters,
    };

    const records = await this.prisma.activityRecord.findMany({
      where,
    });

    const assessments: DataQualityAssessment[] = [];
    
    for (const record of records) {
      const assessment = this.evaluateDataQuality(record);
      await this.saveQualityAssessment(record.id, assessment);
      assessments.push(assessment);
    }

    return assessments;
  }

  /**
   * 获取组织的数据质量统计
   */
  async getOrganizationQualityStats(organizationId: string): Promise<any> {
    const [
      totalRecords,
      measuredRecords,
      calculatedRecords,
      estimatedRecords,
      verifiedRecords,
    ] = await Promise.all([
      this.prisma.activityRecord.count({
        where: { organizationId, deletedAt: null },
      }),
      this.prisma.activityRecord.count({
        where: { organizationId, dataQuality: 'measured', deletedAt: null },
      }),
      this.prisma.activityRecord.count({
        where: { organizationId, dataQuality: 'calculated', deletedAt: null },
      }),
      this.prisma.activityRecord.count({
        where: { organizationId, dataQuality: 'estimated', deletedAt: null },
      }),
      this.prisma.activityRecord.count({
        where: { organizationId, isVerified: true, deletedAt: null },
      }),
    ]);

    return {
      totalRecords,
      qualityDistribution: {
        measured: measuredRecords,
        calculated: calculatedRecords,
        estimated: estimatedRecords,
      },
      verificationRate: totalRecords > 0 ? (verifiedRecords / totalRecords * 100).toFixed(1) : '0',
      measuredPercentage: totalRecords > 0 ? (measuredRecords / totalRecords * 100).toFixed(1) : '0',
      overallQualityScore: this.calculateOverallQualityScore(
        measuredRecords,
        calculatedRecords,
        estimatedRecords,
        totalRecords
      ),
    };
  }

  /**
   * 评估单个记录的数据质量
   */
  private evaluateDataQuality(record: any): DataQualityAssessment {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // 检查数据质量字段
    if (!record.dataQuality) {
      issues.push('缺少数据质量标识');
      recommendations.push('请设置数据质量等级（measured/calculated/estimated）');
      score -= 20;
    }

    // 检查不确定性字段
    if (record.dataQuality === 'estimated' && !record.uncertainty) {
      issues.push('估算数据缺少不确定性信息');
      recommendations.push('为估算数据提供不确定性百分比');
      score -= 10;
    }

    // 检查参考信息
    if (!record.reference) {
      issues.push('缺少参考信息');
      recommendations.push('添加数据来源或参考编号');
      score -= 10;
    }

    // 检查描述信息
    if (!record.description) {
      issues.push('缺少描述信息');
      recommendations.push('添加数据描述以提高可追溯性');
      score -= 5;
    }

    // 检查时间范围
    if (!record.periodStart || !record.periodEnd) {
      issues.push('缺少完整的时间范围信息');
      recommendations.push('提供准确的活动期间开始和结束时间');
      score -= 15;
    }

    // 检查验证状态
    if (!record.isVerified) {
      issues.push('数据未验证');
      recommendations.push('请验证数据的准确性和完整性');
      score -= 10;
    }

    // 确定质量等级
    let level: 'measured' | 'calculated' | 'estimated' = 'estimated';
    let confidence: 'high' | 'medium' | 'low' = 'low';

    if (record.dataQuality === 'measured') {
      level = 'measured';
      confidence = 'high';
      score = Math.min(score + 20, 100);
    } else if (record.dataQuality === 'calculated') {
      level = 'calculated';
      confidence = score >= 80 ? 'high' : 'medium';
    } else {
      confidence = score >= 70 ? 'medium' : 'low';
    }

    // 确保分数在合理范围内
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      level,
      confidence,
      issues,
      recommendations,
      lastAssessedAt: new Date(),
    };
  }

  /**
   * 保存质量评估结果
   */
  private async saveQualityAssessment(recordId: string, assessment: DataQualityAssessment): Promise<void> {
    // 更新活动记录的元数据，添加质量评估信息
    const existingRecord = await this.prisma.activityRecord.findUnique({
      where: { id: recordId },
    });

    if (existingRecord) {
      const metadata = existingRecord.metadata ? JSON.parse(existingRecord.metadata as string) : {};
      
      metadata.dataQualityAssessment = {
        ...assessment,
        lastAssessedAt: assessment.lastAssessedAt.toISOString(),
      };

      await this.prisma.activityRecord.update({
        where: { id: recordId },
        data: {
          metadata: JSON.stringify(metadata),
        },
      });
    }
  }

  /**
   * 计算整体质量评分
   */
  private calculateOverallQualityScore(
    measured: number,
    calculated: number,
    estimated: number,
    total: number
  ): number {
    if (total === 0) return 0;
    
    // 加权计算：measured (100分) + calculated (70分) + estimated (40分)
    const weightedScore = (measured * 100 + calculated * 70 + estimated * 40) / total;
    return Math.round(weightedScore);
  }

  /**
   * 生成数据质量报告
   */
  async generateQualityReport(organizationId: string, period?: { start: Date; end: Date }): Promise<any> {
    const where: any = {
      organizationId,
      deletedAt: null,
    };

    if (period) {
      where.createdAt = {
        gte: period.start,
        lte: period.end,
      };
    }

    const records = await this.prisma.activityRecord.findMany({
      where,
      include: {
        calculationResults: true,
      },
    });

    const qualityStats = await this.getOrganizationQualityStats(organizationId);
    
    // 按质量等级分组
    const byQualityLevel = records.reduce((acc, record) => {
      const level = record.dataQuality || 'estimated';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 按Scope分组
    const byScope = records.reduce((acc, record) => {
      const scope = record.scope;
      acc[scope] = (acc[scope] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      summary: qualityStats,
      distribution: {
        byQualityLevel,
        byScope,
      },
      totalRecords: records.length,
      period: period ? {
        start: period.start.toISOString(),
        end: period.end.toISOString(),
      } : null,
      generatedAt: new Date().toISOString(),
    };
  }
}