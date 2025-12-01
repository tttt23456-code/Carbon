import { Injectable } from '@nestjs/common';
import {
  Calculator,
  CalculationInput,
  NormalizedInput,
  EmissionFactor,
  CalculationResult,
  CalculationBreakdown,
} from '../interfaces/calculation.interface';
import { UnitConverterRegistry } from '../units/unit-converter.service';

/**
 * 基础计量器抽象类
 */
@Injectable()
export abstract class BaseCalculator implements Calculator {
  constructor(protected unitConverter: UnitConverterRegistry) {}

  abstract getSupportedActivityTypes(): string[];

  async validate(input: CalculationInput): Promise<NormalizedInput> {
    const { activityType, amount, unit, metadata = {} } = input;

    // 基础验证
    if (!activityType || !this.getSupportedActivityTypes().includes(activityType)) {
      throw new Error(`不支持的活动类型: ${activityType}`);
    }

    if (typeof amount !== 'number' || amount < 0) {
      throw new Error('活动数据量必须为非负数');
    }

    if (!unit || !this.unitConverter.isSupported(unit)) {
      throw new Error(`不支持的单位: ${unit}`);
    }

    // 获取标准化单位
    const normalizedUnit = this.getNormalizedUnit(activityType);
    const normalizedAmount = this.unitConverter.convert(amount, unit, normalizedUnit);

    return {
      activityType,
      amount,
      unit,
      normalizedAmount,
      normalizedUnit,
      metadata,
    };
  }

  async calculate(input: NormalizedInput, factor: EmissionFactor): Promise<CalculationResult> {
    // 确保排放因子和输入的活动类型匹配
    if (factor.activityType !== input.activityType) {
      throw new Error(`排放因子类型不匹配: ${factor.activityType} vs ${input.activityType}`);
    }

    // 单位转换（如果需要）
    let factorValue = factor.factorValue;
    if (factor.factorUnit !== `kg CO2e/${input.normalizedUnit}`) {
      // 这里可以添加更复杂的单位转换逻辑
      factorValue = this.convertEmissionFactor(factor, input.normalizedUnit);
    }

    // 基础计算: emissions = amount * factor
    const emissionsKg = input.normalizedAmount * factorValue;
    const emissionsTonnes = emissionsKg / 1000; // 转换为吨

    // 应用GWP（如果不是CO2）
    const finalEmissions = emissionsTonnes * factor.gwp;

    // 构建计算明细
    const breakdown: CalculationBreakdown = {
      originalAmount: input.amount,
      originalUnit: input.unit,
      normalizedAmount: input.normalizedAmount,
      normalizedUnit: input.normalizedUnit,
      emissionFactor: factorValue,
      emissionFactorUnit: `kg CO2e/${input.normalizedUnit}`,
      gwp: factor.gwp,
      co2Amount: emissionsTonnes,
      methodology: factor.methodology || 'Direct multiplication',
      assumptions: {
        ...factor.assumptions,
        ...input.metadata,
      },
    };

    // 添加其他温室气体的明细（如果适用）
    if (factor.gas === 'CH4') {
      breakdown.ch4Amount = emissionsTonnes / factor.gwp;
    } else if (factor.gas === 'N2O') {
      breakdown.n2oAmount = emissionsTonnes / factor.gwp;
    }

    return {
      tCO2e: finalEmissions,
      breakdown,
      method: this.getCalculationMethod(),
      dataQuality: this.determineDataQuality(input, factor),
    };
  }

  /**
   * 获取活动类型的标准化单位
   */
  protected abstract getNormalizedUnit(activityType: string): string;

  /**
   * 获取计算方法名称
   */
  protected abstract getCalculationMethod(): string;

  /**
   * 转换排放因子单位（默认实现）
   */
  protected convertEmissionFactor(factor: EmissionFactor, targetUnit: string): number {
    // 简单实现，实际可能需要更复杂的转换逻辑
    return factor.factorValue;
  }

  /**
   * 确定数据质量
   */
  protected determineDataQuality(
    input: NormalizedInput,
    factor: EmissionFactor,
  ): 'measured' | 'calculated' | 'estimated' {
    // 根据输入的元数据和排放因子的来源确定数据质量
    if (input.metadata.dataQuality) {
      return input.metadata.dataQuality;
    }

    // 默认逻辑
    if (factor.source === 'CUSTOM') {
      return 'measured';
    } else if (factor.source === 'IPCC' || factor.source === 'EPA') {
      return 'calculated';
    } else {
      return 'estimated';
    }
  }
}