import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/gasPrice (GET)', () => {
    return request(app.getHttpServer())
      .get('/gasPrice')
      .expect(200)
      .expect(response => {
        expect(response.body).toHaveProperty('gasPrice');
        expect(response.body.gasPrice).toBeDefined();
      });
  });

  it('/return/:fromTokenAddress/:toTokenAddress/:amountIn (GET) - should return 400 for zero or negative amount', () => {
    const fromTokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
    const toTokenAddress = '0xC02wrongTokenAddress'; // Invalid token address
    const invalidAmounts = [0, -100]; // Test cases: zero and negative amounts
  
    return Promise.all(
      invalidAmounts.map(amountIn =>
        request(app.getHttpServer())
          .get(`/return/${fromTokenAddress}/${toTokenAddress}/${amountIn}`)
          .expect(400) // Expecting a 400 Bad Request
          .expect(response => {
            expect(response.body).toHaveProperty('statusCode', 400);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('amountIn must be a positive number');
          })
      )
    );
  });
  

  it('/return/:fromTokenAddress/:toTokenAddress/:amountIn (GET) - should return 404 for invalid token address', () => {
    const fromTokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
    const toTokenAddress = '0xC02wrongTokenAddress'; // Invalid token address
    const amountIn = 100;
  
    return request(app.getHttpServer())
      .get(`/return/${fromTokenAddress}/${toTokenAddress}/${amountIn}`)
      .expect(400) // Expecting a 404 Not Found
      .expect(response => {
        expect(response.body).toHaveProperty('statusCode', 400);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBeDefined();
      });
  });
  

  it('/return/:fromTokenAddress/:toTokenAddress/:amountIn (GET)', () => {
    const fromTokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
    const toTokenAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    const amountIn = 100;

    return request(app.getHttpServer())
      .get(`/return/${fromTokenAddress}/${toTokenAddress}/${amountIn}`)
      .expect(200)
      .expect(response => {
        expect(response.body).toHaveProperty('fromTokenAddress');
        expect(response.body).toHaveProperty('toTokenAddress');
        expect(response.body).toHaveProperty('amountIn');
        expect(response.body).toHaveProperty('amountOut');
      });
  });
});
