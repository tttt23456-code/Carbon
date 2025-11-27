import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 创建用户
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // 首先尝试查找现有用户
  let user = await prisma.user.findUnique({
    where: { email: 'admin@caict-carbon.com' }
  });
  
  if (user) {
    // 如果用户存在，更新密码
    user = await prisma.user.update({
      where: { email: 'admin@caict-carbon.com' },
      data: {
        passwordHash: hashedPassword,
        isActive: true,
      },
    });
    console.log('Updated existing user:', user);
  } else {
    // 如果用户不存在，创建新用户
    user = await prisma.user.create({
      data: {
        email: 'admin@caict-carbon.com',
        name: '系统管理员',
        passwordHash: hashedPassword,
        locale: 'zh-CN',
        timezone: 'Asia/Shanghai',
        isActive: true,
      },
    });
    console.log('Created new user:', user);
  }
  
  // 查找或创建组织
  let organization = await prisma.organization.findUnique({
    where: { slug: 'caict-carbon' }
  });
  
  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: '中汽碳（北京）数字技术中心有限公司',
        slug: 'caict-carbon',
        timezone: 'Asia/Shanghai',
        settings: '{}', // 空的JSON字符串
      },
    });
    console.log('Created organization:', organization);
  } else {
    console.log('Organization already exists:', organization);
  }
  
  // 查找或创建用户组织关系
  let membership = await prisma.membership.findFirst({
    where: {
      userId: user.id,
      organizationId: organization.id,
    }
  });
  
  if (!membership) {
    membership = await prisma.membership.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: 'ADMIN',
      },
    });
    console.log('Created membership:', membership);
  } else {
    console.log('Membership already exists:', membership);
  }
  
  console.log('Successfully ensured user and organization exist!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });