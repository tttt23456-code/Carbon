import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  InviteMemberDto,
  UpdateMemberRoleDto,
  OrganizationResponseDto,
  MembershipResponseDto,
} from './dto/organization.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ 
    summary: '创建组织',
    description: '创建新的组织，创建者自动成为管理员'
  })
  @ApiBody({ type: CreateOrganizationDto })
  @ApiResponse({ 
    status: 201, 
    description: '组织创建成功',
    type: OrganizationResponseDto 
  })
  @ApiResponse({ status: 409, description: '组织标识符已存在' })
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @CurrentUser() user: any,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.create(createOrganizationDto, user.id);
  }

  @Get()
  @ApiOperation({ 
    summary: '获取用户的所有组织',
    description: '获取当前用户所属的所有组织列表'
  })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    type: [OrganizationResponseDto] 
  })
  async findAll(@CurrentUser() user: any): Promise<OrganizationResponseDto[]> {
    return this.organizationsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: '获取组织详情',
    description: '获取指定组织的详细信息'
  })
  @ApiParam({ name: 'id', description: '组织ID' })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    type: OrganizationResponseDto 
  })
  @ApiResponse({ status: 404, description: '组织不存在或无权限访问' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.findOne(id, user.id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ 
    summary: '更新组织信息',
    description: '更新组织的基本信息（需要管理员或经理权限）'
  })
  @ApiParam({ name: 'id', description: '组织ID' })
  @ApiBody({ type: UpdateOrganizationDto })
  @ApiResponse({ 
    status: 200, 
    description: '更新成功',
    type: OrganizationResponseDto 
  })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '组织不存在' })
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @CurrentUser() user: any,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.update(id, updateOrganizationDto, user.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ 
    summary: '删除组织',
    description: '软删除组织（仅管理员可操作）'
  })
  @ApiParam({ name: 'id', description: '组织ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '组织不存在' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    return this.organizationsService.remove(id, user.id);
  }

  @Get(':id/members')
  @ApiOperation({ 
    summary: '获取组织成员列表',
    description: '获取组织的所有成员信息'
  })
  @ApiParam({ name: 'id', description: '组织ID' })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    type: [MembershipResponseDto] 
  })
  @ApiResponse({ status: 404, description: '组织不存在或无权限访问' })
  async getMembers(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<MembershipResponseDto[]> {
    return this.organizationsService.getMembers(id, user.id);
  }

  @Post(':id/members')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ 
    summary: '邀请新成员',
    description: '邀请用户加入组织（需要管理员或经理权限）'
  })
  @ApiParam({ name: 'id', description: '组织ID' })
  @ApiBody({ type: InviteMemberDto })
  @ApiResponse({ 
    status: 201, 
    description: '邀请成功',
    type: MembershipResponseDto 
  })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 409, description: '用户已经是组织成员' })
  async inviteMember(
    @Param('id') id: string,
    @Body() inviteMemberDto: InviteMemberDto,
    @CurrentUser() user: any,
  ): Promise<MembershipResponseDto> {
    return this.organizationsService.inviteMember(id, inviteMemberDto, user.id);
  }

  @Patch(':id/members/:memberId')
  @Roles('ADMIN')
  @ApiOperation({ 
    summary: '更新成员角色',
    description: '更新组织成员的角色（仅管理员可操作）'
  })
  @ApiParam({ name: 'id', description: '组织ID' })
  @ApiParam({ name: 'memberId', description: '成员ID' })
  @ApiBody({ type: UpdateMemberRoleDto })
  @ApiResponse({ 
    status: 200, 
    description: '更新成功',
    type: MembershipResponseDto 
  })
  @ApiResponse({ status: 403, description: '权限不足或不能修改自己的角色' })
  @ApiResponse({ status: 404, description: '成员不存在' })
  async updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto,
    @CurrentUser() user: any,
  ): Promise<MembershipResponseDto> {
    return this.organizationsService.updateMemberRole(
      id,
      memberId,
      updateMemberRoleDto.role,
      user.id,
    );
  }

  @Delete(':id/members/:memberId')
  @Roles('ADMIN')
  @ApiOperation({ 
    summary: '移除成员',
    description: '从组织中移除成员（仅管理员可操作）'
  })
  @ApiParam({ name: 'id', description: '组织ID' })
  @ApiParam({ name: 'memberId', description: '成员ID' })
  @ApiResponse({ status: 200, description: '移除成功' })
  @ApiResponse({ status: 403, description: '权限不足、不能移除自己或不能移除最后一个管理员' })
  @ApiResponse({ status: 404, description: '成员不存在' })
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    return this.organizationsService.removeMember(id, memberId, user.id);
  }
}