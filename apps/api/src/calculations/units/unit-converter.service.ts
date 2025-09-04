import { Injectable } from '@nestjs/common';
import { UnitConverter } from '../interfaces/calculation.interface';

/**
 * 能源单位转换器
 */
@Injectable()
export class EnergyUnitConverter implements UnitConverter {
  private readonly conversions = {
    // 基础单位: kWh
    'kWh': 1,
    'MWh': 1000,
    'GWh': 1000000,
    'Wh': 0.001,
    'J': 0.000000278, // 1 J = 2.78e-7 kWh
    'kJ': 0.000278,
    'MJ': 0.278,
    'GJ': 277.78,
    'TJ': 277777.78,
    'BTU': 0.000293, // 1 BTU = 2.93e-4 kWh
    'MMBTU': 293.07, // 1 MMBTU = 293.07 kWh
    'therm': 29.307, // 1 therm = 29.307 kWh
  };

  getSupportedUnits(): string[] {
    return Object.keys(this.conversions);
  }

  convert(value: number, fromUnit: string, toUnit: string): number {
    if (!this.isSupported(fromUnit) || !this.isSupported(toUnit)) {
      throw new Error(`不支持的单位转换: ${fromUnit} -> ${toUnit}`);
    }

    // 先转换为基础单位 kWh，再转换为目标单位
    const baseValue = value * this.conversions[fromUnit];
    return baseValue / this.conversions[toUnit];
  }

  getBaseUnit(): string {
    return 'kWh';
  }

  isSupported(unit: string): boolean {
    return unit in this.conversions;
  }
}

/**
 * 体积单位转换器
 */
@Injectable()
export class VolumeUnitConverter implements UnitConverter {
  private readonly conversions = {
    // 基础单位: L (升)
    'L': 1,
    'mL': 0.001,
    'kL': 1000,
    'm3': 1000, // 立方米
    'cm3': 0.001,
    'dm3': 1,
    'gal': 3.78541, // 美制加仑
    'gal_uk': 4.54609, // 英制加仑
    'ft3': 28.3168, // 立方英尺
    'in3': 0.0163871, // 立方英寸
    'barrel': 158.987, // 石油桶
  };

  getSupportedUnits(): string[] {
    return Object.keys(this.conversions);
  }

  convert(value: number, fromUnit: string, toUnit: string): number {
    if (!this.isSupported(fromUnit) || !this.isSupported(toUnit)) {
      throw new Error(`不支持的单位转换: ${fromUnit} -> ${toUnit}`);
    }

    const baseValue = value * this.conversions[fromUnit];
    return baseValue / this.conversions[toUnit];
  }

  getBaseUnit(): string {
    return 'L';
  }

  isSupported(unit: string): boolean {
    return unit in this.conversions;
  }
}

/**
 * 质量单位转换器
 */
@Injectable()
export class MassUnitConverter implements UnitConverter {
  private readonly conversions = {
    // 基础单位: kg
    'kg': 1,
    'g': 0.001,
    'mg': 0.000001,
    't': 1000, // 公吨
    'tonne': 1000,
    'lb': 0.453592, // 磅
    'oz': 0.0283495, // 盎司
    'stone': 6.35029, // 英石
    'ton_us': 907.185, // 美制吨
    'ton_uk': 1016.05, // 英制吨
  };

  getSupportedUnits(): string[] {
    return Object.keys(this.conversions);
  }

  convert(value: number, fromUnit: string, toUnit: string): number {
    if (!this.isSupported(fromUnit) || !this.isSupported(toUnit)) {
      throw new Error(`不支持的单位转换: ${fromUnit} -> ${toUnit}`);
    }

    const baseValue = value * this.conversions[fromUnit];
    return baseValue / this.conversions[toUnit];
  }

  getBaseUnit(): string {
    return 'kg';
  }

  isSupported(unit: string): boolean {
    return unit in this.conversions;
  }
}

/**
 * 距离单位转换器
 */
@Injectable()
export class DistanceUnitConverter implements UnitConverter {
  private readonly conversions = {
    // 基础单位: km
    'km': 1,
    'm': 0.001,
    'cm': 0.00001,
    'mm': 0.000001,
    'mi': 1.60934, // 英里
    'ft': 0.0003048, // 英尺
    'in': 0.0000254, // 英寸
    'yd': 0.0009144, // 码
    'nm': 1.852, // 海里
  };

  getSupportedUnits(): string[] {
    return Object.keys(this.conversions);
  }

