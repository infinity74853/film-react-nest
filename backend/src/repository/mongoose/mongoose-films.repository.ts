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

    // Убираем любые дублирования /content/afisha
    let normalizedPath = cleanedPath.replace(/^\/+/, ''); // Убираем начальные слеши

    // Если путь уже содержит content/afisha, извлекаем только конечную часть
    if (normalizedPath.includes('content/afisha/')) {
      normalizedPath = normalizedPath.split('content/afisha/').pop() || '';
    }

    // Если это полный URL, извлекаем только имя файла
    if (
      normalizedPath.startsWith('http://') ||
      normalizedPath.startsWith('https://')
    ) {
      const url = new URL(normalizedPath);
      normalizedPath =
        url.pathname.replace(/^\/+/, '').split('content/afisha/').pop() || '';
    }

    // Всегда возвращаем чистый относительный путь
    return `/content/afisha/${normalizedPath.replace(/^\/+/, '')}`;
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
