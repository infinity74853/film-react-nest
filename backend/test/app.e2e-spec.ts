import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Films API', () => {
    it('/api/afisha/films/ (GET) - should return films list', () => {
      return request(app.getHttpServer())
        .get('/api/afisha/films/')
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('items');
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.total).toBe(res.body.items.length);

          if (res.body.items.length > 0) {
            const film = res.body.items[0];
            expect(film).toHaveProperty('id');
            expect(film).toHaveProperty('title');
            expect(film).toHaveProperty('rating');
            expect(film).toHaveProperty('director');
            expect(film).toHaveProperty('image');
          }
        });
    });

    it('/api/afisha/films/:id/schedule (GET) - should return film schedule', async () => {
      // Сначала получаем список фильмов чтобы взять ID
      const filmsResponse = await request(app.getHttpServer()).get(
        '/api/afisha/films/',
      );

      if (filmsResponse.body.items.length === 0) {
        return;
      }

      const filmId = filmsResponse.body.items[0].id;

      return request(app.getHttpServer())
        .get(`/api/afisha/films/${filmId}/schedule`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('items');
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.total).toBe(res.body.items.length);

          if (res.body.items.length > 0) {
            const schedule = res.body.items[0];
            expect(schedule).toHaveProperty('id');
            expect(schedule).toHaveProperty('daytime');
            expect(schedule).toHaveProperty('hall');
            expect(schedule).toHaveProperty('price');
          }
        });
    });
  });

  describe('Order API', () => {
    it('/api/afisha/order/ (POST) - should create order', async () => {
      // Сначала получим ID фильма и сеанса
      const filmsResponse = await request(app.getHttpServer()).get(
        '/api/afisha/films/',
      );

      if (filmsResponse.body.items.length === 0) {
        return;
      }

      const filmId = filmsResponse.body.items[0].id;

      const scheduleResponse = await request(app.getHttpServer()).get(
        `/api/afisha/films/${filmId}/schedule`,
      );

      if (scheduleResponse.body.items.length === 0) {
        return;
      }

      const sessionId = scheduleResponse.body.items[0].id;
      const daytime = scheduleResponse.body.items[0].daytime;
      const price = scheduleResponse.body.items[0].price;

      return request(app.getHttpServer())
        .post('/api/afisha/order/')
        .send({
          tickets: [
            {
              film: filmId,
              session: sessionId,
              daytime: daytime,
              row: 1,
              seat: 1,
              price: price,
            },
          ],
          email: 'test@example.com',
          phone: '+1234567890',
        })
        .expect(201)
        .expect((res: request.Response) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('items');
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.total).toBe(res.body.items.length);

          const ticket = res.body.items[0];
          expect(ticket).toHaveProperty('film');
          expect(ticket).toHaveProperty('session');
          expect(ticket).toHaveProperty('row');
          expect(ticket).toHaveProperty('seat');
          expect(ticket).toHaveProperty('price');
        });
    });
  });

  describe('Static content', () => {
    it('/api/afisha/films/images/:filename (GET) - should serve images', () => {
      return request(app.getHttpServer())
        .get('/api/afisha/films/images/bg6s.jpg')
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.headers['content-type']).toMatch(/image/);
        });
    });
  });
});
