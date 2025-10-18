import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrapTest() {
  const app = await NestFactory.create(AppModule, {
    logger: false, // Отключаем логи для тестов
  });

  app.enableCors();

  // Простой health endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  await app.listen(3000);
  console.log('Test application started on port 3000');
  return app;
}

// Запускаем только если файл вызван напрямую
if (require.main === module) {
  bootstrapTest();
}

export { bootstrapTest };
