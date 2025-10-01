import { Injectable, Inject } from '@nestjs/common';
import { join } from 'path';
import { existsSync } from 'fs';
import { FilmsRepository } from '../repository/films.repository.interface';
import { FilmDto, ScheduleDto } from './dto/films.dto';

interface ImageResponse {
  success: boolean;
  statusCode: number;
  message?: string;
  filename?: string;
  rootPath?: string;
  error?: string;
}

@Injectable()
export class FilmsService {
  constructor(
    @Inject('FilmsRepository')
    private filmsRepository: FilmsRepository,
  ) {}

  async getAllFilms(): Promise<{ total: number; items: FilmDto[] }> {
    try {
      const films = await this.filmsRepository.findAll();
      return { total: films.length, items: films };
    } catch (error: unknown) {
      console.error(
        'FilmsService error:',
        error instanceof Error ? error.message : error,
      );
      return { total: 0, items: [] };
    }
  }

  async getFilmSchedule(
    id: string,
  ): Promise<{ total: number; items: ScheduleDto[] }> {
    try {
      const film = await this.filmsRepository.findById(id);
      const schedule = film?.schedule || [];
      return { total: schedule.length, items: schedule };
    } catch (error: unknown) {
      console.error('Error getting film schedule:', error);
      return { total: 0, items: [] };
    }
  }

  async getImage(filename: string): Promise<ImageResponse> {
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
        return {
          success: false,
          statusCode: 404,
          message: 'Image not found',
          filename: filename,
        };
      }

      return {
        success: true,
        statusCode: 200,
        filename: filename,
        rootPath: join(process.cwd(), 'public', 'content', 'afisha'),
      };
    } catch (error: unknown) {
      console.error('Error serving image:', error);
      return {
        success: false,
        statusCode: 500,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
        filename: filename,
      };
    }
  }

  async debugMongo(): Promise<
    | { success: boolean; count: number; films: FilmDto[] }
    | { success: boolean; error: string }
  > {
    try {
      const films = await this.filmsRepository.findAll();
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
