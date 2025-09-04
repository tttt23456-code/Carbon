import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const apiPrefix = configService.get<string>('API_PREFIX', '/api/v1');
  const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:3000').split(',');

  // 安全配置
  app.use(helmet());

  // 全局路径前缀
  app.setGlobalPrefix(apiPrefix);

  // CORS配置
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger文档配置
  const config = new DocumentBuilder()
    .setTitle('Carbon Emission Calculator API')
    .setDescription('遵循GHG Protocol的碳排放计算平台API文档')
    .setVersion('1.0')
    .addTag('auth', '认证与授权')
    .addTag('organizations', '组织管理')
    .addTag('facilities', '设施管理')
    .addTag('projects', '项目管理')
    .addTag('activity-records', '活动数据')
    .addTag('emission-factors', '排放因子')
    .addTag('calculations', '碳排放计算')
    .addTag('reports', '报表与导出')
    .addTag('audit-logs', '审计日志')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(port);
  
  logger.log(`🚀 应用启动成功！`);
  logger.log(`📝 API文档: http://localhost:${port}/api/docs`);
  logger.log(`🌐 API端点: http://localhost:${port}${apiPrefix}`);
  logger.log(`🔧 环境: ${configService.get('NODE_ENV')}`);
}

bootstrap().catch((error) => {
  console.error('启动应用时出错:', error);
  process.exit(1);
});