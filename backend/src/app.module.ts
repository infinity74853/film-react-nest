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
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public'),
      serveRoot: '/content/afisha',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        // Пробуем разные комбинации credentials
        const config = {
          type: 'postgres' as const,
          host: configService.get('POSTGRES_HOST') || 'localhost',
          port: parseInt(configService.get('POSTGRES_PORT') || '5432'),
          username: configService.get('POSTGRES_USERNAME') || 'postgres', // пробуем postgres
          password: configService.get('POSTGRES_PASSWORD') || 'postgres', // пробуем postgres
          database: configService.get('POSTGRES_DATABASE') || 'postgres', // пробуем postgres
          entities: [TypeormFilm, Schedule, TypeormOrder],
          synchronize: false,
          retryAttempts: 2, // Уменьшаем попытки
          retryDelay: 1000,
        };

        console.log('Trying DB config with user:', config.username);
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
