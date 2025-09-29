import { Injectable, Inject } from '@nestjs/common';
import { FilmsRepository } from '../repository/films.repository.interface';
import { FilmDto, ScheduleDto } from './dto/films.dto';

@Injectable()
export class FilmsService {
  constructor(
    @Inject('FilmsRepository')
    private filmsRepository: FilmsRepository,
  ) {}

  async getAllFilms(): Promise<FilmDto[]> {
    try {
      // Возвращаем как есть — только относительные пути
      return await this.filmsRepository.findAll();
    } catch (error) {
      console.error('FilmsService error:', error);
      return [];
    }
  }

  async getFilmSchedule(id: string): Promise<ScheduleDto[]> {
    try {
      const film = await this.filmsRepository.findById(id);
      return film?.schedule || [];
    } catch (error) {
      console.error('Error getting film schedule:', error);
      return [];
    }
  }
}
