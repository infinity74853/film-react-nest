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
        // Используем только переменные окружения без значений по умолчанию
        const host = configService.get('POSTGRES_HOST');
        const port = configService.get('POSTGRES_PORT');
        const username =
          configService.get('POSTGRES_USERNAME') ||
          configService.get('POSTGRES_USER');
        const password = configService.get('POSTGRES_PASSWORD');
        const database =
          configService.get('POSTGRES_DATABASE') ||
          configService.get('POSTGRES_DB');

        // Для отладки выведем полученные значения
        console.log('Database configuration:', {
          host,
          port,
          username,
          database,
          passwordSet: !!password,
        });

        // Если нет обязательных переменных - используем SQLite для тестов
        if (!host || !username || !password || !database) {
          console.log('Using SQLite for tests');
          return {
            type: 'sqlite',
            database: ':memory:',
            entities: [TypeormFilm, Schedule, TypeormOrder],
            synchronize: true,
            logging: false,
          };
        }

        return {
          type: 'postgres',
          host,
          port: port ? parseInt(port.toString()) : 5432,
          username,
          password,
          database,
          entities: [TypeormFilm, Schedule, TypeormOrder],
          synchronize: true,
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
