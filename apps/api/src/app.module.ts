import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { ProjectsModule } from './projects/projects.module';
import { ActivityRecordsModule } from './activity-records/activity-records.module';
import { EmissionFactorsModule } from './emission-factors/emission-factors.module';
import { CalculationsModule } from './calculations/calculations.module';
import { ReportsModule } from './reports/reports.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // 速率限制
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1分钟
        limit: 100, // 100次请求
      },
    ]),

    // 核心模块
    PrismaModule,
    HealthModule,

    // 业务模块
    AuthModule,
    UsersModule,
    OrganizationsModule,
    FacilitiesModule,
    ProjectsModule,
    ActivityRecordsModule,
    EmissionFactorsModule,
    CalculationsModule,
    ReportsModule,
    AuditLogsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}