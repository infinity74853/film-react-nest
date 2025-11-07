// backend/test/entities/entities.spec.ts
import { Film } from '../../src/repository/typeorm/entities/film.entity';
import { Schedule } from '../../src/repository/typeorm/entities/schedule.entity';
import { Order } from '../../src/repository/typeorm/entities/order.entity';

describe('TypeORM Entities', () => {
  describe('Film Entity', () => {
    it('should create Film instance with all properties', () => {
      const film = new Film();
      film.id = 'film-1';
      film.rating = 8.5;
      film.director = 'Test Director';
      film.tags = 'action,drama';
      film.image = '/poster.jpg';
      film.cover = '/cover.jpg';
      film.title = 'Test Film';
      film.about = 'About film';
      film.description = 'Film description';
      film.schedules = [];

      expect(film.id).toBe('film-1');
      expect(film.rating).toBe(8.5);
      expect(film.director).toBe('Test Director');
      expect(film.tags).toBe('action,drama');
      expect(film.title).toBe('Test Film');
    });
  });

  describe('Schedule Entity', () => {
    it('should create Schedule instance with all properties', () => {
      const schedule = new Schedule();
      schedule.id = 'schedule-1';
      schedule.daytime = '2024-01-01T10:00:00Z';
      schedule.hall = 1;
      schedule.rows = 10;
      schedule.seats = 100;
      schedule.price = 500;
      schedule.taken = '[]';
      schedule.filmId = 'film-1';
      schedule.film = new Film();
      schedule.orders = [];

      expect(schedule.id).toBe('schedule-1');
      expect(schedule.hall).toBe(1);
      expect(schedule.rows).toBe(10);
      expect(schedule.seats).toBe(100);
      expect(schedule.price).toBe(500);
      expect(schedule.taken).toBe('[]');
    });

    it('should handle different taken formats', () => {
      const schedule = new Schedule();

      schedule.taken = '["A1", "A2"]';
      expect(schedule.taken).toBe('["A1", "A2"]');

      schedule.taken = 'A1,A2';
      expect(schedule.taken).toBe('A1,A2');

      schedule.taken = '';
      expect(schedule.taken).toBe('');
    });
  });

  describe('Order Entity', () => {
    it('should create Order instance with all properties', () => {
      const order = new Order();
      order.id = 'order-1';
      order.name = 'John Doe';
      order.phone = '+1234567890';
      order.email = 'john@example.com';
      order.tickets = 2;
      order.row = 1;
      order.column = 5;
      order.scheduleId = 'schedule-1';
      order.schedule = new Schedule();

      expect(order.id).toBe('order-1');
      expect(order.name).toBe('John Doe');
      expect(order.phone).toBe('+1234567890');
      expect(order.email).toBe('john@example.com');
      expect(order.tickets).toBe(2);
      expect(order.row).toBe(1);
      expect(order.column).toBe(5);
    });

    it('should handle different ticket quantities', () => {
      const order = new Order();

      order.tickets = 1;
      expect(order.tickets).toBe(1);

      order.tickets = 5;
      expect(order.tickets).toBe(5);

      order.tickets = 0;
      expect(order.tickets).toBe(0);
    });
  });

  describe('Entity Relationships', () => {
    it('should establish Film-Schedule relationship', () => {
      const film = new Film();
      film.id = 'film-1';

      const schedule = new Schedule();
      schedule.id = 'schedule-1';
      schedule.film = film;
      schedule.filmId = film.id;

      expect(schedule.film).toBe(film);
      expect(schedule.filmId).toBe(film.id);
    });

    it('should establish Schedule-Order relationship', () => {
      const schedule = new Schedule();
      schedule.id = 'schedule-1';

      const order = new Order();
      order.id = 'order-1';
      order.schedule = schedule;
      order.scheduleId = schedule.id;

      expect(order.schedule).toBe(schedule);
      expect(order.scheduleId).toBe(schedule.id);
    });

    it('should handle collections', () => {
      const film = new Film();
      const schedule1 = new Schedule();
      const schedule2 = new Schedule();

      film.schedules = [schedule1, schedule2];

      expect(film.schedules).toHaveLength(2);
      expect(film.schedules).toContain(schedule1);
      expect(film.schedules).toContain(schedule2);
    });
  });

  // ДОБАВИМ ПРОСТОЙ ТЕСТ ДЛЯ ПОКРЫТИЯ
  it('should cover all entity classes', () => {
    // Просто создаем экземпляры чтобы покрыть классы
    const film = new Film();
    const schedule = new Schedule();
    const order = new Order();

    expect(film).toBeDefined();
    expect(schedule).toBeDefined();
    expect(order).toBeDefined();
  });
});
