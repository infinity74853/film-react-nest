import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { AppController } from './app.controller';

import { FilmsController } from './films/films.controller';
import { OrderController } from './order/order.controller';
import { StaticController } from './static/static.controller';
import { FilmsService } from './films/films.service';
import { OrderService } from './order/order.service';

// Memory репозитории
import { MemoryFilmsRepository } from './repository/memory-films.repository';
import { MemoryOrderRepository } from './repository/memory-order.repository';

// MongoDB схемы и репозитории
import { Film, FilmSchema } from './repository/mongoose/schemas/film.schema';
import { Order, OrderSchema } from './repository/mongoose/schemas/order.schema';
import { MongooseFilmsRepository } from './repository/mongoose/mongoose-films.repository';
import { MongooseOrderRepository } from './repository/mongoose/mongoose-order.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', '..', 'public'),
      serveRoot: '/content',
    }),
    MongooseModule.forRoot(
      process.env.DATABASE_URL || 'mongodb://localhost:27017/practicum',
    ),
    MongooseModule.forFeature([{ name: Film.name, schema: FilmSchema }]),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
  ],
  controllers: [
    AppController,
    FilmsController,
    OrderController,
    StaticController,
  ],
  providers: [
    FilmsService,
    OrderService,
    MemoryFilmsRepository,
    MemoryOrderRepository,
    MongooseFilmsRepository,
    MongooseOrderRepository,
    {
      provide: 'FilmsRepository',
      useFactory: (
        memoryRepo: MemoryFilmsRepository,
        mongoRepo: MongooseFilmsRepository,
      ) => {
        return process.env.DATABASE_DRIVER === 'mongodb'
          ? mongoRepo
          : memoryRepo;
      },
      inject: [MemoryFilmsRepository, MongooseFilmsRepository],
    },
    {
      provide: 'OrderRepository',
      useFactory: (
        memoryRepo: MemoryOrderRepository,
        mongoRepo: MongooseOrderRepository,
      ) => {
        return process.env.DATABASE_DRIVER === 'mongodb'
          ? mongoRepo
          : memoryRepo;
      },
      inject: [MemoryOrderRepository, MongooseOrderRepository],
    },
  ],
})
export class AppModule {}
