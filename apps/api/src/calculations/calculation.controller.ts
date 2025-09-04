import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CalculationService } from './calculation.service';
import { 
  SingleCalculationDto,
  BatchCalculationDto,
  RecalculateDto,
  CalculationResultDto,
  BatchCalculationResultDto,
  SupportedActivityTypesDto,
  CalculatorStatisticsDto,
} from './dto/calculation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/auth.decorator';
import { CurrentUser, CurrentOrganization } from '../common/decorators/user.decorator';

@ApiTags('calculations')
@Controller('calculations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CalculationController {
  constructor(private readonly calculationService: CalculationService) {}

  @Post('calculate')
  @Roles('ADMIN', 'MANAGER', 'MEMBER')
  @ApiOperation({ 
    summary: '单次碳排放计算',
    description: '基于活动数据和排放因子计算单次碳排放量'
  })
  @ApiBody({ type: SingleCalculationDto })
  @ApiResponse({ 
    status: 200, 
    description: '计算成功',
    type: CalculationResultDto 
  })
  @ApiResponse({ status: 400, description: '输入参数错误' })
  @ApiResponse({ status: 404, description: '未找到合适的排放因子' })
  async calculate(
    @Body() input: SingleCalculationDto,
    @CurrentOrganization() organization: any,
  ): Promise<CalculationResultDto> {
    return this.calculationService.calculate(
      organization.id,
      input,
      input.factorId
    );
  }

  @Post('batch')
  @Roles('ADMIN', 'MANAGER', 'MEMBER')
  @ApiOperation({ 
    summary: '批量碳排放计算',
    description: '批量计算多个活动记录的碳排放量'
  })
  @ApiBody({ type: BatchCalculationDto })
  @ApiResponse({ 
    status: 200, 
    description: '批量计算成功',
    type: BatchCalculationResultDto 
  })
  @ApiResponse({ status: 400, description: '输入参数错误' })
  @ApiResponse({ status: 404, description: '未找到符合条件的活动记录' })
  async batchCalculate(
    @Body() input: BatchCalculationDto,
    @CurrentOrganization() organization: any,
  ): Promise<BatchCalculationResultDto> {
    return this.calculationService.batchCalculate({
      organizationId: organization.id,
      ...input,
    });
  }

  @Patch('recalculate/:activityRecordId')
  @Roles('ADMIN', 'MANAGER', 'MEMBER')
  @ApiOperation({ 
    summary: '重新计算指定活动记录',
    description: '使用新的排放因子重新计算指定活动记录的碳排放量'
  })
  @ApiParam({ 
    name: 'activityRecordId', 
    description: '活动记录ID',
    example: 'record-123'
  })
  @ApiBody({ type: RecalculateDto })
  @ApiResponse({ 
    status: 200, 
    description: '重新计算成功',
    type: CalculationResultDto 
  })
  @ApiResponse({ status: 404, description: '活动记录不存在' })
  async recalculate(
    @Param('activityRecordId') activityRecordId: string,
    @Body() input: RecalculateDto,
    @CurrentOrganization() organization: any,
  ): Promise<CalculationResultDto> {
    return this.calculationService.recalculate(
      organization.id,
      activityRecordId,
      input.factorId
    );
  }

  @Get('activity-types')
  @ApiOperation({ 
    summary: '获取支持的活动类型',
    description: '获取系统支持的所有活动类型列表'
  })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    type: SupportedActivityTypesDto 
  })
  async getSupportedActivityTypes(): Promise<SupportedActivityTypesDto> {
    const activityTypes = this.calculationService.getSupportedActivityTypes();
    const statistics = this.calculationService.getCalculatorStatistics();
    
    return {
      activityTypes,
      groups: statistics.groups,
    };
  }

  @Get('statistics')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ 
    summary: '获取计算器统计信息',
    description: '获取计算器的统计信息和配置状态'
  })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    type: CalculatorStatisticsDto 
  })
  async getCalculatorStatistics(): Promise<CalculatorStatisticsDto> {
    return this.calculationService.getCalculatorStatistics();
  }

  @Get('validate')
  @Roles('ADMIN')
  @ApiOperation({ 
    summary: '验证计算器配置',
    description: '验证所有计算器的配置是否正确'
  })
  @ApiResponse({ 
    status: 200, 
    description: '验证完成',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
        errors: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  async validateCalculators() {
    return this.calculationService.validateCalculators();
  }
}