import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, name, password } = registerDto;

    // 检查邮箱是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('该邮箱已被注册');
    }

    // 加密密码
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        locale: true,
        timezone: true,
        createdAt: true,
      },
    });

    // 生成令牌
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 查找用户
    const user = await this.prisma.user.findUnique({
      where: { 
        email,
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
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 更新最后登录时间
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 生成令牌
    const tokens = await this.generateTokens(user.id, user.email);

    // 返回用户信息（不包含密码）
    const { passwordHash, ...userInfo } = user;
    
    return {
      user: userInfo,
      ...tokens,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // 验证用户是否仍然有效
      const user = await this.prisma.user.findUnique({
        where: { 
          id: payload.sub,
          isActive: true,
          deletedAt: null,
        },
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在或已被停用');
      }

      // 生成新的令牌
      const tokens = await this.generateTokens(user.id, user.email);
      
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }

  async logout(userId: string) {
    // 这里可以实现令牌黑名单机制
    // 目前简单返回成功
    return { message: '登出成功' };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { 
      sub: userId, 
      email,
      iat: Math.floor(Date.now() / 1000),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { 
        id: userId,
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
      return null;
    }

    const { passwordHash, ...result } = user;
    return result;
  }
}