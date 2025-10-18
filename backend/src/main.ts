import * as crypto from 'crypto';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { importTestData } from './database/seeds/import-test-data';

// Crypto polyfill...
if (typeof (global as any).crypto === 'undefined') {
  (global as any).crypto = {
    randomUUID: () => crypto.randomUUID(),
    getRandomValues: (array: any) => crypto.randomFillSync(array),
  };
  console.log('✅ Crypto polyfill applied successfully');
}

async function bootstrap() {
  console.log('🚀 Starting Film API application...');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Инициализация базы данных с тестовыми данными
  try {
    console.log('🗄️ Initializing database...');
    const dataSource = app.get(DataSource);

    // Даем время для подключения к БД
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await importTestData(dataSource);
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.warn('⚠️ Database initialization warning:', error);
  }

  // остальной код...
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Health check endpoints
  app.use(
    '/health',
    (
      req: any,
      res: {
        json: (arg0: {
          status: string;
          service: string;
          timestamp: string;
        }) => any;
      },
    ) => {
      return res.json({
        status: 'OK',
        service: 'Film API',
        timestamp: new Date().toISOString(),
      });
    },
  );

  app.use(
    '/api/health',
    (
      req: any,
      res: {
        json: (arg0: {
          status: string;
          message: string;
          timestamp: string;
        }) => any;
      },
    ) => {
      return res.json({
        status: 'operational',
        message: 'API is running',
        timestamp: new Date().toISOString(),
      });
    },
  );

  app.use(
    '/',
    (
      req: { path: string },
      res: {
        json: (arg0: {
          message: string;
          status: string;
          timestamp: string;
          endpoints: {
            health: string;
            films: string;
            filmSchedule: string;
            createOrder: string;
          };
        }) => any;
      },
      next: () => void,
    ) => {
      if (req.path === '/') {
        return res.json({
          message: 'Film API',
          status: 'OK',
          timestamp: new Date().toISOString(),
          endpoints: {
            health: 'GET /health',
            films: 'GET /api/afisha/films',
            filmSchedule: 'GET /api/afisha/films/:id/schedule',
            createOrder: 'POST /api/afisha/order',
          },
        });
      }
      next();
    },
  );

  const port = 3000;
  const host = '0.0.0.0';

  await app.listen(port, host);

  console.log(`✅ Application successfully started on ${host}:${port}`);
  console.log('🎬 Film API is ready to accept requests');
  console.log(`📊 Health check available at http://${host}:${port}/health`);
}

bootstrap();
