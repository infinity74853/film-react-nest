import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

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
