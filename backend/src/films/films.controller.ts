import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
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

  // Эндпоинт-прокси для картинок
  @Get('images/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const imagePath = join(
        process.cwd(),
        'public',
        'content',
        'afisha',
        filename,
      );

      // Проверяем существование файла
      if (!existsSync(imagePath)) {
        return res.status(404).json({
          message: 'Image not found',
          filename: filename,
        });
      }

      // Отправляем файл
      return res.sendFile(filename, {
        root: join(process.cwd(), 'public', 'content', 'afisha'),
      });
    } catch (error: unknown) {
      console.error('Error serving image:', error);
      return res.status(500).json({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
      });
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
