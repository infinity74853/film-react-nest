import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';
import { JsonParseExceptionFilter } from './filters/json-parse-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // Подключаем глобальный фильтр исключений
  app.useGlobalFilters(new JsonParseExceptionFilter());

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
