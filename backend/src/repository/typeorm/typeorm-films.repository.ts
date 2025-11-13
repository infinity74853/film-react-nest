import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Film } from './entities/film.entity';
import { Schedule } from './entities/schedule.entity';
import { FilmsRepository } from '../films.repository.interface';
import {
  FilmDto,
  FilmScheduleDto,
  ScheduleDto,
} from '../../films/dto/films.dto';

@Injectable()
export class TypeormFilmsRepository implements FilmsRepository {
  constructor(
    @InjectRepository(Film)
    private filmRepository: Repository<Film>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  // Метод должен возвращать ТОЛЬКО имя файла (как в MongoDB версии)
  private formatImageUrl(imagePath: string): string {
    if (!imagePath) return '';

    // Если путь уже полный - возвращаем как есть
    if (imagePath.startsWith('/')) return imagePath;

    // Если это просто имя файла - добавляем полный путь
    if (imagePath.includes('.')) {
      return `/content/afisha/${imagePath}`;
    }

    return '';
  }

  // Преобразуем строку tags в массив
  private parseTags(tagsString: string): string[] {
    if (!tagsString) return [];

    // Если tags уже в формате массива JSON
    if (tagsString.startsWith('[') && tagsString.endsWith(']')) {
      try {
        return JSON.parse(tagsString);
      } catch {
        return tagsString.split(',').map((tag) => tag.trim());
      }
    }

    // Разделяем по запятой
    return tagsString
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  // Преобразуем строку taken в массив
  private parseTaken(takenString: string): string[] {
    if (!takenString) return [];

    // Если taken уже в формате массива JSON
    if (takenString.startsWith('[') && takenString.endsWith(']')) {
      try {
        return JSON.parse(takenString);
      } catch {
        return takenString.split(',').map((item) => item.trim());
      }
    }

    // Разделяем по запятой
    return takenString
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  async findAll(): Promise<FilmDto[]> {
    try {
      const films = await this.filmRepository.find();
      const result = films.map((film) => {
        const formattedImage = this.formatImageUrl(film.image);
        const formattedCover = this.formatImageUrl(film.cover);

        return {
          id: film.id,
          rating: film.rating,
          director: film.director,
          tags: this.parseTags(film.tags), // ПРЕОБРАЗУЕМ В МАССИВ
          title: film.title,
          about: film.about,
          description: film.description,
          image: formattedImage,
          cover: formattedCover,
        };
      });

      return result;
    } catch (error) {
      console.error('PostgreSQL find error:', error);
      return [];
    }
  }

  async findById(id: string): Promise<FilmScheduleDto | null> {
    try {
      const film = await this.filmRepository.findOne({
        where: { id },
        relations: ['schedules'],
      });

      if (!film) return null;

      const filmDto: FilmDto = {
        id: film.id,
        rating: film.rating,
        director: film.director,
        tags: this.parseTags(film.tags), // ПРЕОБРАЗУЕМ В МАССИВ
        title: film.title,
        about: film.about,
        description: film.description,
        image: this.formatImageUrl(film.image),
        cover: this.formatImageUrl(film.cover),
      };

      const schedule: ScheduleDto[] = film.schedules.map(
        (session: Schedule) => ({
          id: session.id,
          daytime: session.daytime,
          hall: session.hall,
          rows: session.rows,
          seats: session.seats,
          price: session.price,
          taken: this.parseTaken(session.taken), // ПРЕОБРАЗУЕМ В МАССИВ
        }),
      );

      return {
        id: film.id,
        film: filmDto,
        schedule,
      };
    } catch (error) {
      console.error('PostgreSQL findById error:', error);
      return null;
    }
  }

  async findSchedulesByFilmId(filmId: string): Promise<ScheduleDto[]> {
    try {
      const schedules = await this.scheduleRepository.find({
        where: { filmId },
      });

      return schedules.map((schedule) => ({
        id: schedule.id,
        daytime: schedule.daytime,
        hall: schedule.hall,
        rows: schedule.rows,
        seats: schedule.seats,
        price: schedule.price,
        taken: this.parseTaken(schedule.taken), // ПРЕОБРАЗУЕМ В МАССИВ
      }));
    } catch (error) {
      console.error('PostgreSQL findSchedulesByFilmId error:', error);
      return [];
    }
  }
}
