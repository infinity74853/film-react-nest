import { DevLogger } from '../../src/logger/dev.logger';

describe('DevLogger', () => {
  let logger: DevLogger;
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new DevLogger('TestContext');
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
    stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation();
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  it('should create logger without context', () => {
    const loggerWithoutContext = new DevLogger();
    expect(loggerWithoutContext).toBeDefined();
    // Проверяем что контекст по умолчанию установлен
    expect(loggerWithoutContext['context']).toBe('Application');
  });

  it('should create logger with context', () => {
    expect(logger).toBeDefined();
    expect(logger['context']).toBe('TestContext');
  });

  it('should log message to stdout', () => {
    logger.log('test message');
    expect(stdoutSpy).toHaveBeenCalled();
  });

  it('should error message to stderr', () => {
    logger.error('error message');
    expect(stderrSpy).toHaveBeenCalled();
  });

  it('should warn message to stdout', () => {
    logger.warn('warning message');
    expect(stdoutSpy).toHaveBeenCalled();
  });

  it('should debug message to stdout', () => {
    logger.debug('debug message');
    expect(stdoutSpy).toHaveBeenCalled();
  });

  it('should verbose message to stdout', () => {
    logger.verbose('verbose message');
    expect(stdoutSpy).toHaveBeenCalled();
  });

  // ДОБАВЛЯЕМ ТЕСТ ДЛЯ setContext МЕТОДА
  it('should change context with setContext method', () => {
    // Проверяем начальный контекст
    expect(logger['context']).toBe('TestContext');

    // Меняем контекст
    logger.setContext('NewContext');

    // Проверяем что контекст изменился
    expect(logger['context']).toBe('NewContext');
  });

  it('should handle empty string context', () => {
    logger.setContext('');
    expect(logger['context']).toBe('');
  });
});
