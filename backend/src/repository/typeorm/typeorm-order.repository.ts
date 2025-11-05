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
    if (!orderData.tickets || orderData.tickets.length === 0) {
      throw new Error('No tickets provided');
    }

    const firstTicket = orderData.tickets[0];
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Используем репозиторий транзакции
      const scheduleRepository = queryRunner.manager.getRepository(Schedule);
      const schedule = await scheduleRepository.findOne({
        where: { id: firstTicket.session },
      });

      if (!schedule) {
        throw new Error(`Session not found: ${firstTicket.session}`);
      }

      // Обработка taken - теперь это строка, парсим в массив
      let currentTaken: string[] = [];

      if (schedule.taken && schedule.taken !== '[]') {
        try {
          // Пытаемся распарсить JSON строку
          const parsed = JSON.parse(schedule.taken);
          currentTaken = Array.isArray(parsed) ? parsed : [];
        } catch {
          // Если не JSON, разбиваем по запятой
          currentTaken = schedule.taken
            .split(',')
            .map((seat) => seat.trim())
            .filter((seat) => seat);
        }
      }

      // Фильтруем только валидные места формата "ряд:место"
      currentTaken = currentTaken.filter(
        (seat) => typeof seat === 'string' && /^\d+:\d+$/.test(seat),
      );

      const takenSeats = new Set(currentTaken);
      const newSeats = orderData.tickets.map(
        (ticket: TicketDto) => `${ticket.row}:${ticket.seat}`,
      );

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

      // СОЗДАЕМ ЗАКАЗ ПО НОВОЙ СТРУКТУРЕ (из SQL файлов)
      const orderRepository = queryRunner.manager.getRepository(Order);

      // Для каждого билета создаем отдельный заказ (как в старой структуре)
      // Или создаем один заказ с первым билетом (упрощенная логика)
      const firstTicketData = orderData.tickets[0];

      const newOrder = orderRepository.create({
        name: orderData.email || 'Customer', // Используем email как имя
        phone: orderData.phone || '+1234567890',
        email: orderData.email || 'user@example.com',
        tickets: orderData.tickets.length, // Количество билетов
        row: firstTicketData.row || 1,
        column: firstTicketData.seat || 1, // column = seat
        scheduleId: firstTicket.session,
        // id генерируется автоматически через uuid_generate_v4()
      });

      const savedOrder = await orderRepository.save(newOrder);

      // Обновляем занятые места в расписании
      const updatedTaken = [...currentTaken, ...newSeats];
      schedule.taken = JSON.stringify(updatedTaken); // Сохраняем как JSON строку
      await scheduleRepository.save(schedule);

      // Фиксируем транзакцию
      await queryRunner.commitTransaction();

      // Возвращаем DTO в формате ожидаемом фронтендом
      return {
        id: savedOrder.id,
        tickets: orderData.tickets.map((ticket) => ({
          film: ticket.film,
          session: ticket.session,
          daytime: ticket.daytime,
          row: ticket.row,
          seat: ticket.seat,
          price: ticket.price,
        })),
        totalPrice: totalPrice,
        status: 'pending', // В новой структуре нет статуса, но фронтенд его ожидает
        createdAt: new Date(), // В новой структуре нет createdAt, но фронтенд его ожидает
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
        relations: ['schedule'], // Загружаем связанное расписание
      });

      if (!order) return null;

      // Воссоздаем структуру билетов из данных заказа
      const ticket: TicketDto = {
        film: order.schedule?.filmId || 'unknown', // Берем filmId из расписания
        session: order.scheduleId,
        daytime: order.schedule?.daytime || new Date().toISOString(),
        row: order.row,
        seat: order.column, // column = seat в новой структуре
        price: order.schedule?.price || 0,
      };

      return {
        id: order.id,
        tickets: [ticket], // Создаем массив с одним билетом
        totalPrice: order.schedule?.price || 0,
        status: 'confirmed', // В новой структуре нет статуса, используем confirmed по умолчанию
        createdAt: new Date(), // В новой структуре нет createdAt
      };
    } catch (error) {
      console.error('Find order by id error:', error);
      throw error;
    }
  }

  async confirmOrder(id: string): Promise<OrderDto> {
    // В новой структуре нет статуса confirmed, просто возвращаем заказ
    const order = await this.findById(id);

    if (!order) {
      throw new Error('Order not found');
    }

    // Меняем статус на confirmed для фронтенда
    return {
      ...order,
      status: 'confirmed',
    };
  }
}
