import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { JsonFixMiddleware } from './json-fix.middleware';
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
        // ТОЛЬКО переменные окружения
        const host = configService.get('POSTGRES_HOST');
        const port = configService.get('POSTGRES_PORT');
        const username = configService.get('POSTGRES_USERNAME');
        const password = configService.get('POSTGRES_PASSWORD');
        const database = configService.get('POSTGRES_DATABASE');

        console.log('Database config from env:', {
          host,
          port,
          username,
          database,
        });

        return {
          type: 'postgres',
          host: host || 'localhost',
          port: port ? parseInt(port) : 5432,
          username: username || 'postgres',
          password: password || 'postgres',
          database: database || 'postgres',
          entities: [TypeormFilm, Schedule, TypeormOrder],
          synchronize: true,
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JsonFixMiddleware).forRoutes('api/afisha/order');
  }
}
