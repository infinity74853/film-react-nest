import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../../src/order/order.service';
import { TypeormOrderRepository } from '../../src/repository/typeorm/typeorm-order.repository';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: TypeormOrderRepository;

  const mockOrderRepository = {
    create: jest.fn(),
    confirmOrder: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: 'OrderRepository',
          useValue: mockOrderRepository,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get<TypeormOrderRepository>('OrderRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const createOrderDto = {
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

      const mockOrder = {
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
        createdAt: new Date(),
      };

      const expectedResponse = {
        total: 1,
        items: [
          {
            id: 'order-123',
            film: 'film-1',
            session: 'session-1',
            daytime: '2024-01-01T10:00:00Z',
            row: 1,
            seat: 5,
            price: 500,
          },
        ],
      };

      mockOrderRepository.create.mockResolvedValue(mockOrder);

      const result = await service.createOrder(createOrderDto);

      expect(result).toEqual(expectedResponse);
      expect(orderRepository.create).toHaveBeenCalledWith(createOrderDto);
    });

    it('should handle empty tickets array', async () => {
      const createOrderDto = {
        tickets: [],
        email: 'test@example.com',
        phone: '+1234567890',
      };

      const result = await service.createOrder(createOrderDto);

      expect(result).toEqual({
        total: 0,
        items: [],
      });
      expect(orderRepository.create).not.toHaveBeenCalled();
    });

    it('should handle missing tickets', async () => {
      const createOrderDto = {
        email: 'test@example.com',
        phone: '+1234567890',
      };

      const result = await service.createOrder(createOrderDto as any);

      expect(result).toEqual({
        total: 0,
        items: [],
      });
      expect(orderRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository errors and return mock data', async () => {
      const createOrderDto = {
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

      mockOrderRepository.create.mockRejectedValue(new Error('Database error'));

      const result = await service.createOrder(createOrderDto);

      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toContain('mock-order-');
      expect(result.items[0].film).toBe('film-1');
      expect(result.items[0].session).toBe('session-1');
    });

    it('should handle tickets with missing fields in error case', async () => {
      const createOrderDto = {
        tickets: [
          {
            film: 'film-1',
            session: 'session-1',
            daytime: '2024-01-01T10:00:00Z',
            row: 1,
            seat: 1,
            price: 500,
          },
        ],
        email: 'test@example.com',
        phone: '+1234567890',
      };

      mockOrderRepository.create.mockRejectedValue(new Error('Database error'));

      const result = await service.createOrder(createOrderDto);

      expect(result.total).toBe(1);
      expect(result.items[0].film).toBe('film-1');
      expect(result.items[0].session).toBe('session-1');
      expect(result.items[0].daytime).toBeDefined();
      expect(result.items[0].row).toBe(1);
      expect(result.items[0].seat).toBe(1);
      expect(result.items[0].price).toBe(500);
    });
  });

  describe('confirmOrder', () => {
    it('should confirm an order successfully', async () => {
      const mockOrder = {
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
        status: 'confirmed',
        createdAt: new Date(),
      };

      mockOrderRepository.confirmOrder.mockResolvedValue(mockOrder);

      const result = await service.confirmOrder('order-123');

      expect(result).toEqual(mockOrder);
      expect(orderRepository.confirmOrder).toHaveBeenCalledWith('order-123');
    });

    it('should handle confirmation errors', async () => {
      const error = new Error('Order not found');
      mockOrderRepository.confirmOrder.mockRejectedValue(error);

      await expect(service.confirmOrder('invalid-id')).rejects.toThrow(
        'Order not found',
      );
    });
  });

  describe('getOrder', () => {
    it('should return an order by id', async () => {
      const mockOrder = {
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
        createdAt: new Date(),
      };

      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      const result = await service.getOrder('order-123');

      expect(result).toEqual(mockOrder);
      expect(orderRepository.findById).toHaveBeenCalledWith('order-123');
    });

    it('should handle order not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      await expect(service.getOrder('non-existent-id')).rejects.toThrow(
        'Order not found',
      );
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockOrderRepository.findById.mockRejectedValue(error);

      await expect(service.getOrder('error-id')).rejects.toThrow(
        'Database error',
      );
    });
  });
});
