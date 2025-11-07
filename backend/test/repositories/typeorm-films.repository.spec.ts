import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeormFilmsRepository } from '../../src/repository/typeorm/typeorm-films.repository';
import { Film } from '../../src/repository/typeorm/entities/film.entity';
import { Schedule } from '../../src/repository/typeorm/entities/schedule.entity';

describe('TypeormFilmsRepository', () => {
  let repository: TypeormFilmsRepository;
  let filmRepo: Repository<Film>;
  let scheduleRepo: Repository<Schedule>;

  const mockFilmRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockScheduleRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeormFilmsRepository,
        {
          provide: getRepositoryToken(Film),
          useValue: mockFilmRepository,
        },
        {
          provide: getRepositoryToken(Schedule),
          useValue: mockScheduleRepository,
        },
      ],
    }).compile();

    repository = module.get<TypeormFilmsRepository>(TypeormFilmsRepository);
    filmRepo = module.get<Repository<Film>>(getRepositoryToken(Film));
    scheduleRepo = module.get<Repository<Schedule>>(
      getRepositoryToken(Schedule),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all films with formatted data', async () => {
      const mockFilms = [
        {
          id: '1',
          title: 'Film 1',
          description: 'Description 1',
          rating: 8.5,
          director: 'Director 1',
          tags: 'action,drama',
          about: 'About film 1',
          image: '/images/poster1.jpg',
          cover: '/images/cover1.jpg',
        },
        {
          id: '2',
          title: 'Film 2',
          description: 'Description 2',
          rating: 7.8,
          director: 'Director 2',
          tags: 'comedy',
          about: 'About film 2',
          image: '/images/poster2.jpg',
          cover: '/images/cover2.jpg',
        },
      ];

      mockFilmRepository.find.mockResolvedValue(mockFilms);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[0].tags).toEqual(['action', 'drama']);
      expect(result[0].image).toBe('poster1.jpg');
      expect(result[0].cover).toBe('cover1.jpg');
      expect(result[1].tags).toEqual(['comedy']);
      expect(filmRepo.find).toHaveBeenCalled();
    });

    it('should handle empty result', async () => {
      mockFilmRepository.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('should handle database errors and return empty array', async () => {
      mockFilmRepository.find.mockRejectedValue(new Error('Database error'));

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('should handle films with empty image paths', async () => {
      const mockFilms = [
        {
          id: '1',
          title: 'Film 1',
          description: 'Description 1',
          rating: 8.5,
          director: 'Director 1',
          tags: 'action',
          about: 'About film 1',
          image: '',
          cover: null,
        },
      ];

      mockFilmRepository.find.mockResolvedValue(mockFilms);

      const result = await repository.findAll();

      expect(result[0].image).toBe('');
      expect(result[0].cover).toBe('');
    });
  });

  describe('findById', () => {
    it('should return film with schedule when film exists', async () => {
      const mockFilm = {
        id: '1',
        title: 'Film 1',
        description: 'Description 1',
        rating: 8.5,
        director: 'Director 1',
        tags: 'action,drama',
        about: 'About film 1',
        image: '/images/poster1.jpg',
        cover: '/images/cover1.jpg',
        schedules: [
          {
            id: 'schedule-1',
            daytime: '2024-01-01T10:00:00Z',
            hall: 1,
            rows: 10,
            seats: 100,
            price: 500,
            taken: 'A1,A2',
          },
        ],
      };

      mockFilmRepository.findOne.mockResolvedValue(mockFilm);

      const result = await repository.findById('1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
      expect(result?.film.title).toBe('Film 1');
      expect(result?.film.tags).toEqual(['action', 'drama']);
      expect(result?.schedule).toHaveLength(1);
      expect(result?.schedule[0].taken).toEqual(['A1', 'A2']);
      expect(filmRepo.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['schedules'],
      });
    });

    it('should return null when film not found', async () => {
      mockFilmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });

    it('should handle database errors and return null', async () => {
      mockFilmRepository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await repository.findById('1');

      expect(result).toBeNull();
    });

    it('should handle film without schedules', async () => {
      const mockFilm = {
        id: '1',
        title: 'Film 1',
        description: 'Description 1',
        rating: 8.5,
        director: 'Director 1',
        tags: 'action',
        about: 'About film 1',
        image: '/images/poster1.jpg',
        cover: '/images/cover1.jpg',
        schedules: [],
      };

      mockFilmRepository.findOne.mockResolvedValue(mockFilm);

      const result = await repository.findById('1');

      expect(result?.schedule).toEqual([]);
    });

    it('should handle JSON array tags', async () => {
      const mockFilm = {
        id: '1',
        title: 'Film 1',
        description: 'Description 1',
        rating: 8.5,
        director: 'Director 1',
        tags: '["action","drama","comedy"]',
        about: 'About film 1',
        image: '/images/poster1.jpg',
        cover: '/images/cover1.jpg',
        schedules: [],
      };

      mockFilmRepository.findOne.mockResolvedValue(mockFilm);

      const result = await repository.findById('1');

      expect(result?.film.tags).toEqual(['action', 'drama', 'comedy']);
    });
  });

  describe('findSchedulesByFilmId', () => {
    it('should return schedules for film', async () => {
      const mockSchedules = [
        {
          id: 'schedule-1',
          daytime: '2024-01-01T10:00:00Z',
          hall: 1,
          rows: 10,
          seats: 100,
          price: 500,
          taken: 'A1,A2',
        },
        {
          id: 'schedule-2',
          daytime: '2024-01-01T14:00:00Z',
          hall: 2,
          rows: 8,
          seats: 80,
          price: 600,
          taken: 'B1,B2,B3',
        },
      ];

      mockScheduleRepository.find.mockResolvedValue(mockSchedules);

      const result = await repository.findSchedulesByFilmId('1');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('schedule-1');
      expect(result[0].taken).toEqual(['A1', 'A2']);
      expect(result[1].taken).toEqual(['B1', 'B2', 'B3']);
      expect(scheduleRepo.find).toHaveBeenCalledWith({
        where: { filmId: '1' },
      });
    });

    it('should return empty array when no schedules found', async () => {
      mockScheduleRepository.find.mockResolvedValue([]);

      const result = await repository.findSchedulesByFilmId('999');

      expect(result).toEqual([]);
    });

    it('should handle database errors and return empty array', async () => {
      mockScheduleRepository.find.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await repository.findSchedulesByFilmId('1');

      expect(result).toEqual([]);
    });
  });

  describe('formatImageUrl', () => {
    it('should extract filename from path', () => {
      const result = (repository as any).formatImageUrl('/images/poster.jpg');
      expect(result).toBe('poster.jpg');
    });

    it('should return empty string for invalid path', () => {
      const result = (repository as any).formatImageUrl('');
      expect(result).toBe('');
    });

    it('should return empty string for path without extension', () => {
      const result = (repository as any).formatImageUrl('/images/poster');
      expect(result).toBe('');
    });

    it('should handle filename without path', () => {
      const result = (repository as any).formatImageUrl('poster.jpg');
      expect(result).toBe('poster.jpg');
    });
  });

  describe('parseTags', () => {
    it('should parse comma-separated tags', () => {
      const result = (repository as any).parseTags('action,drama,comedy');
      expect(result).toEqual(['action', 'drama', 'comedy']);
    });

    it('should parse JSON array tags', () => {
      const result = (repository as any).parseTags('["action","drama"]');
      expect(result).toEqual(['action', 'drama']);
    });

    it('should handle malformed JSON and fallback to comma separation', () => {
      const result = (repository as any).parseTags('["action,drama"]');
      expect(result).toEqual(['action,drama']);
    });

    it('should return empty array for empty input', () => {
      const result = (repository as any).parseTags('');
      expect(result).toEqual([]);
    });

    it('should trim whitespace from tags', () => {
      const result = (repository as any).parseTags(' action , drama , comedy ');
      expect(result).toEqual(['action', 'drama', 'comedy']);
    });

    it('should filter out empty tags', () => {
      const result = (repository as any).parseTags('action,,drama,');
      expect(result).toEqual(['action', 'drama']);
    });
  });

  describe('parseTaken', () => {
    it('should parse comma-separated taken seats', () => {
      const result = (repository as any).parseTaken('A1,A2,B1');
      expect(result).toEqual(['A1', 'A2', 'B1']);
    });

    it('should parse JSON array taken seats', () => {
      const result = (repository as any).parseTaken('["A1","A2"]');
      expect(result).toEqual(['A1', 'A2']);
    });

    it('should handle malformed JSON and fallback to comma separation', () => {
      const result = (repository as any).parseTaken('["A1,A2"]');
      expect(result).toEqual(['A1,A2']);
    });

    it('should return empty array for empty input', () => {
      const result = (repository as any).parseTaken('');
      expect(result).toEqual([]);
    });

    it('should trim whitespace from taken seats', () => {
      const result = (repository as any).parseTaken(' A1 , A2 , B1 ');
      expect(result).toEqual(['A1', 'A2', 'B1']);
    });

    it('should filter out empty taken seats', () => {
      const result = (repository as any).parseTaken('A1,,A2,');
      expect(result).toEqual(['A1', 'A2']);
    });
  });
});
