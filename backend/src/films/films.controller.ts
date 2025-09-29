import { Controller, Get, Param } from '@nestjs/common';
import { FilmsService } from './films.service';
import { FilmDto, ScheduleDto } from './dto/films.dto';

const BASE_URL = 'http://localhost:3000/content/afisha';

@Controller('api/afisha/films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async getFilms(): Promise<{
    total: number;
    items: FilmDto[];
  }> {
    try {
      const films = await this.filmsService.getAllFilms();

      // Исправляем пути image и cover
      const processedFilms = films.map((film) => ({
        ...film,
        image: film.image.startsWith('http')
          ? film.image
          : `${BASE_URL}${film.image}`,
        cover: film.cover.startsWith('http')
          ? film.cover
          : `${BASE_URL}${film.cover}`,
      }));

      return {
        total: processedFilms.length,
        items: processedFilms,
      };
    } catch (error: unknown) {
      console.error(
        'Error getting films:',
        error instanceof Error ? error.message : error,
      );
      return {
        total: 0,
        items: [],
      };
    }
  }

  @Get(':id/schedule')
  async getFilmSchedule(@Param('id') id: string): Promise<{
    total: number;
    items: ScheduleDto[];
  }> {
    try {
      const schedule = await this.filmsService.getFilmSchedule(id);
      return {
        total: schedule ? schedule.length : 0,
        items: schedule || [],
      };
    } catch (error: unknown) {
      console.error(
        'Error getting schedule:',
        error instanceof Error ? error.message : error,
      );
      return {
        total: 0,
        items: [],
      };
    }
  }

  @Get('debug/mongo')
  async debugMongo(): Promise<
    | {
        success: boolean;
        count: number;
        films: FilmDto[];
      }
    | {
        success: boolean;
        error: string;
      }
  > {
    try {
      const films = await this.filmsService.getAllFilms();
      const processedFilms = films.map((film) => ({
        ...film,
        image: film.image.startsWith('http')
          ? film.image
          : `${BASE_URL}${film.image}`,
        cover: film.cover.startsWith('http')
          ? film.cover
          : `${BASE_URL}${film.cover}`,
      }));

      return {
        success: true,
        count: films.length,
        films: processedFilms.slice(0, 2),
      };
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
