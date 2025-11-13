import {
  CreateOrderDto,
  TicketDto,
  OrderDto,
} from '../../src/order/dto/order.dto';

describe('Order DTO', () => {
  describe('TicketDto', () => {
    it('should create valid TicketDto', () => {
      const ticket: TicketDto = {
        film: 'film-1',
        session: 'session-1',
        daytime: '2024-01-01T10:00:00Z',
        row: 1,
        seat: 5,
        price: 500,
      };

      expect(ticket.film).toBe('film-1');
      expect(ticket.price).toBe(500);
    });
  });

  describe('CreateOrderDto', () => {
    it('should create valid CreateOrderDto', () => {
      const order: CreateOrderDto = {
        tickets: [
          {
            film: 'film-1',
            session: 'session-1',
            daytime: '2024-01-01T10:00:00Z',
            row: 1,
            seat: 5,
            price: 500,
          },
        ],
        email: 'test@example.com',
        phone: '+1234567890',
      };

      expect(order.tickets).toHaveLength(1);
      expect(order.email).toBe('test@example.com');
    });
  });

  describe('OrderDto', () => {
    it('should create valid OrderDto', () => {
      const order: OrderDto = {
        id: 'order-123',
        tickets: [
          {
            film: 'film-1',
            session: 'session-1',
            daytime: '2024-01-01T10:00:00Z',
            row: 1,
            seat: 5,
            price: 500,
          },
        ],
        totalPrice: 500,
        status: 'pending',
        createdAt: new Date('2024-01-01T10:00:00Z'),
      };

      expect(order.id).toBe('order-123');
      expect(order.totalPrice).toBe(500);
      expect(order.status).toBe('pending');
    });
  });
});
