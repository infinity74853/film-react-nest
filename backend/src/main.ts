import * as crypto from 'crypto';

// Полифилл для crypto ДО всех импортов NestJS
if (typeof (global as any).crypto === 'undefined') {
  (global as any).crypto = {
    randomUUID: () => crypto.randomUUID(),
    getRandomValues: (array: any) => crypto.randomFillSync(array),
  };
  console.log('✅ Crypto polyfill applied successfully');
} else {
  console.log('✅ Crypto is already available');
}

// Теперь импортируем NestJS
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  console.log('🚀 Starting Film API application...');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug'],
    });

    app.enableCors({
      origin: true,
      credentials: true,
    });

    // Глобальная обработка ошибок валидации
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Health check endpoints - ДОЛЖНЫ РАБОТАТЬ ДАЖЕ ЕСЛИ БД НЕДОСТУПНА
    app.use('/health', (req: Request, res: Response) => {
      return res.json({
        status: 'OK',
        service: 'Film API',
        timestamp: new Date().toISOString(),
        database: 'checking...',
      });
    });

    app.use('/api/health', (req: Request, res: Response) => {
      return res.json({
        status: 'operational',
        message: 'API is running',
        timestamp: new Date().toISOString(),
      });
    });

    // Basic endpoint - ДОЛЖЕН РАБОТАТЬ ДАЖЕ ЕСЛИ БД НЕДОСТУПНА
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

    // Graceful shutdown handling
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

    // Start the application
    const port = 3000;
    const host = '0.0.0.0';

    await app.listen(port, host);

    console.log(`✅ Application successfully started on ${host}:${port}`);
    console.log('🎬 Film API is ready to accept requests');
    console.log(`📊 Health check available at http://${host}:${port}/health`);
  } catch (error) {
    console.error('❌ Failed to start application:', error);

    // Даже если БД недоступна, нужно чтобы приложение запустилось
    // и отвечало на health checks
    console.log('🔄 Attempting to start in fallback mode...');

    try {
      const fallbackApp = await NestFactory.create(AppModule, {
        logger: ['error', 'warn'],
        abortOnError: false,
      });

      fallbackApp.enableCors();

      // Basic health checks
      fallbackApp.use('/health', (req: Request, res: Response) => {
        return res.json({
          status: 'DEGRADED',
          service: 'Film API',
          database: 'UNAVAILABLE',
          timestamp: new Date().toISOString(),
          message: 'Database connection failed, but API is running',
        });
      });

      fallbackApp.use('/', (req: Request, res: Response) => {
        if (req.path === '/') {
          return res.json({
            message: 'Film API (Fallback Mode)',
            status: 'DEGRADED',
            database: 'UNAVAILABLE',
            timestamp: new Date().toISOString(),
            note: 'Some features may be unavailable due to database issues',
          });
        }
        res.status(503).json({
          error: 'Service temporarily unavailable',
          message: 'Database connection issues',
        });
      });

      await fallbackApp.listen(3000, '0.0.0.0');
      console.log('✅ Fallback application started on 0.0.0.0:3000');
      console.log('⚠️  Running in degraded mode - database unavailable');
    } catch (fallbackError) {
      console.error('❌ Fallback startup also failed:', fallbackError);
      process.exit(1);
    }
  }
}

bootstrap();
