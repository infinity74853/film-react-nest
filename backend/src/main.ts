import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express'; // ← импортируем json

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔥 Переопределяем встроенный JSON-парсер с strict: false
  app.use(json({ strict: false }));

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(3000);
}

bootstrap();
