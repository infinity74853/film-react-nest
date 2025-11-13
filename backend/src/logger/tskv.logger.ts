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
export class TskvLogger implements LoggerService {
  private formatMessage(
    level: string,
    message: Loggable,
    context?: string,
    ...optionalParams: Loggable[]
  ): string {
    const timestamp = new Date().toISOString();
    const formattedMessage = this.escapeValue(message);

    const fields = [
      `timestamp=${timestamp}`,
      `level=${level}`,
      `message=${formattedMessage}`,
      `context=${context || 'Application'}`,
    ];

    // Добавляем дополнительные параметры
    if (optionalParams.length > 0) {
      optionalParams.forEach((param, index) => {
        if (param !== undefined && param !== null) {
          const value = this.escapeValue(param);
          fields.push(`param${index}=${value}`);
        }
      });
    }

    return fields.join('\t') + '\n';
  }

  private escapeValue(value: Loggable): string {
    if (value === null || value === undefined) {
      return '';
    }

    // Обрабатываем специальные типы
    if (value instanceof Error) {
      return value.message;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (value instanceof RegExp) {
      return value.toString();
    }

    if (typeof value === 'bigint') {
      return value.toString();
    }

    if (typeof value === 'symbol') {
      return value.toString();
    }

    // Обрабатываем массивы рекурсивно
    if (Array.isArray(value)) {
      return value.map((item) => this.escapeValue(item)).join(', ');
    }

    // Преобразуем объекты в JSON строку, остальные значения в строку
    const stringValue =
      typeof value === 'object' ? JSON.stringify(value) : String(value);

    // Экранируем специальные символы
    return stringValue
      .replace(/\t/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ');
  }

  log(message: Loggable, context?: string, ...optionalParams: Loggable[]) {
    process.stdout.write(
      this.formatMessage('LOG', message, context, ...optionalParams),
    );
  }

  error(message: Loggable, context?: string, ...optionalParams: Loggable[]) {
    process.stderr.write(
      this.formatMessage('ERROR', message, context, ...optionalParams),
    );
  }

  warn(message: Loggable, context?: string, ...optionalParams: Loggable[]) {
    process.stdout.write(
      this.formatMessage('WARN', message, context, ...optionalParams),
    );
  }

  debug(message: Loggable, context?: string, ...optionalParams: Loggable[]) {
    process.stdout.write(
      this.formatMessage('DEBUG', message, context, ...optionalParams),
    );
  }

  verbose(message: Loggable, context?: string, ...optionalParams: Loggable[]) {
    process.stdout.write(
      this.formatMessage('VERBOSE', message, context, ...optionalParams),
    );
  }
}
