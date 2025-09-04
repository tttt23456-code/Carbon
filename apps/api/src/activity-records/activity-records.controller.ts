import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { ActivityRecordsService } from './activity-records.service';
import {
  CreateActivityRecordDto,
  UpdateActivityRecordDto,
  VerifyActivityRecordDto,
  ActivityRecordQueryDto,
  ActivityRecordResponseDto,
} from './dto/activity-record.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/auth.decorator';
import { CurrentUser, CurrentOrganization } from '../common/decorators/user.decorator';

@ApiTags('activity-records')
@Controller('activity-records')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ActivityRecordsController {
  constructor(private readonly activityRecordsService: ActivityRecordsService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER', 'MEMBER')
  @ApiOperation({ 
    summary: '创建活动记录',
    description: '创建新的活动数据记录'
  })
  @ApiBody({ type: CreateActivityRecordDto })
  @ApiResponse({ 
    status: 201, 
    description: '创建成功',
    type: ActivityRecordResponseDto 
  })
  @ApiResponse({ status: 400, description: '输入参数错误' })
  @ApiResponse({ status: 404, description: '关联的项目或设施不存在' })
  async create(
    @Body() createActivityRecordDto: CreateActivityRecordDto,
    @CurrentOrganization() organization: any,
    @CurrentUser() user: any,
  ): Promise<ActivityRecordResponseDto> {
    return this.activityRecordsService.create(
      createActivityRecordDto,
      organization.id,
      user.id,
    );
  }

  @Get()
  @ApiOperation({ 
    summary: '获取活动记录列表',
    description: '获取组织的活动记录列表，支持分页和筛选'
  })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({ name: 'scope', required: false, description: '排放范围筛选' })
  @ApiQuery({ name: 'activityType', required: false, description: '活动类型筛选' })
  @ApiQuery({ name: 'projectId', required: false, description: '项目ID筛选' })
  @ApiQuery({ name: 'facilityId', required: false, description: '设施ID筛选' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期筛选' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期筛选' })
  @ApiQuery({ name: 'verifiedOnly', required: false, description: '仅显示已验证记录' })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/ActivityRecordResponseDto' } },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
      },
    }
  })
  async findAll(
    @Query() query: ActivityRecordQueryDto,
    @CurrentOrganization() organization: any,
  ) {
    return this.activityRecordsService.findAll(organization.id, query);
  }

  @Get('statistics')
  @ApiOperation({ 
    summary: '获取活动记录统计',
    description: '获取活动记录的统计信息'
  })
  @ApiQuery({ name: 'startDate', required: false, description: '统计开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '统计结束日期' })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        verified: { type: 'number' },
        verificationRate: { type: 'string' },
        byScope: { type: 'object' },
        byCategory: { type: 'object' },
        byActivityType: { type: 'object' },
      },
    }
  })
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentOrganization() organization?: any,
  ) {
    return this.activityRecordsService.getStatistics(
      organization.id,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  @ApiOperation({ 
    summary: '获取活动记录详情',
    description: '获取指定活动记录的详细信息'
  })
  @ApiParam({ name: 'id', description: '活动记录ID' })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    type: ActivityRecordResponseDto 
  })
  @ApiResponse({ status: 404, description: '活动记录不存在' })
  async findOne(
    @Param('id') id: string,
    @CurrentOrganization() organization: any,
  ): Promise<ActivityRecordResponseDto> {
    return this.activityRecordsService.findOne(id, organization.id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER', 'MEMBER')
  @ApiOperation({ 
    summary: '更新活动记录',
    description: '更新活动记录信息，如果记录已验证需要更高权限'
  })
  @ApiParam({ name: 'id', description: '活动记录ID' })
  @ApiBody({ type: UpdateActivityRecordDto })
  @ApiResponse({ 
    status: 200, 
    description: '更新成功',
    type: ActivityRecordResponseDto 
  })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '活动记录不存在' })
  async update(
    @Param('id') id: string,
    @Body() updateActivityRecordDto: UpdateActivityRecordDto,
    @CurrentOrganization() organization: any,
    @CurrentUser() user: any,
  ): Promise<ActivityRecordResponseDto> {
    return this.activityRecordsService.update(
      id,
      updateActivityRecordDto,
      organization.id,
      user.id,
    );
  }

  @Patch(':id/verify')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ 
    summary: '验证活动记录',
    description: '验证或取消验证活动记录（需要管理员或经理权限）'
  })
  @ApiParam({ name: 'id', description: '活动记录ID' })
  @ApiBody({ type: VerifyActivityRecordDto })
  @ApiResponse({ 
    status: 200, 
    description: '验证成功',
    type: ActivityRecordResponseDto 
  })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '活动记录不存在' })
  async verify(
    @Param('id') id: string,
    @Body() verifyActivityRecordDto: VerifyActivityRecordDto,
    @CurrentOrganization() organization: any,
    @CurrentUser() user: any,
  ): Promise<ActivityRecordResponseDto> {
    return this.activityRecordsService.verify(
      id,
      verifyActivityRecordDto,
      organization.id,
      user.id,
    );
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ 
    summary: '删除活动记录',
    description: '软删除活动记录（需要管理员或经理权限）'
  })
  @ApiParam({ name: 'id', description: '活动记录ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '活动记录不存在' })
  async remove(
    @Param('id') id: string,
    @CurrentOrganization() organization: any,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    return this.activityRecordsService.remove(id, organization.id, user.id);
  }
}