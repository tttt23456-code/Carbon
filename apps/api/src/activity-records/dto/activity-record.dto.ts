import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNumber, 
  IsEnum, 
  IsOptional, 
  IsObject, 
  IsDateString, 
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { JsonValue } from '@prisma/client/runtime/library';

export class CreateActivityRecordDto {
  @ApiProperty({ example: 'electricity', description: '活动类型' })
  @IsString()
  activityType: string;

  @ApiProperty({ example: 'SCOPE_2', description: '排放范围' })
  @IsEnum(['SCOPE_1', 'SCOPE_2', 'SCOPE_3'])
  scope: string;

  @ApiProperty({ example: 'PURCHASED_ELECTRICITY', description: '活动类别' })
  @IsEnum([
    'STATIONARY_COMBUSTION', 'MOBILE_COMBUSTION', 'INDUSTRIAL_PROCESSES', 'FUGITIVE_EMISSIONS',
    'PURCHASED_ELECTRICITY', 'PURCHASED_STEAM', 'PURCHASED_HEATING', 'PURCHASED_COOLING',
    'PURCHASED_GOODS', 'CAPITAL_GOODS', 'FUEL_ENERGY_ACTIVITIES', 'UPSTREAM_TRANSPORT',
    'WASTE_GENERATED', 'BUSINESS_TRAVEL', 'EMPLOYEE_COMMUTING', 'UPSTREAM_LEASED_ASSETS',
    'DOWNSTREAM_TRANSPORT', 'PROCESSING_SOLD_PRODUCTS', 'USE_SOLD_PRODUCTS',
    'END_OF_LIFE_TREATMENT', 'DOWNSTREAM_LEASED_ASSETS', 'FRANCHISES', 'INVESTMENTS'
  ])
  category: string;

  @ApiProperty({ example: 1000, description: '活动数据量' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'kWh', description: '单位' })
  @IsString()
  unit: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: '期间开始时间' })
  @IsDateString()
  periodStart: string;

  @ApiProperty({ example: '2024-01-31T23:59:59Z', description: '期间结束时间' })
  @IsDateString()
  periodEnd: string;

  @ApiProperty({ example: 'project-123', description: '关联项目ID', required: false })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({ example: 'facility-123', description: '关联设施ID', required: false })
  @IsOptional()
  @IsString()
  facilityId?: string;

  @ApiProperty({ example: '总部大楼1月份电力消耗', description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'INV-2024-001', description: '参考编号', required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ 
    example: 'measured', 
    description: '数据质量',
    required: false 
  })
  @IsOptional()
  @IsEnum(['measured', 'estimated', 'calculated'])
  dataQuality?: string;

  @ApiProperty({ example: 5.0, description: '不确定性百分比', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  uncertainty?: number;

  @ApiProperty({ 
    example: { supplier: '国家电网' }, 
    description: '元数据',
    required: false 
  })
  @IsOptional()
  @IsObject()
  metadata?: JsonValue;
}

export class UpdateActivityRecordDto {
  @ApiProperty({ example: 1000, description: '活动数据量', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiProperty({ example: 'kWh', description: '单位', required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: '期间开始时间', required: false })
  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @ApiProperty({ example: '2024-01-31T23:59:59Z', description: '期间结束时间', required: false })
  @IsOptional()
  @IsDateString()
  periodEnd?: string;

  @ApiProperty({ example: 'project-123', description: '关联项目ID', required: false })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({ example: 'facility-123', description: '关联设施ID', required: false })
  @IsOptional()
  @IsString()
  facilityId?: string;

  @ApiProperty({ example: '总部大楼1月份电力消耗', description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'INV-2024-001', description: '参考编号', required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ 
    example: 'measured', 
    description: '数据质量',
    required: false 
  })
  @IsOptional()
  @IsEnum(['measured', 'estimated', 'calculated'])
  dataQuality?: string;

  @ApiProperty({ example: 5.0, description: '不确定性百分比', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  uncertainty?: number;

  @ApiProperty({ 
    example: { supplier: '国家电网' }, 
    description: '元数据',
    required: false 
  })
  @IsOptional()
  @IsObject()
  metadata?: JsonValue;
}

export class VerifyActivityRecordDto {
  @ApiProperty({ example: true, description: '是否验证通过' })
  @IsBoolean()
  isVerified: boolean;

  @ApiProperty({ example: '数据已核实', description: '验证备注', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ActivityRecordQueryDto {
  @ApiProperty({ example: 1, description: '页码', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ example: 20, description: '每页数量', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({ example: 'SCOPE_2', description: '排放范围筛选', required: false })
  @IsOptional()
  @IsEnum(['SCOPE_1', 'SCOPE_2', 'SCOPE_3'])
  scope?: string;

  @ApiProperty({ example: 'electricity', description: '活动类型筛选', required: false })
  @IsOptional()
  @IsString()
  activityType?: string;

  @ApiProperty({ example: 'project-123', description: '项目ID筛选', required: false })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({ example: 'facility-123', description: '设施ID筛选', required: false })
  @IsOptional()
  @IsString()
  facilityId?: string;

  @ApiProperty({ example: '2024-01-01', description: '开始日期筛选', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2024-12-31', description: '结束日期筛选', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: true, description: '仅显示已验证记录', required: false })
  @IsOptional()
  @IsBoolean()
  verifiedOnly?: boolean;
}

export class ActivityRecordResponseDto {
  @ApiProperty({ example: 'record-123', description: '记录ID' })
  id: string;

  @ApiProperty({ example: 'electricity', description: '活动类型' })
  activityType: string;

  @ApiProperty({ example: 'SCOPE_2', description: '排放范围' })
  scope: string;

  @ApiProperty({ example: 'PURCHASED_ELECTRICITY', description: '活动类别' })
  category: string;

  @ApiProperty({ example: 1000, description: '活动数据量' })
  amount: number;

  @ApiProperty({ example: 'kWh', description: '单位' })
  unit: string;

  @ApiProperty({ description: '期间开始时间' })
  periodStart: Date;

  @ApiProperty({ description: '期间结束时间' })
  periodEnd: Date;

  @ApiProperty({ example: '总部大楼1月份电力消耗', description: '描述' })
  description?: string;

  @ApiProperty({ example: 'INV-2024-001', description: '参考编号' })
  reference?: string;

  @ApiProperty({ example: 'measured', description: '数据质量' })
  dataQuality: string;

  @ApiProperty({ example: 5.0, description: '不确定性百分比' })
  uncertainty?: number;

  @ApiProperty({ example: true, description: '是否已验证' })
  isVerified: boolean;

  @ApiProperty({ description: '验证人员' })
  verifiedBy?: string;

  @ApiProperty({ description: '验证时间' })
  verifiedAt?: Date;

  @ApiProperty({ description: '关联项目' })
  project?: {
    id: string;
    name: string;
  };

  @ApiProperty({ description: '关联设施' })
  facility?: {
    id: string;
    name: string;
    type: string;
  };

  @ApiProperty({ description: '计算结果' })
  calculationResults?: {
    id: string;
    tCO2e: number;
    method: string;
    calculatedAt: Date;
  }[];

  @ApiProperty({ description: '元数据' })
  metadata: JsonValue;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}