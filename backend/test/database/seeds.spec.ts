import { importTestData } from '../../src/database/seeds/import-test-data';
import { DataSource, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// Мокаем fs и path модули
jest.mock('fs');
jest.mock('path');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

// Создаем мок-интерфейс для QueryRunner
interface MockQueryRunner extends QueryRunner {
  connect: jest.Mock<Promise<void>>;
  query: jest.Mock;
  startTransaction: jest.Mock<Promise<void>>;
  commitTransaction: jest.Mock<Promise<void>>;
  rollbackTransaction: jest.Mock<Promise<void>>;
  release: jest.Mock<Promise<void>>;
}

describe('Database Seeds', () => {
  let mockDataSource: DataSource;
  let mockQueryRunner: MockQueryRunner;

  beforeEach(() => {
    // Сбрасываем все моки
    jest.clearAllMocks();

    // Мокаем queryRunner с правильной типизацией
    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      query: jest.fn(),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
    } as MockQueryRunner;

    // Мокаем DataSource
    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    } as unknown as DataSource;

    // Мокаем path.join
    mockPath.join.mockImplementation((...args) => args.join('/'));
  });

  it('should have importTestData function', () => {
    expect(typeof importTestData).toBe('function');
  });

  it('should skip import if films already exist', async () => {
    // Мокаем что фильмы уже есть
    mockQueryRunner.query.mockResolvedValueOnce([{ count: '5' }]); // filmsCount

    await importTestData(mockDataSource);

    expect(mockQueryRunner.query).toHaveBeenCalledWith(
      'SELECT COUNT(*) FROM films',
    );
    // Должен выйти раньше, не выполняя остальную логику
    expect(mockQueryRunner.startTransaction).not.toHaveBeenCalled();
  });

  it('should initialize basic data if SQL files not found', async () => {
    // Мокаем что фильмов нет
    mockQueryRunner.query.mockResolvedValueOnce([{ count: '0' }]); // filmsCount
    // Мокаем что файлы не существуют
    mockFs.existsSync.mockReturnValue(false);

    await importTestData(mockDataSource);

    expect(mockFs.existsSync).toHaveBeenCalled();
    // initBasicData вызывает startTransaction, так что это ожидаемо
    expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
  });

  it('should import data from SQL files when they exist', async () => {
    // Мокаем что фильмов нет
    mockQueryRunner.query.mockResolvedValueOnce([{ count: '0' }]); // filmsCount
    // Мокаем что файлы существуют
    mockFs.existsSync.mockReturnValue(true);
    // Мокаем чтение SQL файлов
    mockFs.readFileSync.mockReturnValue('INSERT INTO films ...');

    await importTestData(mockDataSource);

    expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(mockFs.readFileSync).toHaveBeenCalledTimes(3); // films, schedules, orders
  });

  it('should handle errors and rollback transaction', async () => {
    // Мокаем что фильмов нет
    mockQueryRunner.query.mockResolvedValueOnce([{ count: '0' }]); // filmsCount
    // Мокаем что файлы существуют
    mockFs.existsSync.mockReturnValue(true);
    // Мокаем ошибку при выполнении запроса
    mockQueryRunner.query.mockRejectedValueOnce(new Error('DB error'));

    await importTestData(mockDataSource);

    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  it('should always release query runner', async () => {
    // Мокаем что фильмов нет
    mockQueryRunner.query.mockResolvedValueOnce([{ count: '0' }]); // filmsCount
    // Мокаем что файлы существуют
    mockFs.existsSync.mockReturnValue(true);
    // Мокаем чтение SQL файлов
    mockFs.readFileSync.mockReturnValue('INSERT INTO films ...');

    await importTestData(mockDataSource);

    // QueryRunner должен быть освобожден в любом случае
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });

  it('should handle errors in initBasicData', async () => {
    // Мокаем что фильмов нет
    mockQueryRunner.query.mockResolvedValueOnce([{ count: '0' }]); // filmsCount
    // Мокаем что файлы не существуют
    mockFs.existsSync.mockReturnValue(false);
    // Мокаем ошибку в initBasicData
    mockQueryRunner.startTransaction.mockRejectedValueOnce(
      new Error('Transaction error'),
    );

    await importTestData(mockDataSource);

    // Должен обработать ошибку без падения
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });

  it('should handle file reading errors', async () => {
    // Мокаем что фильмов нет
    mockQueryRunner.query.mockResolvedValueOnce([{ count: '0' }]); // filmsCount
    // Мокаем что файлы существуют
    mockFs.existsSync.mockReturnValue(true);
    // Мокаем ошибку при чтении файла
    mockFs.readFileSync.mockImplementation(() => {
      throw new Error('File read error');
    });

    await importTestData(mockDataSource);

    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });
});
