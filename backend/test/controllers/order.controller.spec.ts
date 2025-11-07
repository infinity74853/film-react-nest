import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '../../src/order/order.controller';
import { OrderService } from '../../src/order/order.service';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: OrderService;

  const mockOrderService = {
    createOrder: jest.fn(),
    confirmOrder: jest.fn(),
    getOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create a new order successfully', async () => {
      const rawOrderData = {
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

      const mockOrderResponse = {
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

      mockOrderService.createOrder.mockResolvedValue(mockOrderResponse);

      const result = await controller.createOrder(rawOrderData);

      expect(result).toEqual(mockOrderResponse);
      expect(orderService.createOrder).toHaveBeenCalledWith({
        ...rawOrderData,
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
      });
    });

    it('should handle empty tickets array', async () => {
      const rawOrderData = {
        tickets: [],
        email: 'test@example.com',
        phone: '+1234567890',
      };

      const result = await controller.createOrder(rawOrderData);

      expect(result).toEqual({
        total: 0,
        items: [],
      });
      expect(orderService.createOrder).not.toHaveBeenCalled();
    });

    it('should handle missing tickets', async () => {
      const rawOrderData = {
        email: 'test@example.com',
        phone: '+1234567890',
      };

      const result = await controller.createOrder(rawOrderData);

      expect(result).toEqual({
        total: 0,
        items: [],
      });
      expect(orderService.createOrder).not.toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      const rawOrderData = {
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

      mockOrderService.createOrder.mockRejectedValue(
        new Error('Service error'),
      );

      const result = await controller.createOrder(rawOrderData);

      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toContain('mock-order-');
    });

    it('should process tickets with missing fields', async () => {
      const rawOrderData = {
        tickets: [
          {
            film: 'film-1',
            // session missing
            // daytime missing
            row: 1,
            // seat missing
            price: 500,
          },
        ],
        email: 'test@example.com',
        phone: '+1234567890',
      };

      const mockOrderResponse = {
        total: 1,
        items: [
          {
            id: 'order-123',
            film: 'film-1',
            session: 'test-session-id',
            daytime: expect.any(String),
            row: 1,
            seat: 1,
            price: 500,
          },
        ],
      };

      mockOrderService.createOrder.mockResolvedValue(mockOrderResponse);

      const result = await controller.createOrder(rawOrderData);

      expect(result).toEqual(mockOrderResponse);
      expect(orderService.createOrder).toHaveBeenCalledWith({
        ...rawOrderData,
        tickets: [
          {
            film: 'film-1',
            session: 'test-session-id',
            daytime: expect.any(String),
            row: 1,
            seat: 1,
            price: 500,
          },
        ],
      });
    });
  });

  describe('confirmOrder', () => {
    it('should confirm an order', async () => {
      const mockOrder = {
        id: 'order-123',
        status: 'confirmed',
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

      mockOrderService.confirmOrder.mockResolvedValue(mockOrder);

      const result = await controller.confirmOrder('order-123');

      expect(result).toEqual(mockOrder);
      expect(orderService.confirmOrder).toHaveBeenCalledWith('order-123');
    });

    it('should handle confirmation errors', async () => {
      const error = new Error('Order not found');
      mockOrderService.confirmOrder.mockRejectedValue(error);

      await expect(controller.confirmOrder('invalid-id')).rejects.toThrow(
        'Order not found',
      );
    });
  });

  describe('getOrder', () => {
    it('should return an order by id', async () => {
      const mockOrder = {
        id: 'order-123',
        status: 'pending',
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

      mockOrderService.getOrder.mockResolvedValue(mockOrder);

      const result = await controller.getOrder('order-123');

      expect(result).toEqual(mockOrder);
      expect(orderService.getOrder).toHaveBeenCalledWith('order-123');
    });

    it('should handle order not found', async () => {
      const error = new Error('Order not found');
      mockOrderService.getOrder.mockRejectedValue(error);

      await expect(controller.getOrder('non-existent-id')).rejects.toThrow(
        'Order not found',
      );
    });
  });
});
