import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始播种数据...');

  // 清理现有数据（开发环境）
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 清理现有数据...');
    await prisma.calculationResult.deleteMany();
    await prisma.activityRecord.deleteMany();
    await prisma.emissionFactor.deleteMany();
    await prisma.dataSource.deleteMany();
    await prisma.project.deleteMany();
    await prisma.facility.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();
  }

  // 创建示例用户
  console.log('👤 创建示例用户...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@caict-carbon.com',
      name: '系统管理员',
      passwordHash: await bcrypt.hash('admin123', 10),
      locale: 'zh-CN',
      timezone: 'Asia/Shanghai',
      emailVerified: true,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@caict-carbon.com',
      name: '碳管理经理',
      passwordHash: await bcrypt.hash('manager123', 10),
      locale: 'zh-CN',
      timezone: 'Asia/Shanghai',
      emailVerified: true,
    },
  });

  const memberUser = await prisma.user.create({
    data: {
      email: 'member@caict-carbon.com',
      name: '普通用户',
      passwordHash: await bcrypt.hash('member123', 10),
      locale: 'zh-CN',
      timezone: 'Asia/Shanghai',
      emailVerified: true,
    },
  });

  // 创建示例组织
  console.log('🏢 创建示例组织...');
  const organization = await prisma.organization.create({
    data: {
      name: '中汽碳（北京）数字技术中心有限公司',
      slug: 'caict-carbon',
      description: '专注于汽车产业碳中和数字化转型的创新企业',
      country: 'CN',
      region: 'Beijing',
      timezone: 'Asia/Shanghai',
      settings: {
        defaultCurrency: 'CNY',
        carbonAccountingStandard: 'GHG_PROTOCOL',
        reportingPeriod: 'calendar_year',
      },
    },
  });

  // 创建成员关系
  console.log('👥 创建组织成员关系...');
  await prisma.membership.createMany({
    data: [
      {
        organizationId: organization.id,
        userId: adminUser.id,
        role: 'ADMIN',
      },
      {
        organizationId: organization.id,
        userId: managerUser.id,
        role: 'MANAGER',
      },
      {
        organizationId: organization.id,
        userId: memberUser.id,
        role: 'MEMBER',
      },
    ],
  });

  // 创建设施
  console.log('🏭 创建示例设施...');
  const headquarters = await prisma.facility.create({
    data: {
      organizationId: organization.id,
      name: '总部大楼',
      type: 'OFFICE',
      description: '公司总部办公楼',
      address: '北京市朝阳区建国门外大街1号',
      country: 'CN',
      region: 'Beijing',
      coordinates: { lat: 39.9042, lng: 116.4074 },
      area: 5000,
      capacity: 200,
    },
  });

  const factory = await prisma.facility.create({
    data: {
      organizationId: organization.id,
      name: '生产工厂',
      type: 'FACTORY',
      description: '主要生产设施',
      address: '河北省廊坊市广阳区工业园区88号',
      country: 'CN',
      region: 'Hebei',
      coordinates: { lat: 39.5209, lng: 116.7134 },
      area: 15000,
      capacity: 100,
    },
  });

  // 创建项目
  console.log('📋 创建示例项目...');
  const carbonNeutralProject = await prisma.project.create({
    data: {
      organizationId: organization.id,
      name: '2024年碳中和项目',
      description: '实现公司2024年碳中和目标的综合项目',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: 'active',
      budget: 500000,
      manager: '张经理',
      metadata: {
        priority: 'high',
        category: 'sustainability',
      },
    },
  });

  // 创建数据源
  console.log('📊 创建数据源...');
  const manualDataSource = await prisma.dataSource.create({
    data: {
      organizationId: organization.id,
      type: 'MANUAL',
      name: '手工数据录入',
      description: '人工录入的能耗和活动数据',
      config: {
        validation: 'strict',
        approvalRequired: true,
      },
      status: 'ACTIVE',
    },
  });

  // 创建系统内置排放因子
  console.log('🧮 创建排放因子...');
  
  // 中国电力排放因子
  await prisma.emissionFactor.create({
    data: {
      organizationId: null, // 系统内置
      source: 'NATIONAL',
      region: 'CN',
      year: 2023,
      activityType: 'electricity',
      description: '中国电网平均电力排放因子',
      unit: 'kWh',
      factorValue: 0.5810, // kg CO2e/kWh
      factorUnit: 'kg CO2e/kWh',
      gas: 'CO2',
      gwp: 1,
      reference: '中国国家发改委发布的2023年电网排放因子',
      methodology: '基于电网结构和燃料组成的计算',
      assumptions: {
        gridMix: 'national_average',
        transmissionLoss: 0.065,
      },
      isActive: true,
      isDefault: true,
      priority: 100,
    },
  });

  // 天然气排放因子
  await prisma.emissionFactor.create({
    data: {
      organizationId: null,
      source: 'IPCC',
      region: 'GLOBAL',
      year: 2023,
      activityType: 'natural_gas',
      description: '天然气燃烧排放因子',
      unit: 'm3',
      factorValue: 1.9760, // kg CO2e/m3
      factorUnit: 'kg CO2e/m3',
      gas: 'CO2',
      gwp: 1,
      reference: 'IPCC 2006 Guidelines for National Greenhouse Gas Inventories',
      methodology: '基于燃料热值和排放系数',
      assumptions: {
        netCalorificValue: 35.3, // MJ/m3
        emissionFactor: 56.1, // kg CO2/GJ
      },
      isActive: true,
      isDefault: true,
      priority: 100,
    },
  });

  // 柴油排放因子
  await prisma.emissionFactor.create({
    data: {
      organizationId: null,
      source: 'IPCC',
      region: 'GLOBAL',
      year: 2023,
      activityType: 'diesel',
      description: '柴油燃烧排放因子',
      unit: 'L',
      factorValue: 2.6870, // kg CO2e/L
      factorUnit: 'kg CO2e/L',
      gas: 'CO2',
      gwp: 1,
      reference: 'IPCC 2006 Guidelines for National Greenhouse Gas Inventories',
      methodology: '基于燃料密度、热值和排放系数',
      assumptions: {
        density: 0.832, // kg/L
        netCalorificValue: 43.0, // MJ/kg
        emissionFactor: 74.1, // kg CO2/GJ
      },
      isActive: true,
      isDefault: true,
      priority: 100,
    },
  });

  // 汽油排放因子
  await prisma.emissionFactor.create({
    data: {
      organizationId: null,
      source: 'IPCC',
      region: 'GLOBAL',
      year: 2023,
      activityType: 'gasoline',
      description: '汽油燃烧排放因子',
      unit: 'L',
      factorValue: 2.3920, // kg CO2e/L
      factorUnit: 'kg CO2e/L',
      gas: 'CO2',
      gwp: 1,
      reference: 'IPCC 2006 Guidelines for National Greenhouse Gas Inventories',
      methodology: '基于燃料密度、热值和排放系数',
      assumptions: {
        density: 0.742, // kg/L
        netCalorificValue: 44.3, // MJ/kg
        emissionFactor: 69.3, // kg CO2/GJ
      },
      isActive: true,
      isDefault: true,
      priority: 100,
    },
  });

  // 航班排放因子（国内短途）
  await prisma.emissionFactor.create({
    data: {
      organizationId: null,
      source: 'DEFRA',
      region: 'GLOBAL',
      year: 2023,
      activityType: 'flight_domestic_short',
      description: '国内短途航班排放因子（经济舱）',
      unit: 'passenger-km',
      factorValue: 0.1579, // kg CO2e/passenger-km
      factorUnit: 'kg CO2e/passenger-km',
      gas: 'CO2',
      gwp: 1,
      reference: 'UK DEFRA Greenhouse Gas Conversion Factors 2023',
      methodology: '基于航空燃料消耗和乘客载荷因子',
      assumptions: {
        flightDistance: 'domestic_short', // < 500km
        cabinClass: 'economy',
        loadFactor: 0.82,
      },
      isActive: true,
      isDefault: true,
      priority: 100,
    },
  });

  // 公路货运排放因子
  await prisma.emissionFactor.create({
    data: {
      organizationId: null,
      source: 'DEFRA',
      region: 'GLOBAL',
      year: 2023,
      activityType: 'road_freight',
      description: '公路货运排放因子（中型卡车）',
      unit: 'tonne-km',
      factorValue: 0.2007, // kg CO2e/tonne-km
      factorUnit: 'kg CO2e/tonne-km',
      gas: 'CO2',
      gwp: 1,
      reference: 'UK DEFRA Greenhouse Gas Conversion Factors 2023',
      methodology: '基于车辆燃料效率和载重量',
      assumptions: {
        vehicleType: 'rigid_truck_medium',
        fuelType: 'diesel',
        loadFactor: 0.6,
      },
      isActive: true,
      isDefault: true,
      priority: 100,
    },
  });

  // 废弃物处理排放因子
  await prisma.emissionFactor.create({
    data: {
      organizationId: null,
      source: 'EPA',
      region: 'GLOBAL',
      year: 2023,
      activityType: 'waste_landfill',
      description: '废弃物填埋处理排放因子',
      unit: 'kg',
      factorValue: 0.4630, // kg CO2e/kg
      factorUnit: 'kg CO2e/kg',
      gas: 'CH4',
      gwp: 25,
      reference: 'US EPA Waste Reduction Model (WARM)',
      methodology: '基于废弃物分解产生的甲烷排放',
      assumptions: {
        wasteType: 'mixed_municipal',
        decompositionRate: 'moderate',
        methaneCaptureRate: 0.75,
      },
      isActive: true,
      isDefault: true,
      priority: 100,
    },
  });

  // 创建示例活动记录
  console.log('📈 创建示例活动记录...');
  
  // 电力消耗记录
  const electricityRecord = await prisma.activityRecord.create({
    data: {
      organizationId: organization.id,
      projectId: carbonNeutralProject.id,
      facilityId: headquarters.id,
      dataSourceId: manualDataSource.id,
      scope: 'SCOPE_2',
      category: 'PURCHASED_ELECTRICITY',
      activityType: 'electricity',
      amount: 25000,
      unit: 'kWh',
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-01-31'),
      description: '总部大楼1月份电力消耗',
      reference: 'INV-2024-001',
      dataQuality: 'measured',
      uncertainty: 5.0,
      isVerified: true,
      verifiedBy: managerUser.id,
      verifiedAt: new Date(),
      metadata: {
        meterReading: {
          start: 125000,
          end: 150000,
        },
        supplier: '国家电网',
        tariff: 'commercial',
      },
    },
  });

  // 天然气消耗记录
  await prisma.activityRecord.create({
    data: {
      organizationId: organization.id,
      projectId: carbonNeutralProject.id,
      facilityId: factory.id,
      dataSourceId: manualDataSource.id,
      scope: 'SCOPE_1',
      category: 'STATIONARY_COMBUSTION',
      activityType: 'natural_gas',
      amount: 1200,
      unit: 'm3',
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-01-31'),
      description: '工厂1月份天然气消耗',
      reference: 'GAS-2024-001',
      dataQuality: 'measured',
      uncertainty: 3.0,
      isVerified: true,
      verifiedBy: managerUser.id,
      verifiedAt: new Date(),
    },
  });

  // 商务出行记录
  await prisma.activityRecord.create({
    data: {
      organizationId: organization.id,
      projectId: carbonNeutralProject.id,
      dataSourceId: manualDataSource.id,
      scope: 'SCOPE_3',
      category: 'BUSINESS_TRAVEL',
      activityType: 'flight_domestic_short',
      amount: 1800, // passenger-km
      unit: 'passenger-km',
      periodStart: new Date('2024-01-15'),
      periodEnd: new Date('2024-01-15'),
      description: '北京-上海商务出行',
      reference: 'TRIP-2024-001',
      dataQuality: 'calculated',
      uncertainty: 10.0,
      metadata: {
        route: 'PEK-PVG',
        passengers: 2,
        distance: 900, // km per passenger
        cabinClass: 'economy',
      },
    },
  });

  // 货物运输记录
  await prisma.activityRecord.create({
    data: {
      organizationId: organization.id,
      projectId: carbonNeutralProject.id,
      facilityId: factory.id,
      dataSourceId: manualDataSource.id,
      scope: 'SCOPE_3',
      category: 'UPSTREAM_TRANSPORT',
      activityType: 'road_freight',
      amount: 2400, // tonne-km
      unit: 'tonne-km',
      periodStart: new Date('2024-01-10'),
      periodEnd: new Date('2024-01-12'),
      description: '原材料运输',
      reference: 'TRANS-2024-001',
      dataQuality: 'estimated',
      uncertainty: 15.0,
      metadata: {
        cargo: '钢材',
        weight: 8, // tonnes
        distance: 300, // km
        vehicleType: 'truck',
      },
    },
  });

  console.log('✅ 数据播种完成！');
  console.log(`
📊 已创建的数据：
- 👥 用户: 3个 (admin@caict-carbon.com, manager@caict-carbon.com, member@caict-carbon.com)
- 🏢 组织: 1个 (中汽碳（北京）数字技术中心有限公司)
- 🏭 设施: 2个 (总部大楼, 生产工厂)
- 📋 项目: 1个 (2024年碳中和项目)
- 📊 数据源: 1个 (手工数据录入)
- 🧮 排放因子: 7个 (电力、天然气、柴油、汽油、航班、货运、废弃物)
- 📈 活动记录: 4个 (电力、天然气、出行、运输)

🔑 登录凭据：
- 管理员: admin@caict-carbon.com / admin123
- 经理: manager@caict-carbon.com / manager123  
- 成员: member@caict-carbon.com / member123

⚠️  注意：这些是示例数据，排放因子仅供演示使用，实际应用中需要使用权威数据源。
  `);
}

main()
  .catch((e) => {
    console.error('❌ 播种数据时出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });