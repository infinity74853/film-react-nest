import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TypeormOrderRepository } from '../../src/repository/typeorm/typeorm-order.repository';
import { Schedule } from '../../src/repository/typeorm/entities/schedule.entity';
import { Order } from '../../src/repository/typeorm/entities/order.entity';
import { CreateOrderDto, OrderDto } from '../../src/order/dto/order.dto';

describe('TypeormOrderRepository', () => {
  let repository: TypeormOrderRepository;
  let _dataSource: DataSource;
  let _scheduleRepository: Repository<Schedule>;
  let _orderRepository: Repository<Order>;

  const mockDataSource = {
    createQueryRunner: jest.fn(),
    getRepository: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      getRepository: jest.fn(),
    },
  };

  // Создаем отдельные моки для репозиториев транзакции
  const mockTransactionScheduleRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockTransactionOrderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  // Моки для обычных репозиториев (для findById)
  const mockRegularOrderRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeormOrderRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: getRepositoryToken(Schedule),
          useValue: mockTransactionScheduleRepository,
        },
        {
          provide: getRepositoryToken(Order),
          useValue: mockRegularOrderRepository,
        },
      ],
    }).compile();

    repository = module.get<TypeormOrderRepository>(TypeormOrderRepository);
    _dataSource = module.get<DataSource>(DataSource);
    _scheduleRepository = module.get<Repository<Schedule>>(
      getRepositoryToken(Schedule),
    );
    _orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));

    // Настраиваем моки для транзакционных репозиториев
    mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
    mockQueryRunner.manager.getRepository
      .mockReturnValueOnce(mockTransactionScheduleRepository) // Для Schedule
      .mockReturnValueOnce(mockTransactionOrderRepository); // Для Order

    // Для findById используем обычный репозиторий
    mockDataSource.getRepository.mockReturnValue(mockRegularOrderRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createOrderDto: CreateOrderDto = {
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

    it('should throw error when no tickets provided', async () => {
      await expect(repository.create({ tickets: [] } as any)).rejects.toThrow(
        'No tickets provided',
      );
    });

    it('should create order successfully', async () => {
      // Мокаем успешное выполнение
      const mockSchedule = {
        id: 'session-1',
        taken: '[]',
        price: 500,
      };

      const mockOrder = {
        id: 'order-123',
        name: 'test@example.com',
        phone: '+1234567890',
        email: 'test@example.com',
        tickets: 1,
        row: 1,
        column: 5,
        scheduleId: 'session-1',
      };

      mockTransactionScheduleRepository.findOne.mockResolvedValue(mockSchedule);
      mockTransactionOrderRepository.create.mockReturnValue(mockOrder);
      mockTransactionOrderRepository.save.mockResolvedValue(mockOrder);
      mockTransactionScheduleRepository.save.mockResolvedValue(mockSchedule);

      const result = await repository.create(createOrderDto);

      expect(result).toEqual({
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
        createdAt: expect.any(Date),
      });

      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(mockTransactionOrderRepository.create).toHaveBeenCalledWith({
        name: 'test@example.com',
        phone: '+1234567890',
        email: 'test@example.com',
        tickets: 1,
        row: 1,
        column: 5,
        scheduleId: 'session-1',
      });
    });

    it('should throw error when session not found', async () => {
      mockTransactionScheduleRepository.findOne.mockResolvedValue(null);

      await expect(repository.create(createOrderDto)).rejects.toThrow(
        'Session not found: session-1',
      );
    });
  });

  describe('findById', () => {
    it('should return order by id', async () => {
      const mockOrder = {
        id: 'order-123',
        row: 1,
        column: 5,
        scheduleId: 'session-1',
        schedule: {
          filmId: 'film-1',
          daytime: '2024-01-01T10:00:00Z',
          price: 500,
        },
      };

      mockRegularOrderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await repository.findById('order-123');

      expect(result).toEqual({
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
        createdAt: expect.any(Date),
      });
    });

    it('should return null when order not found', async () => {
      mockRegularOrderRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });

    it('should handle missing schedule', async () => {
      const mockOrder = {
        id: 'order-123',
        row: 1,
        column: 5,
        scheduleId: 'session-1',
        schedule: null,
      };

      mockRegularOrderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await repository.findById('order-123');

      expect(result?.tickets[0].film).toBe('unknown');
      expect(result?.tickets[0].daytime).toBeDefined();
      expect(result?.tickets[0].price).toBe(0);
    });

    it('should throw error on database error', async () => {
      mockRegularOrderRepository.findOne.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(repository.findById('order-123')).rejects.toThrow(
        'DB error',
      );
    });
  });

  describe('confirmOrder', () => {
    it('should confirm existing order', async () => {
      const mockOrder: OrderDto = {
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

      jest.spyOn(repository, 'findById').mockResolvedValue(mockOrder);

      const result = await repository.confirmOrder('order-123');

      expect(result).toEqual({
        ...mockOrder,
        status: 'confirmed',
      });
    });

    it('should throw error when order not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(repository.confirmOrder('non-existent')).rejects.toThrow(
        'Order not found',
      );
    });
  });
});
