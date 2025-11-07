// ДОЛЖНО БЫТЬ САМЫМ ПЕРВЫМ ИМПОРТОМ
import * as crypto from 'crypto';

// Crypto polyfill ДО всех остальных импортов
if (typeof (global as any).crypto === 'undefined') {
  (global as any).crypto = {
    randomUUID: () => crypto.randomUUID(),
    getRandomValues: (array: any) => crypto.randomFillSync(array),
  };
}

// Теперь импортируем NestJS и остальные модули
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { LoggerFactory } from './logger/logger.factory';
import { DataSource } from 'typeorm';
import { importTestData } from './database/seeds/import-test-data';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  // СОЗДАЕМ ПРИЛОЖЕНИЕ С БУФЕРИЗАЦИЕЙ ЛОГОВ
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // ВАЖНО: буферизуем логи до настройки логгера
  });

  // НАСТРАИВАЕМ ЛОГГЕР ПЕРВЫМ ДЕЛОМ
  const logger = LoggerFactory.createLogger('Bootstrap');
  app.useLogger(logger);

  // Инициализация базы данных с тестовыми данными
  try {
    const dataSource = app.get(DataSource);

    // Даем время для подключения к БД
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await importTestData(dataSource);
    logger.log('✅ Database initialized with test data');
  } catch (error) {
    logger.warn('⚠️ Database initialization warning:', error);
  }

  app.setGlobalPrefix('api/afisha');
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

  process.on('SIGTERM', async () => {
    logger.log('🛑 Received SIGTERM, shutting down gracefully...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('🛑 Received SIGINT, shutting down gracefully...');
    await app.close();
    process.exit(0);
  });

  const port = 3000;
  const host = '0.0.0.0';

  await app.listen(port, host);

  // Логируем успешный запуск
  logger.log(`🚀 Application is running on: http://${host}:${port}`);
  logger.log(`📝 Logger type: ${process.env.LOGGER_TYPE || 'dev'}`);
}

bootstrap();
