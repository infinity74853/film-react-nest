// ДОЛЖНО БЫТЬ САМЫМ ПЕРВЫМ ИМПОРТОМ
import * as crypto from 'crypto';

// Crypto polyfill ДО всех остальных импортов
if (typeof (global as any).crypto === 'undefined') {
  (global as any).crypto = {
    randomUUID: () => crypto.randomUUID(),
    getRandomValues: (array: any) => crypto.randomFillSync(array),
  };
  console.log('✅ Crypto polyfill applied successfully');
}

// Теперь импортируем NestJS и остальные модули
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { importTestData } from './database/seeds/import-test-data';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  console.log('🚀 Starting Film API application...');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Инициализация базы данных с тестовыми данными
  try {
    console.log('🗄️ Initializing database...');
    const dataSource = app.get(DataSource);

    // Проверяем подключение к БД
    try {
      await dataSource.initialize();
      console.log('✅ Database connection established');

      await importTestData(dataSource);
      console.log('✅ Database initialization completed');
    } catch (dbError) {
      console.warn('⚠️ Database connection failed:', dbError);
      console.log('🔄 Continuing without database - using mock data');

      // Добавляем middleware для обработки запросов без БД
      app.use(
        '/api/afisha/films',
        (req: Request, res: Response, next: NextFunction) => {
          if (req.method === 'GET') {
            console.log('📋 Returning mock films data (no database)');
            return res.json({
              total: 0,
              items: [],
            });
          }
          next();
        },
      );

      app.use(
        '/api/afisha/order',
        (req: Request, res: Response, next: NextFunction) => {
          if (req.method === 'POST') {
            console.log('🎫 Returning mock order response (no database)');
            const body = req.body;
            const tickets = body?.tickets || [];
            return res.json({
              total: tickets.length,
              items: tickets.map((ticket: any, index: number) => ({
                id: `mock-order-${Date.now()}-${index}`,
                film: ticket.film || 'mock-film',
                session: ticket.session || 'mock-session',
                daytime: ticket.daytime || new Date().toISOString(),
                row: ticket.row || 1,
                seat: ticket.seat || 1,
                price: ticket.price || 350,
              })),
            });
          }
          next();
        },
      );
    }
  } catch (error) {
    console.warn('⚠️ Database initialization warning:', error);
    console.log('🔄 Continuing without database initialization');
  }

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Health check endpoints с правильными типами
  app.use('/health', (_req: Request, res: Response) => {
    return res.json({
      status: 'OK',
      service: 'Film API',
      timestamp: new Date().toISOString(),
      database: 'PostgreSQL/Mock',
    });
  });

  app.use('/api/health', (_req: Request, res: Response) => {
    return res.json({
      status: 'operational',
      message: 'API is running',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/', (req: Request, res: Response, next: NextFunction) => {
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
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await app.close();
    process.exit(0);
  });

  const port = 3000;
  const host = '0.0.0.0';

  await app.listen(port, host);

  console.log(`✅ Application successfully started on ${host}:${port}`);
  console.log('🎬 Film API is ready to accept requests');
  console.log(`📊 Health check available at http://${host}:${port}/health`);
}

bootstrap();
