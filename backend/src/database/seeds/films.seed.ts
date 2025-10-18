import { DataSource } from 'typeorm';
import { Film } from '../repository/typeorm/entities/film.entity';
import { Schedule } from '../repository/typeorm/entities/schedule.entity';

export async function seedFilms(dataSource: DataSource) {
  const filmRepository = dataSource.getRepository(Film);
  const scheduleRepository = dataSource.getRepository(Schedule);

  // Проверяем, есть ли уже фильмы
  const existingFilms = await filmRepository.count();
  if (existingFilms > 0) {
    console.log('Films already seeded');
    return;
  }

  const films = [
    {
      id: '1',
      rating: 8.5,
      director: 'Кристофер Нолан',
      tags: ['фантастика', 'приключения'],
      title: 'Начало',
      about: 'Фильм о снах и реальности',
      description:
        'Профессиональный вор, специализирующийся на краже ценных секретов из подсознания...',
      image: 'inception.jpg',
      cover: 'inception_cover.jpg',
    },
    // Добавь больше фильмов
  ];

  await filmRepository.save(films);
  console.log('Films seeded successfully');
}
