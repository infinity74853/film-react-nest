import { LoggerFactory } from '../../src/logger/logger.factory';
import { DevLogger } from '../../src/logger/dev.logger';
import { JsonLogger } from '../../src/logger/json.logger';
import { TskvLogger } from '../../src/logger/tskv.logger';

describe('LoggerFactory', () => {
  beforeEach(() => {
    delete process.env.LOGGER_TYPE;
  });

  it('should create dev logger by default', () => {
    const logger = LoggerFactory.createLogger();
    expect(logger).toBeInstanceOf(DevLogger);
  });

  it('should create json logger when type is json', () => {
    process.env.LOGGER_TYPE = 'json';
    const logger = LoggerFactory.createLogger();
    expect(logger).toBeInstanceOf(JsonLogger);
  });

  it('should create tskv logger when type is tskv', () => {
    process.env.LOGGER_TYPE = 'tskv';
    const logger = LoggerFactory.createLogger();
    expect(logger).toBeInstanceOf(TskvLogger);
  });
});
