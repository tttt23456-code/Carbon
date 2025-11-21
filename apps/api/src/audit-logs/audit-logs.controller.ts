import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import {
  CreateAuditLogDto,
  AuditLogQueryDto,
  AuditLogResponseDto,
} from './dto/audit-log.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/auth.decorator';
import { CurrentUser, CurrentOrganization } from '../common/decorators/user.decorator';

@ApiTags('audit-logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ 
    summary: '创建审计日志',
    description: '创建新的审计日志记录（通常由系统自动创建）'
  })
  @ApiBody({ type: CreateAuditLogDto })
  @ApiResponse({ 
    status: 201, 
    description: '创建成功',
    type: AuditLogResponseDto 
  })
  async create(
    @Body() createAuditLogDto: CreateAuditLogDto,
    @CurrentOrganization() organization: any,
    @CurrentUser() user: any,
  ) {
    return this.auditLogsService.create(
      createAuditLogDto,
      organization.id,
      user.id,
    );
  }

  @Get()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ 
    summary: '获取审计日志列表',
    description: '分页获取审计日志列表，支持多种筛选条件'
  })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    type: AuditLogResponseDto,
    isArray: true
  })
  async findAll(
    @Query() query: AuditLogQueryDto,
    @CurrentOrganization() organization: any,
  ) {
    return this.auditLogsService.findAll(organization.id, query);
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ 
    summary: '获取审计日志详情',
    description: '根据ID获取审计日志详细信息'
  })
  @ApiParam({ name: 'id', description: '审计日志ID' })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    type: AuditLogResponseDto 
  })
  async findOne(
    @Param('id') id: string,
    @CurrentOrganization() organization: any,
  ) {
    return this.auditLogsService.findOne(id, organization.id);
  }

  @Get('statistics')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ 
    summary: '获取审计统计信息',
    description: '获取审计日志统计信息'
  })
  @ApiQuery({ name: 'days', description: '统计天数', required: false, example: 30 })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功'
  })
  async getStatistics(
    @Query('days') days: number,
    @CurrentOrganization() organization: any,
  ) {
    return this.auditLogsService.getStatistics(organization.id, days);
  }
}