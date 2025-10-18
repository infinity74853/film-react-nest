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

async function bootstrap() {
  console.log('🚀 Starting Film API application...');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Health check endpoints
  app.use('/health', (req: Request, res: Response) => {
    return res.json({
      status: 'OK',
      service: 'Film API',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/health', (req: Request, res: Response) => {
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
