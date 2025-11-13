import { Test, TestingModule } from '@nestjs/testing';
import { FilmsService } from '../../src/films/films.service';
import { TypeormFilmsRepository } from '../../src/repository/typeorm/typeorm-films.repository';
import { existsSync } from 'fs';

// Мокаем fs модуль
jest.mock('fs', () => ({
  existsSync: jest.fn(),
}));

const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;

describe('FilmsService', () => {
  let service: FilmsService;
  let filmsRepository: TypeormFilmsRepository;

  const mockFilmsRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findSchedulesByFilmId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmsService,
        {
          provide: 'FilmsRepository',
          useValue: mockFilmsRepository,
        },
      ],
    }).compile();

    service = module.get<FilmsService>(FilmsService);
    filmsRepository = module.get<TypeormFilmsRepository>('FilmsRepository');

    // Сбрасываем моки перед каждым тестом
    jest.clearAllMocks();
    mockExistsSync.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllFilms', () => {
    it('should return all films from repository', async () => {
      const mockFilms = [
        {
          id: '1',
          title: 'Film 1',
          description: 'Description 1',
          rating: 8.5,
          director: 'Director 1',
          tags: ['action', 'drama'],
          about: 'About film 1',
          image: 'poster1.jpg',
          cover: 'cover1.jpg',
        },
        {
          id: '2',
          title: 'Film 2',
          description: 'Description 2',
          rating: 7.8,
          director: 'Director 2',
          tags: ['comedy'],
          about: 'About film 2',
          image: 'poster2.jpg',
          cover: 'cover2.jpg',
        },
      ];
      mockFilmsRepository.findAll.mockResolvedValue(mockFilms);

      const result = await service.getAllFilms();

      expect(result).toEqual({
        total: 2,
        items: mockFilms,
      });
      expect(filmsRepository.findAll).toHaveBeenCalled();
    });

    it('should handle repository errors and return empty array', async () => {
      mockFilmsRepository.findAll.mockRejectedValue(
        new Error('Database connection failed'),
      );

      const result = await service.getAllFilms();

      expect(result).toEqual({
        total: 0,
        items: [],
      });
      expect(filmsRepository.findAll).toHaveBeenCalled();
    });

    it('should return empty array when repository returns empty', async () => {
      mockFilmsRepository.findAll.mockResolvedValue([]);

      const result = await service.getAllFilms();

      expect(result).toEqual({
        total: 0,
        items: [],
      });
    });
  });

  describe('getFilmSchedule', () => {
    it('should return film schedule when film exists', async () => {
      const mockFilmWithSchedule = {
        id: '1',
        film: {
          id: '1',
          title: 'Film 1',
          description: 'Description 1',
          rating: 8.5,
          director: 'Director 1',
          tags: ['action'],
          about: 'About film 1',
          image: 'poster1.jpg',
          cover: 'cover1.jpg',
        },
        schedule: [
          {
            id: '1',
            daytime: '2024-01-01T10:00:00Z',
            hall: 'Hall 1',
            rows: 10,
            seats: 100,
            price: 500,
            taken: ['A1', 'A2'],
          },
          {
            id: '2',
            daytime: '2024-01-01T14:00:00Z',
            hall: 'Hall 1',
            rows: 10,
            seats: 100,
            price: 500,
            taken: ['B1'],
          },
        ],
      };

      mockFilmsRepository.findById.mockResolvedValue(mockFilmWithSchedule);

      const result = await service.getFilmSchedule('1');

      expect(result).toEqual({
        total: 2,
        items: mockFilmWithSchedule.schedule,
      });
      expect(filmsRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should return empty schedule when film not found', async () => {
      mockFilmsRepository.findById.mockResolvedValue(null);

      const result = await service.getFilmSchedule('999');

      expect(result).toEqual({
        total: 0,
        items: [],
      });
    });

    it('should return empty schedule when film has no schedule', async () => {
      const mockFilmWithoutSchedule = {
        id: '1',
        film: {
          id: '1',
          title: 'Film 1',
          description: 'Description 1',
          rating: 8.5,
          director: 'Director 1',
          tags: ['action'],
          about: 'About film 1',
          image: 'poster1.jpg',
          cover: 'cover1.jpg',
        },
        schedule: [],
      };

      mockFilmsRepository.findById.mockResolvedValue(mockFilmWithoutSchedule);

      const result = await service.getFilmSchedule('1');

      expect(result).toEqual({
        total: 0,
        items: [],
      });
    });

    it('should handle repository errors and return empty schedule', async () => {
      mockFilmsRepository.findById.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.getFilmSchedule('1');

      expect(result).toEqual({
        total: 0,
        items: [],
      });
    });
  });

  describe('getImage', () => {
    it('should return image info when file exists', async () => {
      mockExistsSync.mockReturnValue(true);

      const result = await service.getImage('poster.jpg');

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        filename: 'poster.jpg',
        rootPath: expect.any(String),
      });
    });

    it('should return not found when file does not exist', async () => {
      mockExistsSync.mockReturnValue(false);

      const result = await service.getImage('nonexistent.jpg');

      expect(result).toEqual({
        success: false,
        statusCode: 404,
        message: 'Image not found',
        filename: 'nonexistent.jpg',
      });
    });

    it('should handle filesystem errors', async () => {
      mockExistsSync.mockImplementation(() => {
        throw new Error('Filesystem error');
      });

      const result = await service.getImage('error.jpg');

      expect(result).toEqual({
        success: false,
        statusCode: 500,
        message: 'Internal server error',
        error: 'Filesystem error',
        filename: 'error.jpg',
      });
    });
  });
});
