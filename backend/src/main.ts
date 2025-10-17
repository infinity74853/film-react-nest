import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  try {
    console.log('Starting application...');
    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
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

    // Слушаем на всех интерфейсах, а не только localhost
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');

    console.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
    console.log(`📱 Local access: http://localhost:${port}`);
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
