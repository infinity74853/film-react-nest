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
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  app.use('/', (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/') {
      return res.json({
        message: 'Film API',
        status: 'OK',
      });
    }
    next();
  });

  await app.listen(3000);
}

bootstrap();
