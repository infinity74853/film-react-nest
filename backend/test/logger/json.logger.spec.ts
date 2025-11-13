import { JsonLogger } from '../../src/logger/json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new JsonLogger();
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
    stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation();
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  describe('log methods', () => {
    it('should log message in JSON format to stdout', () => {
      logger.log('test message', 'TestContext');

      expect(stdoutSpy).toHaveBeenCalled();

      const logCall = stdoutSpy.mock.calls[0][0] as string;
      const parsedLog = JSON.parse(logCall);

      expect(parsedLog).toHaveProperty('level', 'LOG');
      expect(parsedLog).toHaveProperty('message', 'test message');
      expect(parsedLog).toHaveProperty('context', 'TestContext');
      expect(parsedLog).toHaveProperty('timestamp');
    });

    it('should error message in JSON format to stderr', () => {
      logger.error('error message', 'TestContext');

      expect(stderrSpy).toHaveBeenCalled();

      const logCall = stderrSpy.mock.calls[0][0] as string;
      const parsedLog = JSON.parse(logCall);

      expect(parsedLog).toHaveProperty('level', 'ERROR');
      expect(parsedLog).toHaveProperty('message', 'error message');
    });

    // ✅ ДОБАВЛЯЕМ ТЕСТЫ ДЛЯ WARN, DEBUG, VERBOSE
    it('should warn message in JSON format to stdout', () => {
      logger.warn('warning message', 'TestContext');

      expect(stdoutSpy).toHaveBeenCalled();

      const logCall = stdoutSpy.mock.calls[0][0] as string;
      const parsedLog = JSON.parse(logCall);

      expect(parsedLog).toHaveProperty('level', 'WARN');
      expect(parsedLog).toHaveProperty('message', 'warning message');
      expect(parsedLog).toHaveProperty('context', 'TestContext');
    });

    it('should debug message in JSON format to stdout', () => {
      logger.debug('debug message', 'TestContext');

      expect(stdoutSpy).toHaveBeenCalled();

      const logCall = stdoutSpy.mock.calls[0][0] as string;
      const parsedLog = JSON.parse(logCall);

      expect(parsedLog).toHaveProperty('level', 'DEBUG');
      expect(parsedLog).toHaveProperty('message', 'debug message');
      expect(parsedLog).toHaveProperty('context', 'TestContext');
    });

    it('should verbose message in JSON format to stdout', () => {
      logger.verbose('verbose message', 'TestContext');

      expect(stdoutSpy).toHaveBeenCalled();

      const logCall = stdoutSpy.mock.calls[0][0] as string;
      const parsedLog = JSON.parse(logCall);

      expect(parsedLog).toHaveProperty('level', 'VERBOSE');
      expect(parsedLog).toHaveProperty('message', 'verbose message');
      expect(parsedLog).toHaveProperty('context', 'TestContext');
    });
  });

  describe('parseOptionalParams', () => {
    it('should parse additional parameters', () => {
      const result = (logger as any).parseOptionalParams(['param1', 'param2']);

      expect(result).toHaveProperty('additionalParams');
      expect(result.additionalParams).toEqual(['param1', 'param2']);
    });

    it('should handle object parameters', () => {
      const paramObject = { key: 'value' };
      const result = (logger as any).parseOptionalParams([paramObject]);

      expect(result.additionalParams).toEqual([JSON.stringify(paramObject)]);
    });

    it('should return empty object for no parameters', () => {
      const result = (logger as any).parseOptionalParams([]);

      expect(result).toEqual({});
    });
  });

  describe('formatMessage', () => {
    it('should handle object messages', () => {
      const testObject = { key: 'value', number: 123 };
      logger.log(testObject, 'TestContext');

      const logCall = stdoutSpy.mock.calls[0][0] as string;
      const parsedLog = JSON.parse(logCall);

      expect(parsedLog.message).toBe(JSON.stringify(testObject));
    });

    it('should handle empty context', () => {
      logger.log('test message');

      const logCall = stdoutSpy.mock.calls[0][0] as string;
      const parsedLog = JSON.parse(logCall);

      expect(parsedLog.context).toBe('Application');
    });

    it('should include additional parameters in log entry', () => {
      logger.log('test message', 'TestContext', 'param1', 'param2');

      const logCall = stdoutSpy.mock.calls[0][0] as string;
      const parsedLog = JSON.parse(logCall);

      expect(parsedLog).toHaveProperty('additionalParams');
      expect(parsedLog.additionalParams).toEqual(['param1', 'param2']);
    });
  });
});
