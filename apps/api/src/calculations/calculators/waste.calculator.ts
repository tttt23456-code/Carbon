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
 * 废弃物处理碳排放计算器 (Scope 3)
 * 支持不同废弃物类型和处理方式的排放计算
 */
@Injectable()
export class WasteCalculator extends BaseCalculator {
  // 废弃物处理方式
  private readonly treatmentMethods = {
    landfill: {
      description: '填埋处理',
      hasMethaneCH4: true,
      hasCO2: true,
      hasN2O: false,
      methaneCaptureRate: 0.75, // 默认甲烷回收率
    },
    incineration: {
      description: '焚烧处理',
      hasMethaneCH4: false,
      hasCO2: true,
      hasN2O: true,
      energyRecovery: true,
    },
    recycling: {
      description: '回收处理',
      hasMethaneCH4: false,
      hasCO2: false,
      hasN2O: false,
      isReduction: true, // 减排
    },
    composting: {
      description: '堆肥处理',
      hasMethaneCH4: true,
      hasCO2: true,
      hasN2O: true,
      isBiogenic: true,
    },
    anaerobic_digestion: {
      description: '厌氧消化',
      hasMethaneCH4: true,
      hasCO2: true,
      hasN2O: false,
      energyRecovery: true,
      methaneCaptureRate: 0.95,
    },
  };

  // 废弃物类型特性
  private readonly wasteTypeProperties = {
    mixed_municipal: {
      description: '混合生活垃圾',
      organicContent: 0.3,
      moistureContent: 0.25,
      carbonContent: 0.5,
    },
    food_waste: {
      description: '厨余垃圾',
      organicContent: 0.9,
      moistureContent: 0.7,
      carbonContent: 0.48,
    },
    paper_cardboard: {
      description: '纸类',
      organicContent: 0.95,
      moistureContent: 0.1,
      carbonContent: 0.43,
    },
    plastic: {
      description: '塑料',
      organicContent: 0,
      moistureContent: 0.02,
      carbonContent: 0.75,
      recyclingPotential: 0.8,
    },
    glass: {
      description: '玻璃',
      organicContent: 0,
      moistureContent: 0.02,
      carbonContent: 0,
      recyclingPotential: 0.9,
    },
    metal: {
      description: '金属',
      organicContent: 0,
      moistureContent: 0.02,
      carbonContent: 0,
      recyclingPotential: 0.95,
    },
    textile: {
      description: '纺织品',
      organicContent: 0.8,
      moistureContent: 0.1,
      carbonContent: 0.5,
    },
    wood: {
      description: '木材',
      organicContent: 0.95,
      moistureContent: 0.2,
      carbonContent: 0.5,
      isBiogenic: true,
    },
    electronic: {
      description: '电子废物',
      organicContent: 0.1,
      moistureContent: 0.05,
      carbonContent: 0.2,
      hasHazardous: true,
    },
  };

  constructor(unitConverter: UnitConverterRegistry) {
    super(unitConverter);
  }

  getSupportedActivityTypes(): string[] {
    return [
      'waste_landfill',
      'waste_incineration',
      'waste_recycling',
      'waste_composting',
      'waste_anaerobic_digestion',
      'waste_treatment_general',
    ];
  }

  protected getNormalizedUnit(activityType: string): string {
    return 'kg';
  }

  protected getCalculationMethod(): string {
    return 'Waste Treatment';
  }

  async validate(input: CalculationInput): Promise<NormalizedInput> {
    const normalizedInput = await super.validate(input);
    const { metadata = {} } = input;

    // 废弃物特定验证
    const treatmentMethod = this.getTreatmentMethod(input.activityType);
    const wasteType = metadata.wasteType || 'mixed_municipal';

    if (!this.wasteTypeProperties[wasteType]) {
      throw new Error(`不支持的废弃物类型: ${wasteType}`);
    }

    // 验证甲烷回收率（适用于填埋）
    if (treatmentMethod === 'landfill' && metadata.methaneCaptureRate) {
      const rate = metadata.methaneCaptureRate;
      if (typeof rate !== 'number' || rate < 0 || rate > 1) {
        throw new Error('甲烷回收率必须在0-1之间');
      }
    }

    // 验证能源回收率（适用于焚烧和厌氧消化）
    if (['incineration', 'anaerobic_digestion'].includes(treatmentMethod) && metadata.energyRecoveryRate) {
      const rate = metadata.energyRecoveryRate;
      if (typeof rate !== 'number' || rate < 0 || rate > 1) {
        throw new Error('能源回收率必须在0-1之间');
      }
    }

    normalizedInput.metadata = {
      ...metadata,
      treatmentMethod,
      wasteType,
    };

    return normalizedInput;
  }

