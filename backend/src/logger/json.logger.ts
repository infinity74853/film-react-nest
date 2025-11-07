import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class JsonLogger implements LoggerService {
  private formatMessage(
    level: string,
    message: any,
    context?: string,
    ...optionalParams: any[]
  ) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message:
        typeof message === 'object' ? JSON.stringify(message) : String(message),
      context: context || 'Application',
      ...this.parseOptionalParams(optionalParams),
    };
    return JSON.stringify(logEntry);
  }

  private parseOptionalParams(optionalParams: any[]) {
    if (optionalParams.length === 0) return {};

    return {
      additionalParams: optionalParams.map((param) =>
        typeof param === 'object' ? JSON.stringify(param) : String(param),
      ),
    };
  }

  log(message: any, context?: string, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('LOG', message, context, ...optionalParams) + '\n',
    );
  }

  error(message: any, context?: string, ...optionalParams: any[]) {
    process.stderr.write(
      this.formatMessage('ERROR', message, context, ...optionalParams) + '\n',
    );
  }

  warn(message: any, context?: string, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('WARN', message, context, ...optionalParams) + '\n',
    );
  }

  debug(message: any, context?: string, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('DEBUG', message, context, ...optionalParams) + '\n',
    );
  }

  verbose(message: any, context?: string, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('VERBOSE', message, context, ...optionalParams) + '\n',
    );
  }
}
