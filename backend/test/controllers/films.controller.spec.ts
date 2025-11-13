import { Test, TestingModule } from '@nestjs/testing';
import { FilmsController } from '../../src/films/films.controller';
import { FilmsService } from '../../src/films/films.service';

describe('FilmsController', () => {
  let controller: FilmsController;
  let filmsService: FilmsService;

  const mockFilmsService = {
    getAllFilms: jest.fn(),
    getFilmSchedule: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: mockFilmsService,
        },
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
    filmsService = module.get<FilmsService>(FilmsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getFilms', () => {
    it('should return films with schedule array', async () => {
      const mockFilmsResponse = {
        total: 2,
        items: [
          {
            id: '1',
            title: 'Film 1',
            description: 'Description 1',
            ageRestriction: '18+',
            posterUrl: '/poster1.jpg',
            duration: 120,
          },
          {
            id: '2',
            title: 'Film 2',
            description: 'Description 2',
            ageRestriction: '12+',
            posterUrl: '/poster2.jpg',
            duration: 90,
          },
        ],
      };

      mockFilmsService.getAllFilms.mockResolvedValue(mockFilmsResponse);

      const result = await controller.getFilms();

      expect(result).toEqual({
        total: 2,
        items: [
          {
            id: '1',
            title: 'Film 1',
            description: 'Description 1',
            ageRestriction: '18+',
            posterUrl: '/poster1.jpg',
            duration: 120,
            schedule: [],
          },
          {
            id: '2',
            title: 'Film 2',
            description: 'Description 2',
            ageRestriction: '12+',
            posterUrl: '/poster2.jpg',
            duration: 90,
            schedule: [],
          },
        ],
      });
      expect(filmsService.getAllFilms).toHaveBeenCalled();
    });

    it('should filter out films without id', async () => {
      const mockFilmsResponse = {
        total: 3,
        items: [
          {
            id: '1',
            title: 'Film 1',
            description: 'Description 1',
            ageRestriction: '18+',
            posterUrl: '/poster1.jpg',
            duration: 120,
          },
          {
            id: null,
            title: 'Film without ID',
            description: 'Description',
            ageRestriction: '12+',
            posterUrl: '/poster2.jpg',
            duration: 90,
          },
          {
            id: '2',
            title: 'Film 2',
            description: 'Description 2',
            ageRestriction: '16+',
            posterUrl: '/poster3.jpg',
            duration: 110,
          },
        ],
      };

      mockFilmsService.getAllFilms.mockResolvedValue(mockFilmsResponse);

      const result = await controller.getFilms();

      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].id).toBe('1');
      expect(result.items[1].id).toBe('2');
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockFilmsService.getAllFilms.mockRejectedValue(error);

      await expect(controller.getFilms()).rejects.toThrow('Database error');
    });
  });

  describe('getFilmSchedule', () => {
    it('should return film schedule', async () => {
      const mockScheduleResponse = {
        total: 2,
        items: [
          {
            id: '1',
            time: '10:00',
            date: '2024-01-01',
            price: 500,
            availableSeats: 50,
          },
          {
            id: '2',
            time: '14:00',
            date: '2024-01-01',
            price: 500,
            availableSeats: 30,
          },
        ],
      };

      mockFilmsService.getFilmSchedule.mockResolvedValue(mockScheduleResponse);

      const result = await controller.getFilmSchedule('1');

      expect(result).toEqual(mockScheduleResponse);
      expect(filmsService.getFilmSchedule).toHaveBeenCalledWith('1');
    });

    it('should handle invalid id', async () => {
      const result = await controller.getFilmSchedule('undefined');

      expect(result).toEqual({ total: 0, items: [] });
    });

    it('should handle empty id', async () => {
      const result = await controller.getFilmSchedule('');

      expect(result).toEqual({ total: 0, items: [] });
    });

    it('should handle service errors gracefully', async () => {
      mockFilmsService.getFilmSchedule.mockRejectedValue(
        new Error('Service error'),
      );

      const result = await controller.getFilmSchedule('1');

      expect(result).toEqual({ total: 0, items: [] });
    });
  });
});
