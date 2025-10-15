import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { FilmsService } from './films.service';
import { FilmDto, ScheduleDto } from './dto/films.dto';

@Controller('api/afisha/films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async getFilms(): Promise<{ total: number; items: FilmDto[] }> {
    return await this.filmsService.getAllFilms();
  }

  @Get(':id/schedule')
  async getFilmSchedule(
    @Param('id') id: string,
  ): Promise<{ total: number; items: ScheduleDto[] }> {
    return await this.filmsService.getFilmSchedule(id);
  }

  // Эндпоинт-прокси для картинок
  @Get('images/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
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
