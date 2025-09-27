import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

import request from 'supertest';

describe('Simple E2E Test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should work', async () => {
    const response = await request(app.getHttpServer()).get('/').expect(200);

    expect(response.body.message).toBeDefined();
  });
});
