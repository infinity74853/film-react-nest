import { FilmDto, FilmScheduleDto } from '../films/dto/films.dto';

export interface FilmsRepository {
  findAll(): Promise<FilmDto[]>;
  findById(id: string): Promise<FilmScheduleDto | null>;
}
