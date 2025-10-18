import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

export async function importTestData(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();

  try {
    console.log('📊 Checking database state...');

    // Проверяем, есть ли уже данные
    const filmsCount = await queryRunner.query('SELECT COUNT(*) FROM films');
    const filmsExist = parseInt(filmsCount[0].count) > 0;

    if (filmsExist) {
      console.log('✅ Database already contains data, skipping import');
      return;
    }

    console.log('🗃️ Importing test data from SQL files...');

    const testDataPath = path.join(process.cwd(), 'test');

    // Проверяем существование SQL файлов
    if (!fs.existsSync(path.join(testDataPath, 'prac.films.sql'))) {
      console.log('❌ SQL files not found, using basic data');
      await initBasicData(dataSource);
      return;
    }

    await queryRunner.startTransaction();

    // Импортируем фильмы
    console.log('🎬 Importing films...');
    const filmsSql = fs.readFileSync(
      path.join(testDataPath, 'prac.films.sql'),
      'utf8',
    );
    await queryRunner.query(filmsSql);

    // Импортируем расписания
    console.log('📅 Importing schedules...');
    const schedulesSql = fs.readFileSync(
      path.join(testDataPath, 'prac.shedules.sql'),
      'utf8',
    );
    await queryRunner.query(schedulesSql);

    // Импортируем таблицу orders (если нужно)
    console.log('🎫 Setting up orders table...');
    const ordersSql = fs.readFileSync(
      path.join(testDataPath, 'prac.orders.sql'),
      'utf8',
    );
    await queryRunner.query(ordersSql);

    await queryRunner.commitTransaction();

    console.log('✅ Test data imported successfully');

    // Проверяем результат
    const finalFilmsCount = await queryRunner.query(
      'SELECT COUNT(*) FROM films',
    );
    const finalSchedulesCount = await queryRunner.query(
      'SELECT COUNT(*) FROM schedules',
    );

    console.log(
      `📊 Imported ${finalFilmsCount[0].count} films and ${finalSchedulesCount[0].count} schedules`,
    );
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error importing test data:', error);

    // Пробуем инициализировать базовыми данными
    console.log('🔄 Trying to initialize with basic data...');
    await initBasicData(dataSource);
  } finally {
    await queryRunner.release();
  }
}

async function initBasicData(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();

  try {
    await queryRunner.startTransaction();

    // Базовые данные фильмов
    await queryRunner.query(`
      INSERT INTO films (id, rating, director, tags, title, about, description, image, cover) VALUES
      ('92b8a2a7-ab6b-4fa9-915b-d27945865e39', 8.1, 'Амелия Хьюз', 'Рекомендуемые', '/bg6s.jpg', '/bg6c.jpg', 'Сон в летний день', 'Фэнтези-фильм о группе друзей попавших в волшебный лес, где время остановилось.', 'Причудливый фэнтези-фильм, действие которого происходит в волшебном лесу, где время остановилось. Группа друзей натыкается на это заколдованное царство и поначалу проникается беззаботным духом обитателей, но потом друзьям приходится разойтись. А как встретиться снова, если нет ни времени, ни места встречи?'),
      ('0354a762-8928-427f-81d7-1656f717f39c', 9.5, 'Оливер Беннет', 'Рекомендуемые', '/bg4s.jpg', '/bg4c.jpg', 'Парадокс Нексуса', 'Фильм об эксперименте по соединению человеческих умов. Исследует вопросы неприкосновенности частной жизни, идентичности и самой природы человеческого сознания', 'В фильме исследуются последствия новаторского эксперимента по соединению человеческих умов. По мере развития проекта участники сталкиваются с вопросами неприкосновенности частной жизни, идентичности и самой природы человеческого сознания.')
    `);

    // Базовые данные расписаний
    await queryRunner.query(`
      INSERT INTO schedules (id, daytime, hall, rows, seats, price, taken, "filmId") VALUES
      ('f2e429b0-685d-41f8-a8cd-1d8cb63b99ce', '2024-06-28T10:00:53+03:00', 0, 5, 10, 350, '', '92b8a2a7-ab6b-4fa9-915b-d27945865e39'),
      ('5beec101-acbb-4158-adc6-d855716b44a8', '2024-06-28T14:00:53+03:00', 1, 5, 10, 350, '', '92b8a2a7-ab6b-4fa9-915b-d27945865e39'),
      ('d3f54ca3-8e19-4b63-afd4-6a8d03933339', '2024-06-28T10:00:53+03:00', 0, 5, 10, 350, '', '0354a762-8928-427f-81d7-1656f717f39c')
    `);

    await queryRunner.commitTransaction();
    console.log('✅ Basic test data initialized');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error initializing basic data:', error);
  } finally {
    await queryRunner.release();
  }
}
