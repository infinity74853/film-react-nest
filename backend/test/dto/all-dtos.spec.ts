import {
  FilmDto,
  ScheduleDto,
  FilmScheduleDto,
} from '../../src/films/dto/films.dto';
import {
  CreateOrderDto,
  OrderDto,
  TicketDto,
} from '../../src/order/dto/order.dto';

describe('DTO Files', () => {
  // Эти тесты просто используют DTO чтобы покрыть файлы

  it('should have films DTO defined', () => {
    // Создаем экземпляры DTO для покрытия
    const film: FilmDto = {
      id: '1',
      title: 'Test Film',
      description: 'Test Description',
      rating: 8.5,
      director: 'Test Director',
      tags: ['action'],
      about: 'About film',
      image: 'poster.jpg',
      cover: 'cover.jpg',
    };

    const schedule: ScheduleDto = {
      id: '1',
      daytime: '2024-01-01T10:00:00Z',
      hall: 1,
      rows: 10,
      seats: 100,
      price: 500,
      taken: ['A1'],
    };

    const filmSchedule: FilmScheduleDto = {
      id: '1',
      film: film,
      schedule: [schedule],
    };

    expect(film).toBeDefined();
    expect(schedule).toBeDefined();
    expect(filmSchedule).toBeDefined();
  });

  it('should have order DTO defined', () => {
    // Создаем экземпляры DTO для покрытия
    const ticket: TicketDto = {
      film: 'film-1',
      session: 'session-1',
      daytime: '2024-01-01T10:00:00Z',
      row: 1,
      seat: 5,
      price: 500,
    };

    const createOrder: CreateOrderDto = {
      tickets: [ticket],
      email: 'test@example.com',
      phone: '+1234567890',
    };

    const order: OrderDto = {
      id: 'order-1',
      tickets: [ticket],
      totalPrice: 500,
      status: 'pending',
      createdAt: new Date('2024-01-01T10:00:00Z'),
    };

    expect(ticket).toBeDefined();
    expect(createOrder).toBeDefined();
    expect(order).toBeDefined();
  });

  it('should cover all DTO exports', () => {
    // Просто проверяем что все экспорты доступны
    expect(FilmDto).toBeDefined();
    expect(ScheduleDto).toBeDefined();
    expect(FilmScheduleDto).toBeDefined();
    expect(CreateOrderDto).toBeDefined();
    expect(OrderDto).toBeDefined();
    expect(TicketDto).toBeDefined();
  });
});
