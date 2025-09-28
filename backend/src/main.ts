import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware для исправления статики ДО ServeStaticModule
  app.use(
    '/content/afisha',
    (req: { url: string }, res: any, next: () => void) => {
      const url = req.url;

      if (url.includes('http://localhost:3000/content/afisha/')) {
        const filename = url.split('/content/afisha/').pop();
        if (filename && filename.match(/bg\d+[sc]\.jpg/)) {
          req.url = `/content/afisha/${filename}`;
          console.log('Fixed static URL:', req.url);
        }
      }

      next();
    },
  );

  app.setGlobalPrefix('api/afisha');
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // Остальной ваш код...
  app.use(
    '/',
    (
      req: { path: string },
      res: { json: (arg0: { message: string; status: string }) => any },
      next: () => void,
    ) => {
      if (req.path === '/') {
        return res.json({
          message: 'Film API',
          status: 'OK',
        });
      }
      next();
    },
  );

  await app.listen(3000);
}
bootstrap();
