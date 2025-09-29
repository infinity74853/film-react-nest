import { Controller, Get, Param } from '@nestjs/common';
import { FilmsService } from './films.service';
import { FilmDto, ScheduleDto } from './dto/films.dto';

@Controller('api/afisha/films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async getFilms(): Promise<{ total: number; items: FilmDto[] }> {
    try {
      const films = await this.filmsService.getAllFilms();
      return { total: films.length, items: films };
    } catch (error: unknown) {
      console.error(
        'Error getting films:',
        error instanceof Error ? error.message : error,
      );
      return { total: 0, items: [] };
    }
  }

  @Get(':id/schedule')
  async getFilmSchedule(
    @Param('id') id: string,
  ): Promise<{ total: number; items: ScheduleDto[] }> {
    try {
      const schedule = await this.filmsService.getFilmSchedule(id);
      return { total: schedule.length, items: schedule };
    } catch (error: unknown) {
      console.error(
        'Error getting schedule:',
        error instanceof Error ? error.message : error,
      );
      return { total: 0, items: [] };
    }
  }

  @Get('debug/mongo')
  async debugMongo(): Promise<
    | { success: boolean; count: number; films: FilmDto[] }
    | { success: boolean; error: string }
  > {
    try {
      const films = await this.filmsService.getAllFilms();
      return { success: true, count: films.length, films: films.slice(0, 2) };
    } catch (error: unknown) {
      console.error(
        'Debug endpoint error:',
        error instanceof Error ? error.message : error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
