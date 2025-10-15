import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateOrderDto, OrderDto, TicketDto } from '../../order/dto/order.dto';
import { OrderRepository } from '../order.repository.interface';

@Injectable()
export class TypeormOrderRepository implements OrderRepository {
  constructor(private dataSource: DataSource) {}

  async create(orderData: CreateOrderDto): Promise<OrderDto> {
    if (!orderData.tickets || orderData.tickets.length === 0) {
      throw new Error('No tickets provided');
    }

    const firstTicket = orderData.tickets[0];
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Проверяем существование сеанса
      const sessionResult = await queryRunner.query(
        'SELECT taken FROM schedules WHERE id = $1 FOR UPDATE',
        [firstTicket.session],
      );

      if (!sessionResult || sessionResult.length === 0) {
        throw new Error(`Session not found: ${firstTicket.session}`);
      }

      const session = sessionResult[0];

      // Проверка занятых мест - теперь taken это массив благодаря трансформеру
      const takenArray = session.taken || [];
      const takenSeats = new Set(takenArray);

      const newSeats = orderData.tickets.map(
        (ticket: TicketDto) => `${ticket.row}:${ticket.seat}`,
      );

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

      // Создаем заказ
      const orderResult = await queryRunner.query(
        `INSERT INTO orders (tickets, email, phone, total_price, status, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, tickets, total_price as "totalPrice", status, created_at as "createdAt"`,
        [
          JSON.stringify(orderData.tickets),
          orderData.email || 'user@example.com',
          orderData.phone || '+1234567890',
          totalPrice,
          'pending',
          new Date(),
        ],
      );

      const savedOrder = orderResult[0];

      // Обновляем занятые места в сеансе - работаем с массивом
      const currentTaken: string[] = takenArray;
      const updatedTaken = [...currentTaken, ...newSeats];

      // Для PostgreSQL массива используем синтаксис массива
      await queryRunner.query('UPDATE schedules SET taken = $1 WHERE id = $2', [
        updatedTaken,
        firstTicket.session,
      ]);

      await queryRunner.commitTransaction();

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
    const result = await this.dataSource.query(
      'SELECT id, tickets, total_price as "totalPrice", status, created_at as "createdAt" FROM orders WHERE id = $1',
      [id],
    );

    return result.length > 0
      ? {
          id: result[0].id,
          tickets: result[0].tickets,
          totalPrice: Number(result[0].totalPrice),
          status: result[0].status,
          createdAt: result[0].createdAt,
        }
      : null;
  }

  async confirmOrder(id: string): Promise<OrderDto> {
    const result = await this.dataSource.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, tickets, total_price as "totalPrice", status, created_at as "createdAt"',
      ['confirmed', id],
    );

    if (result.length === 0) {
      throw new Error('Order not found');
    }

    return {
      id: result[0].id,
      tickets: result[0].tickets,
      totalPrice: Number(result[0].totalPrice),
      status: result[0].status,
      createdAt: result[0].createdAt,
    };
  }
}
