import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { DataQualityService } from './data-quality.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/auth.decorator';
import { CurrentOrganization } from '../common/decorators/user.decorator';

@ApiTags('data-quality')
@Controller('data-quality')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DataQualityController {
  constructor(private readonly dataQualityService: DataQualityService) {}

  @Post('assess/:recordId')
  @Roles('ADMIN', 'MANAGER', 'MEMBER')
  @ApiOperation({ 
    summary: '评估活动记录数据质量',
    description: '对指定活动记录进行数据质量评估'
  })
  @ApiParam({ name: 'recordId', description: '活动记录ID' })
  @ApiResponse({ 
    status: 200, 
    description: '评估成功'
  })
  async assessRecordQuality(
    @Param('recordId') recordId: string,
    @CurrentOrganization() organization: any,
  ) {
    return this.dataQualityService.assessActivityRecordQuality(recordId, organization.id);
  }

  @Post('assess-batch')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ 
    summary: '批量评估数据质量',
    description: '对符合条件的活动记录进行批量数据质量评估'
  })
  @ApiResponse({ 
    status: 200, 
    description: '批量评估成功'
  })
  async assessBatchQuality(
    @Body() filters: any,
    @CurrentOrganization() organization: any,
  ) {
    return this.dataQualityService.assessBatchQuality(organization.id, filters);
  }

  @Get('statistics')
  @Roles('ADMIN', 'MANAGER', 'MEMBER')
  @ApiOperation({ 
    summary: '获取数据质量统计',
    description: '获取组织的数据质量统计信息'
  })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功'
  })
  async getQualityStats(
    @CurrentOrganization() organization: any,
  ) {
    return this.dataQualityService.getOrganizationQualityStats(organization.id);
  }

  @Get('report')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ 
    summary: '生成数据质量报告',
    description: '生成组织的数据质量报告'
  })
  @ApiResponse({ 
    status: 200, 
    description: '报告生成成功'
  })
  async generateQualityReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentOrganization() organization: any,
  ) {
    const period = startDate && endDate ? {
      start: new Date(startDate),
      end: new Date(endDate),
    } : undefined;

    return this.dataQualityService.generateQualityReport(organization.id, period);
  }
}