  convert(value: number, fromUnit: string, toUnit: string): number {
    if (!this.isSupported(fromUnit) || !this.isSupported(toUnit)) {
      throw new Error(`不支持的单位转换: ${fromUnit} -> ${toUnit}`);
    }

    const baseValue = value * this.conversions[fromUnit];
    return baseValue / this.conversions[toUnit];
  }

  getBaseUnit(): string {
    return 'km';
  }

  isSupported(unit: string): boolean {
    return unit in this.conversions;
  }
}

/**
 * 复合单位转换器
 */
@Injectable()
export class CompositeUnitConverter implements UnitConverter {
  private readonly conversions = {
    // 货运相关单位（基础单位: tonne-km）
    'tonne-km': 1,
    't-km': 1,
    'kg-km': 0.001,
    'lb-mi': 0.000285, // 1 lb-mi ≈ 2.85e-4 t-km
    
    // 客运相关单位（基础单位: passenger-km）
    'passenger-km': 1,
    'pax-km': 1,
    'passenger-mi': 1.60934,
    'pax-mi': 1.60934,
    
    // 面积单位（基础单位: m2）
    'm2': 1,
    'km2': 1000000,
    'ha': 10000, // 公顷
    'acre': 4046.86, // 英亩
    'ft2': 0.092903, // 平方英尺
  };

  getSupportedUnits(): string[] {
    return Object.keys(this.conversions);
  }

  convert(value: number, fromUnit: string, toUnit: string): number {
    if (!this.isSupported(fromUnit) || !this.isSupported(toUnit)) {
      throw new Error(`不支持的单位转换: ${fromUnit} -> ${toUnit}`);
    }

    // 检查单位类型是否匹配
    if (!this.areCompatibleUnits(fromUnit, toUnit)) {
      throw new Error(`单位类型不匹配: ${fromUnit} -> ${toUnit}`);
    }

    const baseValue = value * this.conversions[fromUnit];
    return baseValue / this.conversions[toUnit];
  }

  getBaseUnit(): string {
    return 'm2'; // 默认基础单位
  }

  isSupported(unit: string): boolean {
    return unit in this.conversions;
  }

  private areCompatibleUnits(fromUnit: string, toUnit: string): boolean {
    const freightUnits = ['tonne-km', 't-km', 'kg-km', 'lb-mi'];
    const passengerUnits = ['passenger-km', 'pax-km', 'passenger-mi', 'pax-mi'];
    const areaUnits = ['m2', 'km2', 'ha', 'acre', 'ft2'];

    return (
      (freightUnits.includes(fromUnit) && freightUnits.includes(toUnit)) ||
      (passengerUnits.includes(fromUnit) && passengerUnits.includes(toUnit)) ||
      (areaUnits.includes(fromUnit) && areaUnits.includes(toUnit))
    );
  }
}

/**
 * 单位转换注册表
 */
@Injectable()
export class UnitConverterRegistry {
  private converters: Map<string, UnitConverter> = new Map();

  constructor(
    private energyConverter: EnergyUnitConverter,
    private volumeConverter: VolumeUnitConverter,
    private massConverter: MassUnitConverter,
    private distanceConverter: DistanceUnitConverter,
    private compositeConverter: CompositeUnitConverter,
  ) {
    this.registerConverter('energy', energyConverter);
    this.registerConverter('volume', volumeConverter);
    this.registerConverter('mass', massConverter);
    this.registerConverter('distance', distanceConverter);
    this.registerConverter('composite', compositeConverter);
  }

  registerConverter(type: string, converter: UnitConverter) {
    this.converters.set(type, converter);
  }

  getConverter(unit: string): UnitConverter | null {
    for (const [type, converter] of this.converters) {
      if (converter.isSupported(unit)) {
        return converter;
      }
    }
    return null;
  }

  convert(value: number, fromUnit: string, toUnit: string): number {
    const fromConverter = this.getConverter(fromUnit);
    const toConverter = this.getConverter(toUnit);

    if (!fromConverter || !toConverter) {
      throw new Error(`不支持的单位: ${fromUnit} 或 ${toUnit}`);
    }

    if (fromConverter !== toConverter) {
      throw new Error(`单位类型不匹配: ${fromUnit} 和 ${toUnit} 属于不同的单位类型`);
    }

    return fromConverter.convert(value, fromUnit, toUnit);
  }

  isSupported(unit: string): boolean {
    return this.getConverter(unit) !== null;
  }

  getAllSupportedUnits(): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    for (const [type, converter] of this.converters) {
      result[type] = converter.getSupportedUnits();
    }
    return result;
  }
}