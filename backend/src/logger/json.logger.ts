import { LoggerService, Injectable } from '@nestjs/common';

type Loggable =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | object
  | Error
  | Date
  | RegExp
  | null
  | undefined
  | Array<Loggable>;

@Injectable()
export class JsonLogger implements LoggerService {
  private formatMessage(
    level: string,
    message: Loggable,
    context?: string,
    ...optionalParams: Loggable[]
  ): string {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: this.stringifyMessage(message),
      context: context || 'Application',
      ...this.parseOptionalParams(optionalParams),
    };
    return JSON.stringify(logEntry);
  }

  private stringifyMessage(message: Loggable): string {
    if (message === null || message === undefined) {
      return '';
    }

    // Обрабатываем специальные типы
    if (message instanceof Error) {
      return message.stack || message.message;
    }

    if (message instanceof Date) {
      return message.toISOString();
    }

    if (message instanceof RegExp) {
      return message.toString();
    }

    if (typeof message === 'bigint') {
      return message.toString();
    }

    if (typeof message === 'symbol') {
      return message.toString();
    }

    // Обрабатываем массивы рекурсивно
    if (Array.isArray(message)) {
      return JSON.stringify(message.map((item) => this.stringifyMessage(item)));
    }

    // Преобразуем объекты в JSON строку
    if (typeof message === 'object') {
      return JSON.stringify(message);
    }

    return String(message);
  }

  private parseOptionalParams(
    optionalParams: Loggable[],
  ): Record<string, unknown> {
    if (optionalParams.length === 0) return {};

    return {
      additionalParams: optionalParams.map((param) =>
        this.stringifyMessage(param),
      ),
    };
  }

  log(message: Loggable, context?: string, ...optionalParams: Loggable[]) {
    process.stdout.write(
      this.formatMessage('LOG', message, context, ...optionalParams) + '\n',
    );
  }

  error(message: Loggable, context?: string, ...optionalParams: Loggable[]) {
    process.stderr.write(
      this.formatMessage('ERROR', message, context, ...optionalParams) + '\n',
    );
  }

  warn(message: Loggable, context?: string, ...optionalParams: Loggable[]) {
    process.stdout.write(
      this.formatMessage('WARN', message, context, ...optionalParams) + '\n',
    );
  }

  debug(message: Loggable, context?: string, ...optionalParams: Loggable[]) {
    process.stdout.write(
      this.formatMessage('DEBUG', message, context, ...optionalParams) + '\n',
    );
  }

  verbose(message: Loggable, context?: string, ...optionalParams: Loggable[]) {
    process.stdout.write(
      this.formatMessage('VERBOSE', message, context, ...optionalParams) + '\n',
    );
  }
}
