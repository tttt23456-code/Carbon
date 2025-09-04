import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';

describe('CalculationsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);
    await app.init();

    // 创建测试用户并获取token
    const loginResult = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });
    accessToken = loginResult.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/calculations/calculate (POST)', () => {
    it('should calculate electricity emissions', async () => {
      const calculationData = {
        activityType: 'electricity',
        amount: 1000,
        unit: 'kWh',
        metadata: {
          method: 'location_based',
          region: 'CN',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/calculations/calculate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(calculationData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('tCO2e');
      expect(response.body.tCO2e).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('method');
      expect(response.body.method).toBe('location_based');
    });

    it('should calculate natural gas emissions', async () => {
      const calculationData = {
        activityType: 'natural_gas',
        amount: 500,
        unit: 'm³',
        metadata: {
          heating_value: 38.7,
          carbon_content: 15.3,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/calculations/calculate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(calculationData)
        .expect(201);

      expect(response.body).toHaveProperty('tCO2e');
      expect(response.body.tCO2e).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('breakdown');
    });

    it('should fail without authentication', async () => {
      const calculationData = {
        activityType: 'electricity',
        amount: 1000,
        unit: 'kWh',
      };

      await request(app.getHttpServer())
        .post('/calculations/calculate')
        .send(calculationData)
        .expect(401);
    });

    it('should fail with invalid activity type', async () => {
      const calculationData = {
        activityType: 'invalid_type',
        amount: 1000,
        unit: 'kWh',
      };

      await request(app.getHttpServer())
        .post('/calculations/calculate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(calculationData)
        .expect(400);
    });
  });

  describe('/calculations/batch (POST)', () => {
    it('should perform batch calculations', async () => {
      const batchData = {
        calculations: [
          {
            activityType: 'electricity',
            amount: 1000,
            unit: 'kWh',
          },
          {
            activityType: 'natural_gas',
            amount: 500,
            unit: 'm³',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/calculations/batch')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(batchData)
        .expect(201);

      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results).toHaveLength(2);
      
      response.body.results.forEach(result => {
        expect(result).toHaveProperty('tCO2e');
        expect(result.tCO2e).toBeGreaterThan(0);
      });
    });
  });
});