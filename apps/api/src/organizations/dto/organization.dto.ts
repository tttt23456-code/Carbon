import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsEmail, IsEnum, MinLength, MaxLength } from 'class-validator';
import { JsonValue } from '@prisma/client/runtime/library';

export class CreateOrganizationDto {
  @ApiProperty({ example: '中汽碳（北京）数字技术中心有限公司', description: '组织名称' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'caict-carbon', description: '组织标识符（URL友好）' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  slug: string;

  @ApiProperty({ 
    example: '专注于汽车产业碳中和数字化转型的创新企业', 
    description: '组织描述',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 'CN', description: '国家代码', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'Beijing', description: '地区', required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ example: 'Asia/Shanghai', description: '时区', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ 
    example: { defaultCurrency: 'CNY' }, 
    description: '组织设置',
    required: false 
  })
  @IsOptional()
  @IsObject()
  settings?: JsonValue;
}

export class UpdateOrganizationDto {
  @ApiProperty({ example: '中汽碳（北京）数字技术中心有限公司', description: '组织名称', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ 
    example: '专注于汽车产业碳中和数字化转型的创新企业', 
    description: '组织描述',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 'CN', description: '国家代码', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'Beijing', description: '地区', required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ example: 'Asia/Shanghai', description: '时区', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ 
    example: { defaultCurrency: 'CNY' }, 
    description: '组织设置',
    required: false 
  })
  @IsOptional()
  @IsObject()
  settings?: JsonValue;
}

export class InviteMemberDto {
  @ApiProperty({ example: 'member@caict-carbon.com', description: '邀请用户的邮箱' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MEMBER', description: '用户角色' })
  @IsEnum(['ADMIN', 'MANAGER', 'MEMBER', 'READONLY'])
  role: string;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ example: 'MANAGER', description: '新角色' })
  @IsEnum(['ADMIN', 'MANAGER', 'MEMBER', 'READONLY'])
  role: string;
}

export class OrganizationResponseDto {
  @ApiProperty({ example: 'org-123', description: '组织ID' })
  id: string;

  @ApiProperty({ example: '中汽碳（北京）数字技术中心有限公司', description: '组织名称' })
  name: string;

  @ApiProperty({ example: 'caict-carbon', description: '组织标识符' })
  slug: string;

  @ApiProperty({ example: '专注于汽车产业碳中和数字化转型的创新企业', description: '组织描述' })
  description?: string;

  @ApiProperty({ example: 'CN', description: '国家代码' })
  country?: string;

  @ApiProperty({ example: 'Beijing', description: '地区' })
  region?: string;

  @ApiProperty({ example: 'Asia/Shanghai', description: '时区' })
  timezone: string;

  @ApiProperty({ description: '组织设置' })
  settings: JsonValue;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

export class MembershipResponseDto {
  @ApiProperty({ example: 'membership-123', description: '成员关系ID' })
  id: string;

  @ApiProperty({ example: 'MEMBER', description: '成员角色' })
  role: string;

  @ApiProperty({ description: '加入时间' })
  joinedAt: Date;

  @ApiProperty({ description: '用户信息' })
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}