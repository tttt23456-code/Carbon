import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/auth.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否为公开路由
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('未提供访问令牌');
    }

    try {
      // 使用JWT_SECRET验证令牌
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      
      // 从数据库获取用户信息
      const user = await this.prisma.user.findUnique({
        where: { 
          id: payload.sub,
          isActive: true,
          deletedAt: null,
        },
        include: {
          memberships: {
            include: {
              organization: true,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在或已被停用');
      }

      request.user = user;
      
      // 设置默认组织（如果用户有组织的话）
      if (user.memberships.length > 0) {
        request.organization = user.memberships[0].organization;
      }

    } catch (error) {
      throw new UnauthorizedException('无效的访问令牌');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}