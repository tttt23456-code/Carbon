import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@carbon.example.com', description: '邮箱地址' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @ApiProperty({ example: 'admin123', description: '密码' })
  @IsString()
  @MinLength(6, { message: '密码长度至少6位' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'admin@carbon.example.com', description: '邮箱地址' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @ApiProperty({ example: '管理员', description: '用户姓名' })
  @IsString()
  @MinLength(2, { message: '姓名长度至少2位' })
  name: string;

  @ApiProperty({ example: 'admin123', description: '密码' })
  @IsString()
  @MinLength(6, { message: '密码长度至少6位' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新令牌' })
  @IsString()
  refreshToken: string;
}