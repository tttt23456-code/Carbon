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
 * 燃料燃烧碳排放计量器 (Scope 1)
 * 支持各种燃料类型的燃烧排放计算
 */
@Injectable()
export class FuelCombustionCalculator extends BaseCalculator {
  // 燃料属性数据库
  private readonly fuelProperties = {
    natural_gas: {
      density: 0.717, // kg/m³ (标准状态)
      netCalorificValue: 50.0, // MJ/kg
      carbonContent: 0.561, // kg C/kg fuel
      oxidationFactor: 0.995,
    },
    diesel: {
      density: 832, // kg/m³
      netCalorificValue: 43.0, // MJ/kg
      carbonContent: 0.870, // kg C/kg fuel
      oxidationFactor: 0.99,
    },
    gasoline: {
      density: 742, // kg/m³
      netCalorificValue: 44.3, // MJ/kg
      carbonContent: 0.855, // kg C/kg fuel
      oxidationFactor: 0.99,
    },
    lpg: {
      density: 520, // kg/m³
      netCalorificValue: 47.3, // MJ/kg
      carbonContent: 0.826, // kg C/kg fuel
      oxidationFactor: 0.995,
    },
    coal: {
      density: 1400, // kg/m³ (bulk density)
      netCalorificValue: 25.0, // MJ/kg (varies widely)
      carbonContent: 0.746, // kg C/kg fuel
      oxidationFactor: 0.98,
    },
    biomass: {
      density: 600, // kg/m³ (varies widely)
      netCalorificValue: 15.0, // MJ/kg
      carbonContent: 0.451, // kg C/kg fuel
      oxidationFactor: 0.99,
      isBiogenic: true, // 生物质燃料
    },
  };

  constructor(unitConverter: UnitConverterRegistry) {
    super(unitConverter);
  }

  getSupportedActivityTypes(): string[] {
    return [
      'natural_gas',
      'diesel',
      'gasoline', 
      'lpg',
      'coal',
      'biomass',
      'fuel_oil',
      'heating_oil',
    ];
  }

  protected getNormalizedUnit(activityType: string): string {
    // 大多数燃料以体积计量（液体）或质量计量（气体和固体）
    if (['natural_gas'].includes(activityType)) {
      return 'm3'; // 气体燃料
    } else if (['coal', 'biomass'].includes(activityType)) {
      return 'kg'; // 固体燃料
    } else {
      return 'L'; // 液体燃料
    }
  }

  protected getCalculationMethod(): string {
    return 'Fuel Combustion';
  }

  async validate(input: CalculationInput): Promise<NormalizedInput> {
    const normalizedInput = await super.validate(input);

    // 燃料特定验证
    const { metadata = {} } = input;
    
    // 检查燃料类型是否有属性数据
    const activityType = input.activityType;
    if (!this.fuelProperties[activityType] && !metadata.customProperties) {
      console.warn(`燃料类型 ${activityType} 没有预定义属性，将使用排放因子直接计算`);
    }

    // 验证燃料质量参数（如果提供）
    if (metadata.density && (typeof metadata.density !== 'number' || metadata.density <= 0)) {
      throw new Error('燃料密度必须为正数');
    }

    if (metadata.netCalorificValue && (typeof metadata.netCalorificValue !== 'number' || metadata.netCalorificValue <= 0)) {
      throw new Error('燃料净热值必须为正数');
    }

    return normalizedInput;
  }

  async calculate(input: NormalizedInput, factor: EmissionFactor): Promise<CalculationResult> {
    const activityType = input.activityType;
    const fuelProps = this.fuelProperties[activityType];

    if (fuelProps || input.metadata.customProperties) {
      // 使用燃料属性计算（更精确）
      return this.calculateWithFuelProperties(input, factor, fuelProps);
    } else {
      // 使用排放因子直接计算
      return super.calculate(input, factor);
    }
  }

  /**
   * 使用燃料属性计算排放量
   */
  private async calculateWithFuelProperties(
    input: NormalizedInput,
    factor: EmissionFactor,
    fuelProps: any,
  ): Promise<CalculationResult> {
    const properties = input.metadata.customProperties || fuelProps;
    const { 
      density, 
      netCalorificValue, 
      carbonContent, 
      oxidationFactor = 1.0,
      isBiogenic = false 
    } = properties;

    let fuelMassKg: number;
    
    // 转换为质量（kg）
    if (input.normalizedUnit === 'L') {
      // 液体燃料：体积 × 密度
      fuelMassKg = input.normalizedAmount * (density / 1000); // density from kg/m³ to kg/L
    } else if (input.normalizedUnit === 'm3') {
      // 气体燃料：体积 × 密度
      fuelMassKg = input.normalizedAmount * density;
    } else if (input.normalizedUnit === 'kg') {
      // 已经是质量单位
      fuelMassKg = input.normalizedAmount;
    } else {
      throw new Error(`不支持的燃料单位: ${input.normalizedUnit}`);
    }

    // 计算碳排放量
    // CO2 排放 = 燃料质量 × 碳含量 × 氧化因子 × (44/12) [CO2/C 分子量比]
    const carbonEmittedKg = fuelMassKg * carbonContent * oxidationFactor;
    const co2EmittedKg = carbonEmittedKg * (44 / 12); // 碳转CO2
    const co2EmittedTonnes = co2EmittedKg / 1000;

    // 对于生物质燃料，CO2排放通常被认为是碳中性的
    const finalEmissions = isBiogenic ? 0 : co2EmittedTonnes;

    const result: CalculationResult = {
      tCO2e: finalEmissions,
      breakdown: {
        originalAmount: input.amount,
        originalUnit: input.unit,
        normalizedAmount: input.normalizedAmount,
        normalizedUnit: input.normalizedUnit,
        emissionFactor: factor.factorValue,
        emissionFactorUnit: factor.factorUnit,
        gwp: 1, // CO2的GWP为1
        co2Amount: co2EmittedTonnes,
        methodology: 'Fuel properties-based calculation using carbon content method',
        assumptions: {
          ...factor.assumptions,
          ...input.metadata,
          fuelMass: `${fuelMassKg.toFixed(2)} kg`,
          density: `${density} kg/m³`,
          netCalorificValue: `${netCalorificValue} MJ/kg`,
          carbonContent: `${carbonContent} kg C/kg fuel`,
          oxidationFactor: oxidationFactor,
          carbonEmitted: `${carbonEmittedKg.toFixed(2)} kg C`,
          co2EmittedFromCarbon: `${co2EmittedTonnes.toFixed(4)} tonnes CO2`,
          isBiogenic: isBiogenic,
          biomassNote: isBiogenic ? 'Biogenic CO2 emissions are considered carbon neutral' : undefined,
        },
      },
      method: this.getCalculationMethod(),
      dataQuality: this.determineDataQuality(input, factor),
    };

    return result;
  }

  /**
   * 计算能源含量（用于验证）
   */
  private calculateEnergyContent(fuelMassKg: number, netCalorificValue: number): number {
    return fuelMassKg * netCalorificValue; // MJ
  }

  /**
   * 获取燃料属性
   */
  getFuelProperties(activityType: string) {
    return this.fuelProperties[activityType] || null;
  }

  /**
   * 设置自定义燃料属性
   */
  validateCustomFuelProperties(properties: any): boolean {
    const required = ['density', 'netCalorificValue', 'carbonContent'];
    return required.every(prop => 
      typeof properties[prop] === 'number' && properties[prop] > 0
    );
  }
}