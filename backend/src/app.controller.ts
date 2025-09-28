import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

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
        staticContent: 'GET /content/afisha/*',
      },
    });
  }

  @Get('/content/afisha/*')
  serveStaticContent(@Req() req: Request, @Res() res: Response) {
    const requestPath = req.url;

    if (requestPath.includes('http://') || requestPath.includes('https://')) {
      const matches = requestPath.match(/\/(bg\d+[sc]\.jpg)/);
      if (matches && matches[1]) {
        const filename = matches[1];
        const correctPath = path.join(
          __dirname,
          '..',
          '..',
          'public',
          'content',
          'afisha',
          filename,
        );

        if (fs.existsSync(correctPath)) {
          return res.sendFile(correctPath);
        }
      }
    }

    const filePath = path.join(__dirname, '..', '..', 'public', req.url);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }

    return res.status(404).json({
      message: `Cannot GET ${req.url}`,
      error: 'Not Found',
      statusCode: 404,
    });
  }
}
