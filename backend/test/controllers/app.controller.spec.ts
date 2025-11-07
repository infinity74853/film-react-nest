import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getRoot', () => {
    it('should return API information', () => {
      const mockInfo = {
        message: 'Film API is running successfully! 🎬',
        timestamp: expect.any(String),
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

      jest.spyOn(appService, 'getRootInfo').mockReturnValue(mockInfo);

      const result = appController.getRoot();

      expect(result).toEqual(mockInfo);
      expect(appService.getRootInfo).toHaveBeenCalled();
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = appController.getHealth();

      expect(result).toEqual({
        status: 'OK',
        timestamp: expect.any(String),
        service: 'Film API Backend',
        database: 'PostgreSQL',
      });
    });
  });

  describe('getApiHealth', () => {
    it('should return API health status', () => {
      const result = appController.getApiHealth();

      expect(result).toEqual({
        status: 'operational',
        message: 'Film API is running correctly',
        timestamp: expect.any(String),
      });
    });
  });
});
