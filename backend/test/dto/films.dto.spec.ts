import {
  FilmDto,
  ScheduleDto,
  FilmScheduleDto,
} from '../../src/films/dto/films.dto';

describe('Films DTO', () => {
  describe('FilmDto', () => {
    it('should create valid FilmDto', () => {
      const film: FilmDto = {
        id: '1',
        title: 'Test Film',
        description: 'Test Description',
        rating: 8.5,
        director: 'Test Director',
        tags: ['action', 'drama'],
        about: 'About film',
        image: 'poster.jpg',
        cover: 'cover.jpg',
      };

      expect(film.id).toBe('1');
      expect(film.tags).toEqual(['action', 'drama']);
    });
  });

  describe('ScheduleDto', () => {
    it('should create valid ScheduleDto', () => {
      const schedule: ScheduleDto = {
        id: '1',
        daytime: '2024-01-01T10:00:00Z',
        hall: 1, // Исправлено: number вместо string
        rows: 10,
        seats: 100,
        price: 500,
        taken: ['A1', 'A2'],
      };

      expect(schedule.id).toBe('1');
      expect(schedule.hall).toBe(1); // Теперь number
      expect(schedule.taken).toEqual(['A1', 'A2']);
    });
  });

  describe('FilmScheduleDto', () => {
    it('should create valid FilmScheduleDto', () => {
      const filmSchedule: FilmScheduleDto = {
        id: '1',
        film: {
          id: '1',
          title: 'Test Film',
          description: 'Test Description',
          rating: 8.5,
          director: 'Test Director',
          tags: ['action'],
          about: 'About film',
          image: 'poster.jpg',
          cover: 'cover.jpg',
        },
        schedule: [
          {
            id: '1',
            daytime: '2024-01-01T10:00:00Z',
            hall: 1, // Исправлено: number вместо string
            rows: 10,
            seats: 100,
            price: 500,
            taken: ['A1'],
          },
        ],
      };

      expect(filmSchedule.id).toBe('1');
      expect(filmSchedule.film.title).toBe('Test Film');
      expect(filmSchedule.schedule).toHaveLength(1);
      expect(filmSchedule.schedule[0].hall).toBe(1); // Теперь number
    });
  });
});
