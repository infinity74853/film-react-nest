import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateOrderDto, OrderDto, TicketDto } from '../../order/dto/order.dto';
import { OrderRepository } from '../order.repository.interface';
import { Schedule } from './entities/schedule.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class TypeormOrderRepository implements OrderRepository {
  constructor(private dataSource: DataSource) {}

  async create(orderData: CreateOrderDto): Promise<OrderDto> {
    console.log('Received order data:', JSON.stringify(orderData, null, 2));

    if (!orderData.tickets || orderData.tickets.length === 0) {
      throw new Error('No tickets provided');
    }

    const firstTicket = orderData.tickets[0];
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('Starting order creation for session:', firstTicket.session);

      // Используем репозиторий транзакции
      const scheduleRepository = queryRunner.manager.getRepository(Schedule);
      const schedule = await scheduleRepository.findOne({
        where: { id: firstTicket.session },
      });

      if (!schedule) {
        throw new Error(`Session not found: ${firstTicket.session}`);
      }

      console.log('Found schedule:', {
        id: schedule.id,
        filmId: schedule.filmId,
        hall: schedule.hall,
        daytime: schedule.daytime,
        taken: schedule.taken,
      });

      // Обработка taken - безопасно преобразуем в массив
      let currentTaken: string[] = [];

      if (Array.isArray(schedule.taken)) {
        currentTaken = schedule.taken;
      } else if (typeof schedule.taken === 'string') {
        // Если это строка, пытаемся распарсить
        try {
          const parsed = JSON.parse(schedule.taken);
          currentTaken = Array.isArray(parsed) ? parsed : [];
        } catch {
          currentTaken = [];
        }
      }

      // Фильтруем только валидные места формата "ряд:место"
      currentTaken = currentTaken.filter(
        (seat) => typeof seat === 'string' && /^\d+:\d+$/.test(seat),
      );

      console.log('Processed taken seats:', currentTaken);

      const takenSeats = new Set(currentTaken);
      const newSeats = orderData.tickets.map(
        (ticket: TicketDto) => `${ticket.row}:${ticket.seat}`,
      );

      console.log('Requested seats:', newSeats);

      // Проверяем, не заняты ли места
      for (const seat of newSeats) {
        if (takenSeats.has(seat)) {
          throw new Error(`Seat ${seat} is already taken`);
        }
      }

      // Расчет общей стоимости
      const totalPrice = orderData.tickets.reduce(
        (sum: number, ticket: TicketDto) => sum + ticket.price,
        0,
      );

      console.log('Total price:', totalPrice);

      // Создаем заказ через TypeORM
      const orderRepository = queryRunner.manager.getRepository(Order);
      const newOrder = orderRepository.create({
        tickets: orderData.tickets,
        email: orderData.email || 'user@example.com',
        phone: orderData.phone || '+1234567890',
        totalPrice: totalPrice,
        status: 'pending' as const,
        createdAt: new Date(),
      });

      console.log('Creating order...');
      const savedOrder = await orderRepository.save(newOrder);
      console.log('Order created:', savedOrder.id);

      // Обновляем занятые места
      const updatedTaken = [...currentTaken, ...newSeats];
      console.log('Updating schedule with taken seats:', updatedTaken);

      // Обновляем через TypeORM
      schedule.taken = updatedTaken;
      await scheduleRepository.save(schedule);

      console.log('Schedule updated successfully');

      await queryRunner.commitTransaction();
      console.log('Transaction committed successfully');

      return {
        id: savedOrder.id,
        tickets: savedOrder.tickets,
        totalPrice: Number(savedOrder.totalPrice),
        status: savedOrder.status,
        createdAt: savedOrder.createdAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Order creation error:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findById(id: string): Promise<OrderDto | null> {
    try {
      const orderRepository = this.dataSource.getRepository(Order);
      const order = await orderRepository.findOne({
        where: { id },
      });

      if (!order) return null;

      return {
        id: order.id,
        tickets: order.tickets,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt,
      };
    } catch (error) {
      console.error('Find order by id error:', error);
      throw error;
    }
  }

  async confirmOrder(id: string): Promise<OrderDto> {
    const orderRepository = this.dataSource.getRepository(Order);
    const order = await orderRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Обновляем статус заказа
    order.status = 'confirmed';
    const updatedOrder = await orderRepository.save(order);

    return {
      id: updatedOrder.id,
      tickets: updatedOrder.tickets,
      totalPrice: updatedOrder.totalPrice,
      status: updatedOrder.status,
      createdAt: updatedOrder.createdAt,
    };
  }
}
