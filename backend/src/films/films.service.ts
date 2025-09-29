import { Injectable, Inject } from '@nestjs/common';
import { FilmsRepository } from '../repository/films.repository.interface';
import { FilmDto, ScheduleDto } from './dto/films.dto';

const BASE_URL = 'http://localhost:3000/content/afisha';

@Injectable()
export class FilmsService {
  constructor(
    @Inject('FilmsRepository')
    private filmsRepository: FilmsRepository,
  ) {}

  async getAllFilms(): Promise<FilmDto[]> {
    try {
      const films = await this.filmsRepository.findAll();

      // Исправляем пути image и cover
      return films.map((film) => ({
        ...film,
        image: film.image.startsWith('http')
          ? film.image
          : `${BASE_URL}${film.image}`,
        cover: film.cover.startsWith('http')
          ? film.cover
          : `${BASE_URL}${film.cover}`,
      }));
    } catch (error) {
      console.error('FilmsService error:', error);
      return [];
    }
  }

  async getFilmSchedule(id: string): Promise<ScheduleDto[]> {
    try {
      const film = await this.filmsRepository.findById(id);

      // Если нужно, можно также исправлять пути в расписании, если там есть изображения
      return film?.schedule || [];
    } catch (error) {
      console.error('Error getting film schedule:', error);
      return [];
    }
  }
}
