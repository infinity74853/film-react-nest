import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot() {
    return this.appService.getRootInfo();
  }

  // Добавьте этот эндпоинт для проверки здоровья приложения
  @Get('health')
  getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Film API Backend',
      database: 'PostgreSQL',
    };
  }

  // Можно также добавить эндпоинт для проверки API
  @Get('api/health')
  getApiHealth() {
    return {
      status: 'operational',
      message: 'Film API is running correctly',
      timestamp: new Date().toISOString(),
    };
  }
}
