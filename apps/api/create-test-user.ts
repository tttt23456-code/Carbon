import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 创建测试用户
  const hashedPassword = await bcrypt.hash('test123', 10);
  
  try {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: '测试用户',
        passwordHash: hashedPassword,
        locale: 'zh-CN',
        timezone: 'Asia/Shanghai',
        isActive: true,
      },
    });
    
    console.log('创建测试用户成功:', user);
  } catch (error) {
    console.error('创建测试用户失败:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });