import { Controller, Get, Param } from '@nestjs/common';
import { FilmsService } from './films.service';
import { ScheduleDto } from './dto/films.dto';

@Controller()
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get('films')
  async getFilms(): Promise<{ total: number; items: any[] }> {
    const result = await this.filmsService.getAllFilms();

    const filmsWithSchedule = result.items
      .filter((film) => film && film.id)
      .map((film) => ({
        ...film,
        schedule: [],
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
