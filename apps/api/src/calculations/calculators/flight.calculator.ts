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
 * 航班碳排放计算器 (Scope 3)
 * 支持不同航程和舱位的排放计算
 */
@Injectable()
export class FlightCalculator extends BaseCalculator {
  // 舱位系数（相对于经济舱）
  private readonly cabinClassMultipliers = {
    economy: 1.0,
    premium_economy: 1.6,
    business: 2.8,
    first: 4.0,
  };

  // 航程分类系数
  private readonly distanceClassFactors = {
    domestic_short: { threshold: 500, factor: 1.0 }, // < 500km
    domestic_medium: { threshold: 1500, factor: 0.95 }, // 500-1500km
    domestic_long: { threshold: 3000, factor: 0.90 }, // 1500-3000km
    international_short: { threshold: 3000, factor: 0.95 }, // < 3000km
    international_medium: { threshold: 6000, factor: 0.85 }, // 3000-6000km
    international_long: { threshold: Infinity, factor: 0.80 }, // > 6000km
  };

  constructor(unitConverter: UnitConverterRegistry) {
    super(unitConverter);
  }

  getSupportedActivityTypes(): string[] {
    return [
      'flight_domestic_short',
      'flight_domestic_medium', 
      'flight_domestic_long',
      'flight_international_short',
      'flight_international_medium',
      'flight_international_long',
      'flight_general', // 通用航班类型
    ];
  }

  protected getNormalizedUnit(activityType: string): string {
    return 'passenger-km';
  }

  protected getCalculationMethod(): string {
    return 'Flight Emissions';
  }

  async validate(input: CalculationInput): Promise<NormalizedInput> {
    const normalizedInput = await super.validate(input);
    const { metadata = {} } = input;

    // 航班特定验证
    if (metadata.distance && (typeof metadata.distance !== 'number' || metadata.distance <= 0)) {
      throw new Error('航班距离必须为正数');
    }

    if (metadata.passengers && (typeof metadata.passengers !== 'number' || metadata.passengers <= 0)) {
      throw new Error('乘客数量必须为正数');
    }

    // 验证舱位等级
    const cabinClass = metadata.cabinClass || 'economy';
    if (!this.cabinClassMultipliers[cabinClass]) {
      throw new Error(`不支持的舱位等级: ${cabinClass}`);
    }

    // 如果提供了距离和乘客数，计算passenger-km
    if (metadata.distance && metadata.passengers) {
      const passengerKm = metadata.distance * metadata.passengers;
      if (input.unit === 'km' && input.amount === metadata.distance) {
        // 输入是距离，需要转换为passenger-km
        normalizedInput.normalizedAmount = passengerKm;
        normalizedInput.amount = passengerKm;
        normalizedInput.unit = 'passenger-km';
      }
    }

    normalizedInput.metadata = {
      ...metadata,
      cabinClass: cabinClass,
    };

    return normalizedInput;
  }

  async calculate(input: NormalizedInput, factor: EmissionFactor): Promise<CalculationResult> {
    const cabinClass = input.metadata.cabinClass || 'economy';
    const cabinMultiplier = this.cabinClassMultipliers[cabinClass];
    
    // 获取航程类型
    const flightType = this.determineFlightType(input);
    const distanceFactor = this.getDistanceFactor(flightType);
    
    // 调整排放因子
    let adjustedFactor = factor.factorValue * cabinMultiplier * distanceFactor;
    
    // 考虑RFI（辐射强迫指数）效应
    const rfiMultiplier = input.metadata.includeRFI ? 2.7 : 1.0;
    adjustedFactor *= rfiMultiplier;
    
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
        methodology: 'Flight emissions calculation with cabin class and distance adjustments',
        assumptions: {
          ...factor.assumptions,
          ...input.metadata,
          cabinClass,
          cabinMultiplier,
          flightType,
          distanceFactor,
          rfiMultiplier,
          originalEmissionFactor: factor.factorValue,
          adjustedEmissionFactor: adjustedFactor,
          rfiNote: input.metadata.includeRFI ? 
            'Includes radiative forcing index (RFI) for high-altitude emissions' : 
            'Direct CO2 emissions only',
        },
      },
      method: this.getCalculationMethod(),
      dataQuality: this.determineDataQuality(input, factor),
    };

    return result;
  }

  /**
   * 确定航班类型
   */
  private determineFlightType(input: NormalizedInput): string {
    const { metadata } = input;
    
    // 如果明确指定了航班类型
    if (metadata.flightType) {
      return metadata.flightType;
    }

    // 从活动类型推断
    if (input.activityType !== 'flight_general') {
      return input.activityType.replace('flight_', '');
    }

    // 根据距离推断
    const distance = metadata.distance;
    if (!distance) {
      return 'unknown';
    }

    for (const [type, config] of Object.entries(this.distanceClassFactors)) {
      if (distance <= config.threshold) {
        return type;
      }
    }

    return 'international_long';
  }

  /**
   * 获取距离系数
   */
  private getDistanceFactor(flightType: string): number {
    const config = this.distanceClassFactors[flightType];
    return config ? config.factor : 1.0;
  }

  /**
   * 计算往返航班
   */
  calculateRoundTrip(input: NormalizedInput, factor: EmissionFactor): Promise<CalculationResult> {
    // 往返航班 = 单程 × 2
    const roundTripInput = {
      ...input,
      normalizedAmount: input.normalizedAmount * 2,
      metadata: {
        ...input.metadata,
        tripType: 'round_trip',
      },
    };

    return this.calculate(roundTripInput, factor);
  }

  /**
   * 获取支持的舱位等级
   */
  getSupportedCabinClasses(): string[] {
    return Object.keys(this.cabinClassMultipliers);
  }

  /**
   * 获取航程分类信息
   */
  getDistanceClassifications(): Record<string, any> {
    return this.distanceClassFactors;
  }

  /**
   * 估算航班距离（基于机场代码）
   */
  async estimateFlightDistance(
    departureAirport: string, 
    arrivalAirport: string
  ): Promise<number | null> {
    // 这里可以集成航班距离API或使用机场坐标数据库
    // 简化实现：返回null，需要用户提供距离
    console.warn('航班距离估算功能需要外部API支持');
    return null;
  }
}