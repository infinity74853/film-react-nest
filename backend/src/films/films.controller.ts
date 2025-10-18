import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { FilmsService } from './films.service';
import { FilmDto, ScheduleDto } from './dto/films.dto';

@Controller() // Убрал префикс чтобы можно было разные пути использовать
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get('api/afisha/films')
  async getFilms(): Promise<{ total: number; items: FilmDto[] }> {
    return await this.filmsService.getAllFilms();
  }

  @Get('api/afisha/films/:id/schedule')
  async getFilmSchedule(
    @Param('id') id: string,
  ): Promise<{ total: number; items: ScheduleDto[] }> {
    // Если ID пустой или undefined, возвращаем пустой результат
    if (!id || id === 'undefined' || id === 'null') {
      return { total: 0, items: [] };
    }
    return await this.filmsService.getFilmSchedule(id);
  }

  // Для API
  @Get('api/afisha/films/images/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    return this.serveImage(filename, res);
  }

  // Для фронтенда
  @Get('content/afisha/:filename')
  async getContentImage(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    // Если filename пустой, возвращаем 404 или дефолтное изображение
    if (!filename || filename === '' || filename === 'undefined') {
      return res.status(404).json({
        message: 'Filename is required',
        statusCode: 404,
      });
    }
    return this.serveImage(filename, res);
  }

  @Get('content/afisha')
  async getContentFolder(@Res() res: Response) {
    return res.status(400).json({
      message: 'Filename is required for static content',
      statusCode: 400,
    });
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
