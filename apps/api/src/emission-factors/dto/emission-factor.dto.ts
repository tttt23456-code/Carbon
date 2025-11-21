import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmissionFactorDto {
  @ApiProperty({ description: '排放因子来源', example: 'IPCC' })
  @IsString()
  source: string;

  @ApiProperty({ description: '排放因子来源类型', example: 'STANDARD' })
  @IsString()
  sourceType: 'STANDARD' | 'CUSTOM' | 'ORGANIZATION';

  @ApiProperty({ description: '地区代码', example: 'CN' })
  @IsString()
  region: string;

  @ApiProperty({ description: '适用年份', example: 2023 })
  @IsNumber()
  year: number;

  @ApiProperty({ description: '活动类型', example: 'electricity' })
  @IsString()
  activityType: string;

  @ApiProperty({ description: '描述', example: '中国电网平均排放因子' })
  @IsString()
  description: string;

  @ApiProperty({ description: '活动数据单位', example: 'kWh' })
  @IsString()
  unit: string;

  @ApiProperty({ description: '排放因子数值', example: 0.5810 })
  @IsNumber()
  factorValue: number;

  @ApiProperty({ description: '排放因子单位', example: 'kg CO2e/kWh' })
  @IsString()
  factorUnit: string;

  @ApiProperty({ description: '温室气体类型', example: 'CO2' })
  @IsString()
  gas: string;

  @ApiProperty({ description: '全球变暖潜势', example: 1 })
  @IsNumber()
  gwp: number;

  @ApiPropertyOptional({ description: '有效期开始时间', example: '2023-01-01T00:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  validityStart?: string;

  @ApiPropertyOptional({ description: '有效期结束时间', example: '2023-12-31T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString()
  validityEnd?: string;

  @ApiPropertyOptional({ description: '参考来源', required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ description: '计算方法', required: false })
  @IsOptional()
  @IsString()
  methodology?: string;

  @ApiPropertyOptional({ description: '假设条件', required: false })
  @IsOptional()
  @IsObject()
  assumptions?: Record<string, any>;

  @ApiPropertyOptional({ description: '元数据', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: '是否激活', example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: '是否为默认因子', example: true })
  @IsBoolean()
  isDefault: boolean;

  @ApiProperty({ description: '优先级', example: 100 })
  @IsNumber()
  priority: number;
}

export class UpdateEmissionFactorDto {
  @ApiPropertyOptional({ description: '排放因子来源', example: 'IPCC' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: '排放因子来源类型', example: 'STANDARD' })
  @IsOptional()
  @IsString()
  sourceType?: string;

  @ApiPropertyOptional({ description: '地区代码', example: 'CN' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: '适用年份', example: 2023 })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiPropertyOptional({ description: '活动类型', example: 'electricity' })
  @IsOptional()
  @IsString()
  activityType?: string;

  @ApiPropertyOptional({ description: '描述', example: '中国电网平均排放因子' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '活动数据单位', example: 'kWh' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: '排放因子数值', example: 0.5810 })
  @IsOptional()
  @IsNumber()
  factorValue?: number;

  @ApiPropertyOptional({ description: '排放因子单位', example: 'kg CO2e/kWh' })
  @IsOptional()
  @IsString()
  factorUnit?: string;

  @ApiPropertyOptional({ description: '温室气体类型', example: 'CO2' })
  @IsOptional()
  @IsString()
  gas?: string;

  @ApiPropertyOptional({ description: '全球变暖潜势', example: 1 })
  @IsOptional()
  @IsNumber()
  gwp?: number;

  @ApiPropertyOptional({ description: '有效期开始时间', example: '2023-01-01T00:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  validityStart?: string;

  @ApiPropertyOptional({ description: '有效期结束时间', example: '2023-12-31T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString()
  validityEnd?: string;

  @ApiPropertyOptional({ description: '参考来源', required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ description: '计算方法', required: false })
  @IsOptional()
  @IsString()
  methodology?: string;

  @ApiPropertyOptional({ description: '假设条件', required: false })
  @IsOptional()
  @IsObject()
  assumptions?: Record<string, any>;

  @ApiPropertyOptional({ description: '元数据', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: '是否激活', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '是否为默认因子', example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: '优先级', example: 100 })
  @IsOptional()
  @IsNumber()
  priority?: number;
}

export class EmissionFactorQueryDto {
  @ApiPropertyOptional({ description: '页码', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', example: 20, required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ description: '来源筛选', example: 'IPCC', required: false })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: '排放因子来源类型筛选', example: 'STANDARD', required: false })
  @IsOptional()
  @IsString()
  sourceType?: string;

  @ApiPropertyOptional({ description: '地区筛选', example: 'CN', required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: '年份筛选', example: 2023, required: false })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiPropertyOptional({ description: '活动类型筛选', example: 'electricity', required: false })
  @IsOptional()
  @IsString()
  activityType?: string;

  @ApiPropertyOptional({ description: '温室气体类型筛选', example: 'CO2', required: false })
  @IsOptional()
  @IsString()
  gas?: string;

  @ApiPropertyOptional({ description: '是否只显示激活的因子', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;

  @ApiPropertyOptional({ description: '是否只显示默认因子', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  defaultOnly?: boolean;
}

export class EmissionFactorResponseDto {
  @ApiProperty({ description: 'ID' })
  id: string;

  @ApiProperty({ description: '组织ID' })
  organizationId: string | null;

  @ApiProperty({ description: '排放因子来源' })
  source: string;

  @ApiProperty({ description: '地区代码' })
  region: string;

  @ApiProperty({ description: '适用年份' })
  year: number;

  @ApiProperty({ description: '活动类型' })
  activityType: string;

  @ApiProperty({ description: '描述' })
  description: string;

  @ApiProperty({ description: '活动数据单位' })
  unit: string;

  @ApiProperty({ description: '排放因子数值' })
  factorValue: number;

  @ApiProperty({ description: '排放因子单位' })
  factorUnit: string;

  @ApiProperty({ description: '温室气体类型' })
  gas: string;

  @ApiProperty({ description: '全球变暖潜势' })
  gwp: number;

  @ApiPropertyOptional({ description: '有效期开始时间' })
  validityStart: string | null;

  @ApiPropertyOptional({ description: '有效期结束时间' })
  validityEnd: string | null;

  @ApiPropertyOptional({ description: '参考来源' })
  reference: string | null;

  @ApiPropertyOptional({ description: '计算方法' })
  methodology: string | null;

  @ApiProperty({ description: '假设条件' })
  assumptions: Record<string, any>;

  @ApiProperty({ description: '元数据' })
  metadata: Record<string, any>;

  @ApiProperty({ description: '是否激活' })
  isActive: boolean;

  @ApiProperty({ description: '是否为默认因子' })
  isDefault: boolean;

  @ApiProperty({ description: '优先级' })
  priority: number;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}