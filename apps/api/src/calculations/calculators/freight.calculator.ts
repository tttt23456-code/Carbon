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
 * 货运碳排放计算器 (Scope 3)
 * 支持公路、铁路、海运、空运等运输方式
 */
@Injectable()
export class FreightCalculator extends BaseCalculator {
  // 运输方式系数
  private readonly transportModeFactors = {
    road_freight: {
      baseUnit: 'tonne-km',
      description: '公路货运',
      loadFactors: {
        full_load: 1.0,
        average_load: 1.5, // 空载率调整
        half_load: 2.0,
      },
    },
    rail_freight: {
      baseUnit: 'tonne-km', 
      description: '铁路货运',
      loadFactors: {
        full_load: 1.0,
        average_load: 1.2,
      },
    },
    sea_freight: {
      baseUnit: 'tonne-km',
      description: '海运货运',
      loadFactors: {
        full_load: 1.0,
        average_load: 1.1,
      },
    },
    air_freight: {
      baseUnit: 'tonne-km',
      description: '空运货运',
      loadFactors: {
        full_load: 1.0,
        average_load: 1.3,
      },
    },
    pipeline: {
      baseUnit: 'tonne-km',
      description: '管道运输',
      loadFactors: {
        full_load: 1.0,
      },
    },
  };

  // 车辆类型系数（公路运输）
  private readonly vehicleTypeFactors = {
    light_truck: 0.8,
    medium_truck: 1.0,
    heavy_truck: 1.2,
    articulated_truck: 1.4,
    van: 0.6,
  };

  constructor(unitConverter: UnitConverterRegistry) {
    super(unitConverter);
  }

  getSupportedActivityTypes(): string[] {
    return [
      'road_freight',
      'rail_freight', 
      'sea_freight',
      'air_freight',
      'pipeline_transport',
      'courier_delivery',
      'last_mile_delivery',
    ];
  }

  protected getNormalizedUnit(activityType: string): string {
    return 'tonne-km';
  }

  protected getCalculationMethod(): string {
    return 'Freight Transport';
  }

  async validate(input: CalculationInput): Promise<NormalizedInput> {
    const normalizedInput = await super.validate(input);
    const { metadata = {} } = input;

    // 货运特定验证
    if (metadata.cargoWeight && (typeof metadata.cargoWeight !== 'number' || metadata.cargoWeight <= 0)) {
      throw new Error('货物重量必须为正数');
    }

    if (metadata.distance && (typeof metadata.distance !== 'number' || metadata.distance <= 0)) {
      throw new Error('运输距离必须为正数');
    }

    // 如果提供了重量和距离，计算tonne-km
    if (metadata.cargoWeight && metadata.distance) {
      const cargoTonnes = metadata.cargoWeight / 1000; // 转换为吨
      const tonneKm = cargoTonnes * metadata.distance;
      
      if (input.unit === 'kg' && input.amount === metadata.cargoWeight) {
        // 输入是重量，需要结合距离计算tonne-km
        normalizedInput.normalizedAmount = tonneKm;
        normalizedInput.amount = tonneKm;
        normalizedInput.unit = 'tonne-km';
      }
    }

    // 验证载荷因子
    const loadFactor = metadata.loadFactor || 'average_load';
    const transportMode = this.getTransportMode(input.activityType);
    const modeConfig = this.transportModeFactors[transportMode];
    
    if (modeConfig && !modeConfig.loadFactors[loadFactor]) {
      throw new Error(`运输方式 ${transportMode} 不支持载荷因子 ${loadFactor}`);
    }

    normalizedInput.metadata = {
      ...metadata,
      loadFactor,
      transportMode,
    };

    return normalizedInput;
  }

