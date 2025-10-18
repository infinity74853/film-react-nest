import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { FilmsService } from './films.service';
import { ScheduleDto } from './dto/films.dto';

@Controller() // Убрал префикс чтобы можно было разные пути использовать
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get('api/afisha/films')
  async getFilms(): Promise<{ total: number; items: any[] }> {
    try {
      const result = await this.filmsService.getAllFilms();

      // Убедимся, что items всегда массив
      const items = result?.items || [];

      // Добавляем пустой schedule для каждого фильма
      const filmsWithSchedule = items.map((film) => ({
        ...film,
        schedule: film.schedule || [], // используем существующий schedule или пустой массив
      }));

      return {
        total: filmsWithSchedule.length,
        items: filmsWithSchedule,
      };
    } catch (error) {
      console.error('Error getting films:', error);
      return { total: 0, items: [] };
    }
  }

  @Get('api/afisha/films/:id/schedule')
  async getFilmSchedule(
    @Param('id') id: string,
  ): Promise<{ total: number; items: ScheduleDto[] }> {
    console.log('Film schedule requested for ID:', id);

    // Если ID пустой, возвращаем пустой результат вместо 404
    if (!id || id === '' || id === 'undefined') {
      console.log('Empty ID, returning empty schedule');
      return { total: 0, items: [] };
    }

    try {
      const result = await this.filmsService.getFilmSchedule(id);
      console.log('Schedule result:', result);
      return result;
    } catch (error) {
      console.error('Error getting film schedule:', error);
      return { total: 0, items: [] };
    }
  }

  // Для API
  @Get('api/afisha/films/images/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    return this.serveImage(filename, res);
  }

  // Для фронтенда
  @Get('content/afisha/:filename?')
  async getContentImage(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    if (!filename || filename === '' || filename === 'undefined') {
      // Возвращаем дефолтное изображение
      filename = 'bg1s.jpg';
    }
    return this.serveImage(filename, res);
  }

  private async serveImage(filename: string, res: Response) {
    const result = await this.filmsService.getImage(filename);

    if (result.success && result.filename && result.rootPath) {
      return res.sendFile(result.filename, {
        root: result.rootPath,
      });
    } else {
      return res.status(result.statusCode).json({
        message: result.message,
        filename: result.filename,
        error: result.error,
      });
    }
  }
}