  async calculate(input: NormalizedInput, factor: EmissionFactor): Promise<CalculationResult> {
    const treatmentMethod = input.metadata.treatmentMethod;
    const wasteType = input.metadata.wasteType;
    const wasteProps = this.wasteTypeProperties[wasteType];
    const treatmentProps = this.treatmentMethods[treatmentMethod];

    let totalEmissions = 0;
    const gasBreakdown: any = {};

    switch (treatmentMethod) {
      case 'landfill':
        totalEmissions = await this.calculateLandfillEmissions(input, factor, wasteProps, treatmentProps);
        break;
      case 'incineration':
        totalEmissions = await this.calculateIncinerationEmissions(input, factor, wasteProps, treatmentProps);
        break;
      case 'recycling':
        totalEmissions = await this.calculateRecyclingBenefits(input, factor, wasteProps);
        break;
      case 'composting':
        totalEmissions = await this.calculateCompostingEmissions(input, factor, wasteProps, treatmentProps);
        break;
      case 'anaerobic_digestion':
        totalEmissions = await this.calculateAnaerobicDigestionEmissions(input, factor, wasteProps, treatmentProps);
        break;
      default:
        // 使用通用排放因子
        totalEmissions = (input.normalizedAmount * factor.factorValue) / 1000;
        break;
    }

    const result: CalculationResult = {
      tCO2e: totalEmissions,
      breakdown: {
        originalAmount: input.amount,
        originalUnit: input.unit,
        normalizedAmount: input.normalizedAmount,
        normalizedUnit: input.normalizedUnit,
        emissionFactor: factor.factorValue,
        emissionFactorUnit: factor.factorUnit,
        gwp: factor.gwp,
        co2Amount: totalEmissions,
        methodology: `${treatmentProps.description}废弃物处理排放计算`,
        assumptions: {
          ...factor.assumptions,
          ...input.metadata,
          treatmentMethod,
          wasteType,
          wasteProperties: wasteProps,
          treatmentProperties: treatmentProps,
          gasBreakdown,
        },
      },
      method: this.getCalculationMethod(),
      dataQuality: this.determineDataQuality(input, factor),
    };

    return result;
  }

  /**
   * 计算填埋排放
   */
  private async calculateLandfillEmissions(
    input: NormalizedInput,
    factor: EmissionFactor,
    wasteProps: any,
    treatmentProps: any,
  ): Promise<number> {
    const wasteKg = input.normalizedAmount;
    const organicFraction = wasteProps.organicContent;
    const methaneCaptureRate = input.metadata.methaneCaptureRate || treatmentProps.methaneCaptureRate;

    // 计算有机碳含量
    const organicWaste = wasteKg * organicFraction;
    const carbonContent = organicWaste * wasteProps.carbonContent;

    // 甲烷生成潜力 (CH4 generation potential)
    const methaneYield = 0.5; // kg CH4 / kg organic carbon (simplified)
    const potentialMethane = carbonContent * methaneYield;

    // 考虑甲烷回收
    const emittedMethane = potentialMethane * (1 - methaneCaptureRate);

    // 转换为CO2当量 (GWP of CH4 = 25)
    const ch4EmissionsTonnes = emittedMethane / 1000;
    const co2eFromCH4 = ch4EmissionsTonnes * 25;

    // 添加直接CO2排放（如果有）
    const directCO2 = factor.gas === 'CO2' ? (wasteKg * factor.factorValue) / 1000 : 0;

    return co2eFromCH4 + directCO2;
  }

