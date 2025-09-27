import { Controller, Get, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('/content/afisha')
export class StaticController {
  @Get(':filename')
  getFile(@Param('filename') filename: string, @Res() res: Response): void {
    try {
      if (
        filename.includes('..') ||
        filename.includes('/') ||
        filename.includes('\\')
      ) {
        res.status(400).json({ message: 'Invalid filename' });
        return;
      }

      const filePath = path.join(
        process.cwd(),
        'public',
        'content',
        'afisha',
        filename,
      );

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ message: 'File not found', path: filePath });
        return;
      }

      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
      };

      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
