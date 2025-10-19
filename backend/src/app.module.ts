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
        // Используем стандартные имена переменных для PostgreSQL
        const host =
          configService.get('POSTGRES_HOST') ||
          configService.get('DB_HOST') ||
          'localhost';
        const port =
          configService.get('POSTGRES_PORT') ||
          configService.get('DB_PORT') ||
          5432;
        const username =
          configService.get('POSTGRES_USERNAME') ||
          configService.get('POSTGRES_USER') ||
          configService.get('DB_USERNAME') ||
          'postgres';
        const password =
          configService.get('POSTGRES_PASSWORD') ||
          configService.get('DB_PASSWORD') ||
          'postgres';
        const database =
          configService.get('POSTGRES_DATABASE') ||
          configService.get('POSTGRES_DB') ||
          configService.get('DB_DATABASE') ||
          'postgres';
        const config = {
          type: 'postgres' as const,
          host,
          port: parseInt(port.toString()),
          username,
          password,
          database,
          entities: [TypeormFilm, Schedule, TypeormOrder],
          synchronize: true, // переключение синхронизации
          retryAttempts: 3,
          retryDelay: 1000,
        };

        return config;
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
