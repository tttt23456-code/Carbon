/**
 * 计算输入接口
 */
export interface CalculationInput {
  activityType: string;
  amount: number;
  unit: string;
  metadata?: Record<string, any>;
}

/**
 * 标准化输入接口
 */
export interface NormalizedInput {
  activityType: string;
  amount: number;
  unit: string;
  normalizedAmount: number;
  normalizedUnit: string;
  metadata: Record<string, any>;
}

/**
 * 排放因子接口
 */
export interface EmissionFactor {
  id: string;
  activityType: string;
  region: string;
  year: number;
  factorValue: number;
  factorUnit: string;
  gas: string;
  gwp: number;
  reference?: string;
  methodology?: string;
  assumptions?: Record<string, any>;
}

/**
 * 计算结果明细
 */
export interface CalculationBreakdown {
  originalAmount: number;
  originalUnit: string;
  normalizedAmount: number;
  normalizedUnit: string;
  emissionFactor: number;
  emissionFactorUnit: string;
  gwp: number;
  co2Amount: number;
  ch4Amount?: number;
  n2oAmount?: number;
  otherGasAmounts?: Record<string, number>;
  methodology: string;
  assumptions: Record<string, any>;
  uncertaintyFactor?: number;
}

/**
 * 计算结果接口
 */
export interface CalculationResult {
  tCO2e: number;
  breakdown: CalculationBreakdown;
  uncertainty?: number;
  dataQuality: 'measured' | 'calculated' | 'estimated';
  method: string;
}

/**
 * 计算器基础接口
 */
export interface Calculator {
  /**
   * 计算器支持的活动类型
   */
  getSupportedActivityTypes(): string[];

  /**
   * 验证并标准化输入
   */
  validate(input: CalculationInput): Promise<NormalizedInput>;

  /**
   * 执行碳排放计算
   */
  calculate(input: NormalizedInput, factor: EmissionFactor): Promise<CalculationResult>;
}

/**
 * 单位转换接口
 */
export interface UnitConverter {
  /**
   * 获取支持的单位类型
   */
  getSupportedUnits(): string[];

  /**
   * 转换单位
   */
  convert(value: number, fromUnit: string, toUnit: string): number;

  /**
   * 获取基础单位
   */
  getBaseUnit(): string;

  /**
   * 检查单位是否支持
   */
  isSupported(unit: string): boolean;
}