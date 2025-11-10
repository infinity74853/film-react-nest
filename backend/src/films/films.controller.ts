import { Controller, Get, Param } from '@nestjs/common';
import { FilmsService } from './films.service';
import { ScheduleDto, FilmDto } from './dto/films.dto';

// Создаем интерфейс для фильма с расписанием
interface FilmWithSchedule extends FilmDto {
  schedule: ScheduleDto[];
}

// Интерфейс для ответа
interface FilmsResponse {
  total: number;
  items: FilmWithSchedule[];
}

@Controller()
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get('films')
  async getFilms(): Promise<FilmsResponse> {
    const result = await this.filmsService.getAllFilms();

    const filmsWithSchedule = result.items
      .filter((film): film is FilmDto => film && typeof film.id === 'string')
      .map((film) => ({
        ...film,
        schedule: [], // Добавляем пустое расписание
      }));

    return { total: filmsWithSchedule.length, items: filmsWithSchedule };
  }

  @Get('films/:id/schedule')
  async getFilmSchedule(
    @Param('id') id: string,
  ): Promise<{ total: number; items: ScheduleDto[] }> {
    if (!id || id === '' || id === 'undefined') {
      return { total: 0, items: [] };
    }

    try {
      const result = await this.filmsService.getFilmSchedule(id);
      return result;
    } catch {
      return { total: 0, items: [] };
    }
  }
}
