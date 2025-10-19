import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRootInfo() {
    return {
      message: 'Film API is running successfully! 🎬',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      endpoints: {
        films: 'GET /api/afisha/films/',
        filmSchedule: 'GET /api/afisha/films/:id/schedule',
        createOrder: 'POST /api/afisha/order',
        confirmOrder: 'POST /api/afisha/order/:id/confirm',
        getOrder: 'GET /api/afisha/order/:id',
        staticContent: 'GET /content/afisha/*',
      },
    };
  }
}
