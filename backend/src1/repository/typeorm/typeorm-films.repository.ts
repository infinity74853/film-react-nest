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

    // Более надежная обработка путей
    const filename = imagePath.split('/').pop() || imagePath;
    return filename.includes('.') ? filename : '';
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
          tags: film.tags,
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
        tags: film.tags,
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
          taken: session.taken,
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
}
