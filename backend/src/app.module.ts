import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { FilmsController } from './films/films.controller';
import { OrderController } from './order/order.controller';
import { FilmsService } from './films/films.service';
import { OrderService } from './order/order.service';

// TypeORM сущности и репозитории
import { Film as TypeormFilm } from './repository/typeorm/entities/film.entity';
import { Schedule } from './repository/typeorm/entities/schedule.entity';
import { Order as TypeormOrder } from './repository/typeorm/entities/order.entity';
import { TypeormFilmsRepository } from './repository/typeorm/typeorm-films.repository';
import { TypeormOrderRepository } from './repository/typeorm/typeorm-order.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public'),
      serveRoot: '/content/afisha',
      exclude: ['/api/*'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Используем ТОЛЬКО переменные окружения без значений по умолчанию
        const host = configService.get('POSTGRES_HOST');
        const port = configService.get('POSTGRES_PORT');
        const username = configService.get('POSTGRES_USERNAME');
        const password = configService.get('POSTGRES_PASSWORD');
        const database = configService.get('POSTGRES_DATABASE');

        // Проверяем, что все переменные есть
        if (!host || !port || !username || !password || !database) {
          throw new Error('Missing required database environment variables');
        }

        return {
          type: 'postgres',
          host,
          port: parseInt(port),
          username,
          password,
          database,
          entities: [TypeormFilm, Schedule, TypeormOrder],
          synchronize: false,
          retryAttempts: 3,
          retryDelay: 1000,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([TypeormFilm, Schedule, TypeormOrder]),
  ],
  controllers: [AppController, FilmsController, OrderController],
  providers: [
    AppService,
    FilmsService,
    OrderService,
    TypeormFilmsRepository,
    TypeormOrderRepository,
    {
      provide: 'FilmsRepository',
      useClass: TypeormFilmsRepository,
    },
    {
      provide: 'OrderRepository',
      useClass: TypeormOrderRepository,
    },
  ],
})
export class AppModule {}
