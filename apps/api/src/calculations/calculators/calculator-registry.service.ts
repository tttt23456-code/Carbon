import { Injectable, Logger } from '@nestjs/common';
import { Calculator } from '../interfaces/calculation.interface';
import { ElectricityCalculator } from './electricity.calculator';
import { FuelCombustionCalculator } from './fuel-combustion.calculator';
import { FlightCalculator } from './flight.calculator';
import { FreightCalculator } from './freight.calculator';
import { WasteCalculator } from './waste.calculator';

/**
 * 计算器注册表
 * 管理所有可用的计算器并提供统一的访问接口
 */
@Injectable()
export class CalculatorRegistry {
  private readonly logger = new Logger(CalculatorRegistry.name);
  private calculators: Map<string, Calculator> = new Map();

  constructor(
    private electricityCalculator: ElectricityCalculator,
    private fuelCombustionCalculator: FuelCombustionCalculator,
    private flightCalculator: FlightCalculator,
    private freightCalculator: FreightCalculator,
    private wasteCalculator: WasteCalculator,
  ) {
    this.registerCalculators();
  }

  /**
   * 注册所有计算器
   */
  private registerCalculators() {
    this.registerCalculator(this.electricityCalculator);
    this.registerCalculator(this.fuelCombustionCalculator);
    this.registerCalculator(this.flightCalculator);
    this.registerCalculator(this.freightCalculator);
    this.registerCalculator(this.wasteCalculator);

    this.logger.log(`已注册 ${this.calculators.size} 个计算器`);
  }

  /**
   * 注册单个计算器
   */
  registerCalculator(calculator: Calculator) {
    const supportedTypes = calculator.getSupportedActivityTypes();
    
    for (const activityType of supportedTypes) {
      if (this.calculators.has(activityType)) {
        this.logger.warn(`活动类型 ${activityType} 的计算器被覆盖`);
      }
      this.calculators.set(activityType, calculator);
    }

    this.logger.debug(`注册计算器，支持活动类型: ${supportedTypes.join(', ')}`);
  }

  /**
   * 获取指定活动类型的计算器
   */
  getCalculator(activityType: string): Calculator | null {
    return this.calculators.get(activityType) || null;
  }

  /**
   * 检查是否支持指定活动类型
   */
  isSupported(activityType: string): boolean {
    return this.calculators.has(activityType);
  }

  /**
   * 获取所有支持的活动类型
   */
  getSupportedActivityTypes(): string[] {
    return Array.from(this.calculators.keys());
  }

  /**
   * 获取活动类型分组信息
   */
  getActivityTypeGroups(): Record<string, string[]> {
    const groups: Record<string, string[]> = {
      'Scope 1 - 直接排放': [],
      'Scope 2 - 电力间接排放': [],
      'Scope 3 - 其他间接排放': [],
    };

    for (const activityType of this.getSupportedActivityTypes()) {
      if (this.isScope1ActivityType(activityType)) {
        groups['Scope 1 - 直接排放'].push(activityType);
      } else if (this.isScope2ActivityType(activityType)) {
        groups['Scope 2 - 电力间接排放'].push(activityType);
      } else {
        groups['Scope 3 - 其他间接排放'].push(activityType);
      }
    }

    return groups;
  }

  /**
   * 判断是否为Scope 1活动类型
   */
  private isScope1ActivityType(activityType: string): boolean {
    const scope1Types = [
      'natural_gas', 'diesel', 'gasoline', 'lpg', 'coal', 'biomass', 'fuel_oil', 'heating_oil'
    ];
    return scope1Types.includes(activityType);
  }

  /**
   * 判断是否为Scope 2活动类型
   */
  private isScope2ActivityType(activityType: string): boolean {
    const scope2Types = ['electricity', 'purchased_electricity'];
    return scope2Types.includes(activityType);
  }

  /**
   * 获取计算器统计信息
   */
  getStatistics() {
    const activityTypes = this.getSupportedActivityTypes();
    const groups = this.getActivityTypeGroups();
    
    return {
      totalCalculators: this.calculators.size,
      totalActivityTypes: activityTypes.length,
      scope1Types: groups['Scope 1 - 直接排放'].length,
      scope2Types: groups['Scope 2 - 电力间接排放'].length,
      scope3Types: groups['Scope 3 - 其他间接排放'].length,
      activityTypes,
      groups,
    };
  }

  /**
   * 验证计算器配置
   */
  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // 检查必需的活动类型是否都有计算器
    const requiredTypes = ['electricity', 'natural_gas', 'diesel', 'gasoline'];
    for (const type of requiredTypes) {
      if (!this.isSupported(type)) {
        errors.push(`缺少必需活动类型的计算器: ${type}`);
      }
    }

    // 检查是否有重复的活动类型
    const typeCount = new Map<string, number>();
    for (const [activityType] of this.calculators) {
      typeCount.set(activityType, (typeCount.get(activityType) || 0) + 1);
    }

    for (const [type, count] of typeCount) {
      if (count > 1) {
        errors.push(`活动类型 ${type} 有多个计算器注册`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}