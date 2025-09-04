import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto, InviteMemberDto } from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateOrganizationDto, creatorId: string) {
    // 检查 slug 是否已存在
    const existingOrg = await this.prisma.organization.findUnique({
      where: { slug: createDto.slug },
    });

    if (existingOrg) {
      throw new ConflictException('组织标识符已存在');
    }

    // 创建组织
    const organization = await this.prisma.organization.create({
      data: {
        ...createDto,
        timezone: createDto.timezone || 'UTC',
        settings: createDto.settings ? JSON.stringify(createDto.settings) : "{}",
      },
    });

    // 创建创建者的管理员成员关系
    await this.prisma.membership.create({
      data: {
        organizationId: organization.id,
        userId: creatorId,
        role: 'ADMIN',
        invitedBy: creatorId,
      },
    });

    return organization;
  }

  async findAll(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { 
        userId,
        organization: {
          deletedAt: null,
        },
      },
      include: {
        organization: true,
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    return memberships.map(membership => ({
      ...membership.organization,
      role: membership.role,
      joinedAt: membership.joinedAt,
    }));
  }

  async findOne(id: string, userId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        organizationId: id,
        userId,
        organization: {
          deletedAt: null,
        },
      },
      include: {
        organization: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('组织不存在或无权限访问');
    }

    return {
      ...membership.organization,
      role: membership.role,
      joinedAt: membership.joinedAt,
    };
  }

  async update(id: string, updateDto: UpdateOrganizationDto, userId: string) {
    // 检查权限
    await this.checkPermission(id, userId, ['ADMIN', 'MANAGER']);

    const organization = await this.prisma.organization.update({
      where: { id },
      data: {
        ...(updateDto.name !== undefined && { name: updateDto.name }),
        ...(updateDto.description !== undefined && { description: updateDto.description }),
        ...(updateDto.country !== undefined && { country: updateDto.country }),
        ...(updateDto.region !== undefined && { region: updateDto.region }),
        ...(updateDto.timezone !== undefined && { timezone: updateDto.timezone }),
        ...(updateDto.settings !== undefined && { settings: JSON.stringify(updateDto.settings) }),
      },
    });

    return organization;
  }

  async remove(id: string, userId: string) {
    // 检查权限（只有管理员可以删除组织）
    await this.checkPermission(id, userId, ['ADMIN']);

    await this.prisma.organization.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: '组织已删除' };
  }

  async getMembers(organizationId: string, userId: string) {
    // 检查权限
    await this.checkPermission(organizationId, userId, ['ADMIN', 'MANAGER', 'MEMBER', 'READONLY']);

    const memberships = await this.prisma.membership.findMany({
      where: { 
        organizationId,
        user: {
          deletedAt: null,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            lastLoginAt: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    return memberships;
  }

  async inviteMember(organizationId: string, inviteDto: InviteMemberDto, inviterId: string) {
    // 检查权限
    await this.checkPermission(organizationId, inviterId, ['ADMIN', 'MANAGER']);

    // 查找要邀请的用户
    const user = await this.prisma.user.findUnique({
      where: { email: inviteDto.email },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查是否已经是成员
    const existingMembership = await this.prisma.membership.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: user.id,
        },
      },
    });

    if (existingMembership) {
      throw new ConflictException('用户已经是组织成员');
    }

    // 创建成员关系
    const membership = await this.prisma.membership.create({
      data: {
        organizationId,
        userId: user.id,
        role: inviteDto.role as any,
        invitedBy: inviterId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return membership;
  }

  async updateMemberRole(organizationId: string, memberId: string, role: string, updaterId: string) {
    // 检查权限
    await this.checkPermission(organizationId, updaterId, ['ADMIN']);

    const membership = await this.prisma.membership.findFirst({
      where: {
        id: memberId,
        organizationId,
      },
    });

    if (!membership) {
      throw new NotFoundException('成员不存在');
    }

    // 不能修改自己的角色
    if (membership.userId === updaterId) {
      throw new ForbiddenException('不能修改自己的角色');
    }

    const updatedMembership = await this.prisma.membership.update({
      where: { id: memberId },
      data: { role: role as any },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return updatedMembership;
  }

  async removeMember(organizationId: string, memberId: string, removerId: string) {
    // 检查权限
    await this.checkPermission(organizationId, removerId, ['ADMIN']);

    const membership = await this.prisma.membership.findFirst({
      where: {
        id: memberId,
        organizationId,
      },
    });

    if (!membership) {
      throw new NotFoundException('成员不存在');
    }

    // 不能移除自己
    if (membership.userId === removerId) {
      throw new ForbiddenException('不能移除自己');
    }

    // 检查是否是最后一个管理员
    const adminCount = await this.prisma.membership.count({
      where: {
        organizationId,
        role: 'ADMIN',
      },
    });

    if (membership.role === 'ADMIN' && adminCount <= 1) {
      throw new ForbiddenException('不能移除最后一个管理员');
    }

    await this.prisma.membership.delete({
      where: { id: memberId },
    });

    return { message: '成员已移除' };
  }

  private async checkPermission(organizationId: string, userId: string, allowedRoles: string[]) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        organizationId,
        userId,
        organization: {
          deletedAt: null,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('组织不存在或无权限访问');
    }

    if (!allowedRoles.includes(membership.role)) {
      throw new ForbiddenException('权限不足');
    }

    return membership;
  }
}