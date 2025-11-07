import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class TskvLogger implements LoggerService {
  private formatMessage(
    level: string,
    message: any,
    context?: string,
    ...optionalParams: any[]
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

  private escapeValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
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

  log(message: any, context?: string, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('LOG', message, context, ...optionalParams),
    );
  }

  error(message: any, context?: string, ...optionalParams: any[]) {
    process.stderr.write(
      this.formatMessage('ERROR', message, context, ...optionalParams),
    );
  }

  warn(message: any, context?: string, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('WARN', message, context, ...optionalParams),
    );
  }

  debug(message: any, context?: string, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('DEBUG', message, context, ...optionalParams),
    );
  }

  verbose(message: any, context?: string, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('VERBOSE', message, context, ...optionalParams),
    );
  }
}
