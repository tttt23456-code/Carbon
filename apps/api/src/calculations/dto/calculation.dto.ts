import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsObject, Min, IsArray, IsEnum, IsDateString } from 'class-validator';

export class CalculationInputDto {
  @ApiProperty({ example: 'electricity', description: '活动类型' })
  @IsString()
  activityType: string;

  @ApiProperty({ example: 1000, description: '活动数据量' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'kWh', description: '单位' })
  @IsString()
  unit: string;

  @ApiProperty({ 
    example: { method: 'location_based', includeRFI: false }, 
    description: '元数据',
    required: false 
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class SingleCalculationDto extends CalculationInputDto {
  @ApiProperty({ 
    example: 'factor-id-123', 
    description: '指定使用的排放因子ID（可选）',
    required: false 
  })
  @IsOptional()
  @IsString()
  factorId?: string;
}

export class BatchCalculationDto {
  @ApiProperty({ 
    example: ['record-1', 'record-2'], 
    description: '要计算的活动记录ID列表（可选）',
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  activityRecordIds?: string[];

  @ApiProperty({ 
    description: '过滤条件',
    required: false 
  })
  @IsOptional()
  @IsObject()
  filters?: {
    scope?: string[];
    category?: string[];
    activityType?: string[];
    projectId?: string;
    facilityId?: string;
    periodStart?: Date;
    periodEnd?: Date;
  };
}

export class RecalculateDto {
  @ApiProperty({ 
    example: 'factor-id-456', 
    description: '指定使用的排放因子ID（可选）',
    required: false 
  })
  @IsOptional()
  @IsString()
  factorId?: string;
}

export class CalculationResultDto {
  @ApiProperty({ example: 0.581, description: '碳排放量（吨CO2当量）' })
  tCO2e: number;

  @ApiProperty({ description: '计算明细' })
  breakdown: {
    originalAmount: number;
    originalUnit: string;
    normalizedAmount: number;
    normalizedUnit: string;
    emissionFactor: number;
    emissionFactorUnit: string;
    gwp: number;
    co2Amount: number;
    methodology: string;
    assumptions: Record<string, any>;
  };

  @ApiProperty({ example: 'Electricity Consumption', description: '计算方法' })
  method: string;

  @ApiProperty({ example: 'measured', description: '数据质量' })
  dataQuality: 'measured' | 'calculated' | 'estimated';

  @ApiProperty({ example: 5.0, description: '不确定性（%）', required: false })
  uncertainty?: number;
}

export class BatchCalculationResultDto {
  @ApiProperty({ example: 10.5, description: '总排放量（吨CO2当量）' })
  totalEmissions: number;

  @ApiProperty({ example: 5, description: '计算记录数' })
  calculationCount: number;

  @ApiProperty({ description: '计算结果列表' })
  results: Array<{
    activityRecordId: string;
    result: CalculationResultDto;
    factorUsed: any;
  }>;

  @ApiProperty({ description: '汇总统计' })
  summary: {
    byScope: Record<string, number>;
    byCategory: Record<string, number>;
    byActivityType: Record<string, number>;
  };
}

export class SupportedActivityTypesDto {
  @ApiProperty({ description: '支持的活动类型列表' })
  activityTypes: string[];

  @ApiProperty({ description: '按Scope分组的活动类型' })
  groups: Record<string, string[]>;
}

export class CalculatorStatisticsDto {
  @ApiProperty({ example: 5, description: '计算器总数' })
  totalCalculators: number;

  @ApiProperty({ example: 15, description: '活动类型总数' })
  totalActivityTypes: number;

  @ApiProperty({ example: 5, description: 'Scope 1活动类型数' })
  scope1Types: number;

  @ApiProperty({ example: 2, description: 'Scope 2活动类型数' })
  scope2Types: number;

  @ApiProperty({ example: 8, description: 'Scope 3活动类型数' })
  scope3Types: number;

  @ApiProperty({ description: '所有活动类型列表' })
  activityTypes: string[];

  @ApiProperty({ description: '按Scope分组' })
  groups: Record<string, string[]>;
}