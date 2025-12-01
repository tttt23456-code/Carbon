import { Injectable } from '@nestjs/common';
import { BaseCalculator } from './base.calculator';
import {
  CalculationInput,
  NormalizedInput,
  EmissionFactor,
  CalculationResult,
} from '../interfaces/calculation.interface';
import { UnitConverterRegistry } from '../units/unit-converter.service';

/**
 * 电力消耗碳排放计量器 (Scope 2)
 * 支持地点法和市场法计算
 */
@Injectable()
export class ElectricityCalculator extends BaseCalculator {
  constructor(unitConverter: UnitConverterRegistry) {
    super(unitConverter);
  }

  getSupportedActivityTypes(): string[] {
    return ['electricity', 'purchased_electricity'];
  }

  protected getNormalizedUnit(activityType: string): string {
    return 'kWh';
  }

  protected getCalculationMethod(): string {
    return 'Electricity Consumption';
  }

  async validate(input: CalculationInput): Promise<NormalizedInput> {
    const normalizedInput = await super.validate(input);

    // 电力特定验证
    const { metadata = {} } = input;
    
    // 检查计算方法（地点法 vs 市场法）
    const method = metadata.method || 'location_based';
    if (!['location_based', 'market_based'].includes(method)) {
      throw new Error('电力计算方法必须是 location_based 或 market_based');
    }

    // 如果是市场法，检查是否有购电协议信息
    if (method === 'market_based' && !metadata.contractType) {
      // 默认使用残余组合排放因子
      normalizedInput.metadata.contractType = 'residual_mix';
    }

    normalizedInput.metadata.method = method;
    return normalizedInput;
  }

  async calculate(input: NormalizedInput, factor: EmissionFactor): Promise<CalculationResult> {
    const method = input.metadata.method || 'location_based';
    
    if (method === 'market_based') {
      return this.calculateMarketBased(input, factor);
    } else {
      return this.calculateLocationBased(input, factor);
    }
  }

  /**
   * 地点法计算
   * 使用电网平均排放因子
   */
  private async calculateLocationBased(
    input: NormalizedInput,
    factor: EmissionFactor,
  ): Promise<CalculationResult> {
    const result = await super.calculate(input, factor);
    
    // 更新计算明细
    result.breakdown.methodology = 'Location-based method using grid average emission factor';
    result.breakdown.assumptions = {
      ...result.breakdown.assumptions,
      method: 'location_based',
      gridRegion: factor.region,
      transmissionLosses: input.metadata.includeLosses ? 'included' : 'excluded',
    };

    return result;
  }

  /**
   * 市场法计算
   * 考虑购电协议和可再生能源证书
   */
  private async calculateMarketBased(
    input: NormalizedInput,
    factor: EmissionFactor,
  ): Promise<CalculationResult> {
    const contractType = input.metadata.contractType;
    let adjustedFactor = factor.factorValue;
    let methodology = 'Market-based method';

    switch (contractType) {
      case 'renewable_ppa':
        // 可再生能源购电协议 - 零排放
        adjustedFactor = 0;
        methodology += ' with renewable PPA (zero emissions)';
        break;
      
      case 'green_certificate':
        // 绿色证书 - 零排放
        adjustedFactor = 0;
        methodology += ' with renewable energy certificates (zero emissions)';
        break;
      
      case 'residual_mix':
        // 残余组合 - 通常比电网平均值更高
        adjustedFactor = factor.factorValue * 1.2; // 示例：增加20%
        methodology += ' using residual mix factor';
        break;
      
      default:
        // 默认使用电网平均值
        methodology += ' using grid average factor';
        break;
    }

    // 基础计算
    const emissionsKg = input.normalizedAmount * adjustedFactor;
    const emissionsTonnes = emissionsKg / 1000;
    const finalEmissions = emissionsTonnes * factor.gwp;

    const result: CalculationResult = {
      tCO2e: finalEmissions,
      breakdown: {
        originalAmount: input.amount,
        originalUnit: input.unit,
        normalizedAmount: input.normalizedAmount,
        normalizedUnit: input.normalizedUnit,
        emissionFactor: adjustedFactor,
        emissionFactorUnit: `kg CO2e/${input.normalizedUnit}`,
        gwp: factor.gwp,
        co2Amount: emissionsTonnes,
        methodology,
        assumptions: {
          ...factor.assumptions,
          ...input.metadata,
          contractType,
          factorAdjustment: adjustedFactor !== factor.factorValue ? 
            `Original: ${factor.factorValue}, Adjusted: ${adjustedFactor}` : 'None',
        },
      },
      method: this.getCalculationMethod(),
      dataQuality: this.determineDataQuality(input, factor),
    };

    return result;
  }

  /**
   * 计算传输损失调整
   */
  private calculateTransmissionLossAdjustment(consumption: number, lossRate: number = 0.065): number {
    // 考虑传输损失：实际发电量 = 消费量 / (1 - 损失率)
    return consumption / (1 - lossRate);
  }
}