  async calculate(input: NormalizedInput, factor: EmissionFactor): Promise<CalculationResult> {
    const transportMode = input.metadata.transportMode;
    const loadFactor = input.metadata.loadFactor || 'average_load';
    const vehicleType = input.metadata.vehicleType;

    // 获取载荷系数
    const modeConfig = this.transportModeFactors[transportMode];
    const loadMultiplier = modeConfig?.loadFactors[loadFactor] || 1.0;

    // 获取车辆类型系数（仅适用于公路运输）
    const vehicleMultiplier = transportMode === 'road_freight' && vehicleType 
      ? this.vehicleTypeFactors[vehicleType] || 1.0 
      : 1.0;

    // 调整排放因子
    let adjustedFactor = factor.factorValue * loadMultiplier * vehicleMultiplier;

    // 考虑空返程（仅限公路和铁路）
    if (['road_freight', 'rail_freight'].includes(transportMode) && input.metadata.includeEmptyReturn) {
      adjustedFactor *= 1.5; // 增加50%考虑空返程
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
        methodology: `${modeConfig?.description || 'Freight transport'} emissions with load and vehicle adjustments`,
        assumptions: {
          ...factor.assumptions,
          ...input.metadata,
          transportMode,
          loadFactor,
          loadMultiplier,
          vehicleType: vehicleType || 'default',
          vehicleMultiplier,
          originalEmissionFactor: factor.factorValue,
          adjustedEmissionFactor: adjustedFactor,
          emptyReturnNote: input.metadata.includeEmptyReturn ? 
            'Includes 50% adjustment for empty return journey' : 
            'Direct journey only',
        },
      },
      method: this.getCalculationMethod(),
      dataQuality: this.determineDataQuality(input, factor),
    };

    return result;
  }

  /**
   * 获取运输方式
   */
  private getTransportMode(activityType: string): string {
    // 从活动类型映射到运输方式
    const mapping = {
      'road_freight': 'road_freight',
      'rail_freight': 'rail_freight',
      'sea_freight': 'sea_freight', 
      'air_freight': 'air_freight',
      'pipeline_transport': 'pipeline',
      'courier_delivery': 'road_freight',
      'last_mile_delivery': 'road_freight',
    };

    return mapping[activityType] || 'road_freight';
  }

  /**
   * 计算基于货物体积的重量估算
   */
  calculateVolumetricWeight(
    volume: number, // m³
    volumetricFactor: number = 250 // kg/m³ (空运标准)
  ): number {
    return volume * volumetricFactor;
  }

  /**
   * 计算多式联运排放
   */
  async calculateMultimodal(
    segments: Array<{
      activityType: string;
      distance: number;
      cargoWeight: number;
      metadata?: any;
    }>,
    factors: EmissionFactor[]
  ): Promise<CalculationResult> {
    let totalEmissions = 0;
    const segmentResults: any[] = [];

    for (const segment of segments) {
      const segmentInput: CalculationInput = {
        activityType: segment.activityType,
        amount: (segment.cargoWeight / 1000) * segment.distance, // tonne-km
        unit: 'tonne-km',
        metadata: {
          ...segment.metadata,
          cargoWeight: segment.cargoWeight,
          distance: segment.distance,
        },
      };

      const factor = factors.find(f => f.activityType === segment.activityType);
      if (!factor) {
        throw new Error(`未找到活动类型 ${segment.activityType} 的排放因子`);
      }

      const normalizedInput = await this.validate(segmentInput);
      const segmentResult = await this.calculate(normalizedInput, factor);
      
      totalEmissions += segmentResult.tCO2e;
      segmentResults.push({
        segment: segment.activityType,
        emissions: segmentResult.tCO2e,
        details: segmentResult.breakdown,
      });
    }

    return {
      tCO2e: totalEmissions,
      breakdown: {
        originalAmount: segments.reduce((sum, s) => sum + s.cargoWeight, 0),
        originalUnit: 'kg',
        normalizedAmount: segments.reduce((sum, s) => sum + (s.cargoWeight / 1000) * s.distance, 0),
        normalizedUnit: 'tonne-km',
        emissionFactor: 0, // 不适用于多式联运
        emissionFactorUnit: 'mixed',
        gwp: 1,
        co2Amount: totalEmissions,
        methodology: 'Multimodal freight transport calculation',
        assumptions: {
          segments: segmentResults,
          totalSegments: segments.length,
        },
      },
      method: 'Multimodal ' + this.getCalculationMethod(),
      dataQuality: 'calculated',
    };
  }

  /**
   * 获取支持的运输方式
   */
  getSupportedTransportModes(): string[] {
    return Object.keys(this.transportModeFactors);
  }

  /**
   * 获取支持的车辆类型
   */
  getSupportedVehicleTypes(): string[] {
    return Object.keys(this.vehicleTypeFactors);
  }
}