import './polyfill';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  console.log('Starting Film API application...');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  app.enableCors({
    origin: true, // Разрешить все источники для тестов
    credentials: true,
  });

  // Health check middleware
  app.use('/health', (req: Request, res: Response) => {
    return res.json({ status: 'OK', service: 'Film API' });
  });

  app.use('/', (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/') {
      return res.json({
        message: 'Film API',
        status: 'OK',
        timestamp: new Date().toISOString(),
      });
    }
    next();
  });

  try {
    await app.listen(3000, '0.0.0.0');
    console.log('✅ Application successfully started on 0.0.0.0:3000');
    console.log('🚀 Film API is ready to accept requests');
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
