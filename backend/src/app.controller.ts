import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  getRoot(@Res() res: Response) {
    res.json({
      message: 'Film API is running successfully! 🎬',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      endpoints: {
        films: 'GET /api/afisha/films/',
        filmSchedule: 'GET /api/afisha/films/:id/schedule',
        createOrder: 'POST /api/afisha/order',
        confirmOrder: 'POST /api/afisha/order/:id/confirm',
        getOrder: 'GET /api/afisha/order/:id',
        staticContent: 'GET /images/*',
      },
    });
  }
}
