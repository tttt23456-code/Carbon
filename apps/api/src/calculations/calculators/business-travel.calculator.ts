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
 * 商务差旅碳排放计量器 (Scope 3)
 * 支持员工通勤、商务旅行等差旅相关排放计算
 */
@Injectable()
export class BusinessTravelCalculator extends BaseCalculator {
  // 通勤方式系数
  private readonly commuteModeFactors = {
    walking: 0,
    cycling: 0,
    public_transport: 1.0,
    carpooling: 0.5,
    electric_vehicle: 0.2,
    hybrid_vehicle: 0.7,
    gasoline_vehicle: 1.0,
    diesel_vehicle: 1.1,
    motorcycle: 0.8,
    taxi: 1.2,
  };

  // 差旅交通方式系数
  private readonly travelModeFactors = {
    walking: 0,
    cycling: 0,
    public_transport: 1.0,
    car_rental: 1.0,
    company_vehicle: 1.0,
    taxi: 1.2,
    ride_sharing: 0.8,
  };

  constructor(unitConverter: UnitConverterRegistry) {
    super(unitConverter);
  }

  getSupportedActivityTypes(): string[] {
    return [
      'employee_commuting',
      'business_travel',
      'conference_attendance',
      'client_visits',
      'training_sessions',
    ];
  }

  protected getNormalizedUnit(activityType: string): string {
    if (activityType === 'employee_commuting') {
      return 'km'; // 通勤距离
    }
    return 'passenger-km'; // 差旅按乘客公里计算
  }

  protected getCalculationMethod(): string {
    return 'Business Travel';
  }

  async validate(input: CalculationInput): Promise<NormalizedInput> {
    const normalizedInput = await super.validate(input);
    const { metadata = {} } = input;

    // 差旅特定验证
    if (metadata.distance && (typeof metadata.distance !== 'number' || metadata.distance <= 0)) {
      throw new Error('差旅距离必须为正数');
    }

    if (metadata.frequency && (typeof metadata.frequency !== 'number' || metadata.frequency <= 0)) {
      throw new Error('频率必须为正数');
    }

    // 验证交通方式
    const transportMode = metadata.transportMode;
    if (transportMode) {
      const isCommute = input.activityType === 'employee_commuting';
      const validModes = isCommute ? this.commuteModeFactors : this.travelModeFactors;
      
      if (!validModes[transportMode]) {
        throw new Error(`不支持的交通方式: ${transportMode}`);
      }
    }

    // 如果是员工通勤，计算往返距离
    if (input.activityType === 'employee_commuting' && metadata.distance) {
      const roundTripDistance = metadata.distance * 2; // 往返
      const frequency = metadata.frequency || 1;
      const workdays = metadata.workdays || 22; // 默认每月工作日
      
      // 计算月度总距离
      const monthlyDistance = roundTripDistance * frequency * workdays;
      
      normalizedInput.normalizedAmount = monthlyDistance;
      normalizedInput.metadata = {
        ...metadata,
        roundTripDistance,
        monthlyDistance,
      };
    }

    return normalizedInput;
  }

  async calculate(input: NormalizedInput, factor: EmissionFactor): Promise<CalculationResult> {
    const isCommute = input.activityType === 'employee_commuting';
    const transportMode = input.metadata.transportMode || 'public_transport';
    const modeFactors = isCommute ? this.commuteModeFactors : this.travelModeFactors;
    const modeMultiplier = modeFactors[transportMode] || 1.0;

    // 调整排放因子
    let adjustedFactor = factor.factorValue * modeMultiplier;

    // 考虑载荷因子（多人拼车等）
    const occupancy = input.metadata.occupancy || 1;
    if (occupancy > 1) {
      adjustedFactor /= occupancy; // 分摊排放
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
        methodology: isCommute ? 
          'Employee commuting emissions with transport mode adjustment' :
          'Business travel emissions with occupancy adjustment',
        assumptions: {
          ...factor.assumptions,
          ...input.metadata,
          transportMode,
          modeMultiplier,
          occupancy,
          originalEmissionFactor: factor.factorValue,
          adjustedEmissionFactor: adjustedFactor,
        },
      },
      method: this.getCalculationMethod(),
      dataQuality: this.determineDataQuality(input, factor),
    };

    return result;
  }

  /**
   * 计算年度通勤排放
   */
  async calculateAnnualCommute(
    monthlyInput: NormalizedInput,
    factor: EmissionFactor
  ): Promise<CalculationResult> {
    // 年度计算 = 月度 × 12
    const annualInput = {
      ...monthlyInput,
      normalizedAmount: monthlyInput.normalizedAmount * 12,
      metadata: {
        ...monthlyInput.metadata,
        period: 'annual',
      },
    };

    return this.calculate(annualInput, factor);
  }

  /**
   * 获取支持的通勤方式
   */
  getSupportedCommuteModes(): string[] {
    return Object.keys(this.commuteModeFactors);
  }

  /**
   * 获取支持的差旅方式
   */
  getSupportedTravelModes(): string[] {
    return Object.keys(this.travelModeFactors);
  }
}