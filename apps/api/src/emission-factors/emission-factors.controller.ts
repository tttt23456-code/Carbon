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
import { EmissionFactorsService } from './emission-factors.service';
import {
  CreateEmissionFactorDto,
  UpdateEmissionFactorDto,
  EmissionFactorQueryDto,
  EmissionFactorResponseDto,
} from './dto/emission-factor.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/auth.decorator';
import { CurrentUser, CurrentOrganization } from '../common/decorators/user.decorator';

@ApiTags('emission-factors')
@Controller('emission-factors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class EmissionFactorsController {
  constructor(private readonly emissionFactorsService: EmissionFactorsService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ 
    summary: '创建排放因子',
    description: '创建新的排放因子（系统级或组织级）'
  })
  @ApiBody({ type: CreateEmissionFactorDto })
  @ApiResponse({ 
    status: 201, 
    description: '创建成功',
    type: EmissionFactorResponseDto 
  })
  async create(
    @Body() createEmissionFactorDto: CreateEmissionFactorDto,
    @CurrentOrganization() organization: any,
  ) {
    return this.emissionFactorsService.create(
      createEmissionFactorDto, 
      organization?.id
    );
  }

  @Get()
  @ApiOperation({ 
    summary: '获取排放因子列表',
    description: '分页获取排放因子列表，支持多种筛选条件'
  })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    type: EmissionFactorResponseDto,
    isArray: true
  })
  async findAll(
    @Query() query: EmissionFactorQueryDto,
    @CurrentOrganization() organization: any,
  ) {
    return this.emissionFactorsService.findAll(query, organization?.id);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: '获取排放因子详情',
    description: '根据ID获取排放因子详细信息'
  })
  @ApiParam({ name: 'id', description: '排放因子ID' })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    type: EmissionFactorResponseDto 
  })
  async findOne(
    @Param('id') id: string,
    @CurrentOrganization() organization: any,
  ) {
    return this.emissionFactorsService.findOne(id, organization?.id);
  }

  @Get('best/:activityType/:region')
  @ApiOperation({ 
    summary: '获取最佳排放因子',
    description: '根据活动类型和地区获取最佳匹配的排放因子'
  })
  @ApiParam({ name: 'activityType', description: '活动类型' })
  @ApiParam({ name: 'region', description: '地区代码' })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    type: EmissionFactorResponseDto 
  })
  async getBestFactor(
    @Param('activityType') activityType: string,
    @Param('region') region: string,
    @CurrentOrganization() organization: any,
  ) {
    return this.emissionFactorsService.getBestFactor(activityType, region, organization?.id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ 
    summary: '更新排放因子',
    description: '更新指定ID的排放因子信息'
  })
  @ApiParam({ name: 'id', description: '排放因子ID' })
  @ApiBody({ type: UpdateEmissionFactorDto })
  @ApiResponse({ 
    status: 200, 
    description: '更新成功',
    type: EmissionFactorResponseDto 
  })
  async update(
    @Param('id') id: string,
    @Body() updateEmissionFactorDto: UpdateEmissionFactorDto,
    @CurrentOrganization() organization: any,
  ) {
    return this.emissionFactorsService.update(
      id, 
      updateEmissionFactorDto, 
      organization?.id
    );
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ 
    summary: '删除排放因子',
    description: '软删除指定ID的排放因子'
  })
  @ApiParam({ name: 'id', description: '排放因子ID' })
  @ApiResponse({ 
    status: 200, 
    description: '删除成功'
  })
  async remove(
    @Param('id') id: string,
    @CurrentOrganization() organization: any,
  ) {
    return this.emissionFactorsService.remove(id, organization?.id);
  }
}