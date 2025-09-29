import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film, FilmDocument } from './schemas/film.schema';
import { FilmsRepository } from '../films.repository.interface';
import {
  FilmDto,
  FilmScheduleDto,
  ScheduleDto,
} from '../../films/dto/films.dto';

@Injectable()
export class MongooseFilmsRepository implements FilmsRepository {
  constructor(@InjectModel(Film.name) private filmModel: Model<FilmDocument>) {}

  private readonly apiUrl = process.env.API_URL || 'http://localhost:3000';

  private formatImageUrl(imagePath: string): string {
    if (!imagePath) return '';

    const cleanedPath = imagePath.trim();
    const filename = cleanedPath.split('/').pop() || ''; // достаём только имя файла
    const relativePath = `/content/afisha/${filename}`;

    // В тестах всегда отдаём относительный путь
    if (process.env.NODE_ENV === 'test') {
      return relativePath;
    }

    // В dev/prod — полный URL для браузера
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    return `${baseUrl}${relativePath}`;
  }

  async findAll(): Promise<FilmDto[]> {
    try {
      const films = await this.filmModel.find().exec();
      return films.map((film) => ({
        id: film.id,
        rating: film.rating,
        director: film.director,
        tags: film.tags,
        title: film.title,
        about: film.about,
        description: film.description,
        image: this.formatImageUrl(film.image),
        cover: this.formatImageUrl(film.cover),
      }));
    } catch (error) {
      console.error('MongoDB find error:', error);
      return [];
    }
  }

  async findById(id: string): Promise<FilmScheduleDto | null> {
    try {
      const film = await this.filmModel.findOne({ id }).exec();
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

      const schedule: ScheduleDto[] = film.schedule.map((session) => ({
        id: session.id,
        daytime: session.daytime,
        hall: session.hall,
        rows: session.rows,
        seats: session.seats,
        price: session.price,
        taken: session.taken,
      }));

      return {
        id: film.id,
        film: filmDto,
        schedule,
      };
    } catch (error) {
      console.error('MongoDB findById error:', error);
      return null;
    }
  }
}
