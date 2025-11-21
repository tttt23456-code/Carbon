import { IsString, IsOptional, IsObject, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogQueryDto {
  @ApiPropertyOptional({ description: '页码', example: 1, required: false })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', example: 20, required: false })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: '操作类型筛选', example: 'CREATE', required: false })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ description: '实体类型筛选', example: 'ActivityRecord', required: false })
  @IsOptional()
  @IsString()
  entity?: string;

  @ApiPropertyOptional({ description: '操作人员ID筛选', required: false })
  @IsOptional()
  @IsString()
  actorId?: string;

  @ApiPropertyOptional({ description: '开始时间', example: '2023-01-01T00:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束时间', example: '2023-12-31T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CreateAuditLogDto {
  @ApiProperty({ description: '操作类型', example: 'CREATE' })
  @IsString()
  action: string;

  @ApiProperty({ description: '实体类型', example: 'ActivityRecord' })
  @IsString()
  entity: string;

  @ApiPropertyOptional({ description: '实体ID', required: false })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ description: '操作前数据', required: false })
  @IsOptional()
  @IsObject()
  before?: Record<string, any>;

  @ApiPropertyOptional({ description: '操作后数据', required: false })
  @IsOptional()
  @IsObject()
  after?: Record<string, any>;

  @ApiPropertyOptional({ description: '变更差异', required: false })
  @IsOptional()
  @IsObject()
  diff?: Record<string, any>;

  @ApiPropertyOptional({ description: 'IP地址', required: false })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: '用户代理', required: false })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: '元数据', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class AuditLogResponseDto {
  @ApiProperty({ description: 'ID' })
  id: string;

  @ApiProperty({ description: '组织ID' })
  organizationId: string;

  @ApiPropertyOptional({ description: '操作人员ID' })
  actorId: string | null;

  @ApiProperty({ description: '操作类型' })
  action: string;

  @ApiProperty({ description: '实体类型' })
  entity: string;

  @ApiPropertyOptional({ description: '实体ID' })
  entityId: string | null;

  @ApiPropertyOptional({ description: '操作前数据' })
  before: Record<string, any> | null;

  @ApiPropertyOptional({ description: '操作后数据' })
  after: Record<string, any> | null;

  @ApiPropertyOptional({ description: '变更差异' })
  diff: Record<string, any> | null;

  @ApiPropertyOptional({ description: 'IP地址' })
  ipAddress: string | null;

  @ApiPropertyOptional({ description: '用户代理' })
  userAgent: string | null;

  @ApiProperty({ description: '元数据' })
  metadata: Record<string, any>;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}