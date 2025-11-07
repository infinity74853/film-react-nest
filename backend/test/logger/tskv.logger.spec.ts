import { TskvLogger } from '../../src/logger/tskv.logger';

describe('TskvLogger', () => {
  let logger: TskvLogger;
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new TskvLogger();
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
    stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation();
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  describe('log methods', () => {
    it('should log message in TSKV format to stdout', () => {
      logger.log('test message', 'TestContext');

      expect(stdoutSpy).toHaveBeenCalled();

      const logCall = stdoutSpy.mock.calls[0][0] as string;

      expect(logCall).toContain('timestamp=');
      expect(logCall).toContain('level=LOG');
      expect(logCall).toContain('message=test message');
      expect(logCall).toContain('context=TestContext');
      expect(logCall.endsWith('\n')).toBe(true);
    });

    it('should error message in TSKV format to stderr', () => {
      logger.error('error message', 'TestContext');

      expect(stderrSpy).toHaveBeenCalled();

      const logCall = stderrSpy.mock.calls[0][0] as string;
      expect(logCall).toContain('level=ERROR');
      expect(logCall).toContain('message=error message');
    });

    it('should warn message in TSKV format', () => {
      logger.warn('warning message', 'TestContext');

      expect(stdoutSpy).toHaveBeenCalled();

      const logCall = stdoutSpy.mock.calls[0][0] as string;
      expect(logCall).toContain('level=WARN');
    });

    it('should debug message in TSKV format', () => {
      logger.debug('debug message', 'TestContext');

      expect(stdoutSpy).toHaveBeenCalled();

      const logCall = stdoutSpy.mock.calls[0][0] as string;
      expect(logCall).toContain('level=DEBUG');
    });

    it('should verbose message in TSKV format', () => {
      logger.verbose('verbose message', 'TestContext');

      expect(stdoutSpy).toHaveBeenCalled();

      const logCall = stdoutSpy.mock.calls[0][0] as string;
      expect(logCall).toContain('level=VERBOSE');
    });
  });

  describe('escapeValue', () => {
    it('should escape tabs and newlines', () => {
      const result = (logger as any).escapeValue(
        'test\tmessage\nwith\rspecial',
      );

      expect(result).toBe('test message with special');
      expect(result).not.toContain('\t');
      expect(result).not.toContain('\n');
      expect(result).not.toContain('\r');
    });

    it('should handle objects by stringifying', () => {
      const testObject = { key: 'value', number: 123 };
      const result = (logger as any).escapeValue(testObject);

      expect(result).toBe(JSON.stringify(testObject));
    });

    it('should handle null and undefined', () => {
      expect((logger as any).escapeValue(null)).toBe('');
      expect((logger as any).escapeValue(undefined)).toBe('');
    });

    it('should handle regular strings', () => {
      expect((logger as any).escapeValue('normal string')).toBe(
        'normal string',
      );
    });

    it('should handle numbers', () => {
      expect((logger as any).escapeValue(123)).toBe('123');
    });

    it('should handle booleans', () => {
      expect((logger as any).escapeValue(true)).toBe('true');
      expect((logger as any).escapeValue(false)).toBe('false');
    });
  });

  describe('formatMessage', () => {
    it('should include additional parameters', () => {
      logger.log('test message', 'TestContext', 'param1', 'param2');

      const logCall = stdoutSpy.mock.calls[0][0] as string;

      expect(logCall).toContain('param0=param1');
      expect(logCall).toContain('param1=param2');
    });

    it('should handle object parameters', () => {
      const paramObject = { action: 'test', data: { id: 1 } };
      logger.log('test message', 'TestContext', paramObject);

      const logCall = stdoutSpy.mock.calls[0][0] as string;

      // Объект должен быть сериализован в JSON
      expect(logCall).toContain(`param0=${JSON.stringify(paramObject)}`);
    });

    it('should handle empty context', () => {
      logger.log('test message');

      const logCall = stdoutSpy.mock.calls[0][0] as string;

      expect(logCall).toContain('context=Application');
    });

    it('should skip undefined parameters', () => {
      logger.log('test message', 'TestContext', 'param1', undefined, 'param3');

      const logCall = stdoutSpy.mock.calls[0][0] as string;

      expect(logCall).toContain('param0=param1');
      expect(logCall).toContain('param2=param3');
      // param1 (undefined) должен быть пропущен
      expect(logCall).not.toContain('param1=undefined');
    });
  });
});
