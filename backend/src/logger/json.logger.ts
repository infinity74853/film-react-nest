import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class JsonLogger implements LoggerService {
  private formatMessage(level: string, message: any, ...optionalParams: any[]) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: typeof message === 'object' ? message : String(message),
      context: optionalParams.length > 0 ? optionalParams : undefined,
    };
    return JSON.stringify(logEntry);
  }

  log(message: any, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('log', message, ...optionalParams) + '\n',
    );
  }

  error(message: any, ...optionalParams: any[]) {
    process.stderr.write(
      this.formatMessage('error', message, ...optionalParams) + '\n',
    );
  }

  warn(message: any, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('warn', message, ...optionalParams) + '\n',
    );
  }

  debug(message: any, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('debug', message, ...optionalParams) + '\n',
    );
  }

  verbose(message: any, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('verbose', message, ...optionalParams) + '\n',
    );
  }
}