  /**
   * 计算焚烧排放
   */
  private async calculateIncinerationEmissions(
    input: NormalizedInput,
    factor: EmissionFactor,
    wasteProps: any,
    treatmentProps: any,
  ): Promise<number> {
    const wasteKg = input.normalizedAmount;
    
    // 基础CO2排放
    let co2Emissions = (wasteKg * factor.factorValue) / 1000;

    // 生物质部分被认为是碳中性的
    if (wasteProps.isBiogenic) {
      const biogenicFraction = wasteProps.organicContent || 0.5;
      co2Emissions *= (1 - biogenicFraction);
    }

    // 考虑能源回收的减排效益
    const energyRecoveryRate = input.metadata.energyRecoveryRate || 0.25;
    const energyOffset = co2Emissions * energyRecoveryRate * 0.3; // 假设30%的减排效益

    return Math.max(0, co2Emissions - energyOffset);
  }

  /**
   * 计算回收的减排效益
   */
  private async calculateRecyclingBenefits(
    input: NormalizedInput,
    factor: EmissionFactor,
    wasteProps: any,
  ): Promise<number> {
    const wasteKg = input.normalizedAmount;
    const recyclingPotential = wasteProps.recyclingPotential || 0.8;
    
    // 回收通常产生负排放（减排效益）
    const avoidedEmissions = (wasteKg * recyclingPotential * Math.abs(factor.factorValue)) / 1000;
    
    return -avoidedEmissions; // 负值表示减排
  }

  /**
   * 计算堆肥排放
   */
  private async calculateCompostingEmissions(
    input: NormalizedInput,
    factor: EmissionFactor,
    wasteProps: any,
    treatmentProps: any,
  ): Promise<number> {
    const wasteKg = input.normalizedAmount;
    
    // 堆肥过程的甲烷和N2O排放
    const ch4Emissions = wasteKg * 0.004; // kg CH4/kg waste (simplified)
    const n2oEmissions = wasteKg * 0.0003; // kg N2O/kg waste (simplified)

    const ch4CO2e = (ch4Emissions * 25) / 1000; // tonnes CO2e
    const n2oCO2e = (n2oEmissions * 298) / 1000; // tonnes CO2e

    // 生物质CO2被认为是碳中性的
    return ch4CO2e + n2oCO2e;
  }

  /**
   * 计算厌氧消化排放
   */
  private async calculateAnaerobicDigestionEmissions(
    input: NormalizedInput,
    factor: EmissionFactor,
    wasteProps: any,
    treatmentProps: any,
  ): Promise<number> {
    const wasteKg = input.normalizedAmount;
    const methaneCaptureRate = input.metadata.methaneCaptureRate || treatmentProps.methaneCaptureRate;
    
    // 厌氧消化产生的甲烷大部分被回收利用
    const methaneProduced = wasteKg * wasteProps.organicContent * 0.3; // kg CH4/kg organic waste
    const escapedMethane = methaneProduced * (1 - methaneCaptureRate);
    
    const ch4CO2e = (escapedMethane * 25) / 1000;
    
    // 考虑能源回收的减排效益
    const energyBenefit = (methaneProduced * methaneCaptureRate * 0.5) / 1000; // 假设50%的减排效益
    
    return Math.max(0, ch4CO2e - energyBenefit);
  }

  /**
   * 获取处理方式
   */
  private getTreatmentMethod(activityType: string): string {
    const mapping = {
      'waste_landfill': 'landfill',
      'waste_incineration': 'incineration',
      'waste_recycling': 'recycling',
      'waste_composting': 'composting',
      'waste_anaerobic_digestion': 'anaerobic_digestion',
    };

    return mapping[activityType] || 'landfill';
  }

  /**
   * 获取支持的废弃物类型
   */
  getSupportedWasteTypes(): string[] {
    return Object.keys(this.wasteTypeProperties);
  }

  /**
   * 获取支持的处理方式
   */
  getSupportedTreatmentMethods(): string[] {
    return Object.keys(this.treatmentMethods);
  }

  /**
   * 获取废弃物类型属性
   */
  getWasteTypeProperties(wasteType: string) {
    return this.wasteTypeProperties[wasteType] || null;
  }
}