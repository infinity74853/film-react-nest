import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class TskvLogger implements LoggerService {
  private formatMessage(
    level: string,
    message: any,
    ...optionalParams: any[]
  ): string {
    const timestamp = new Date().toISOString();
    const formattedMessage =
      typeof message === 'object' ? JSON.stringify(message) : String(message);

    const fields = [
      `timestamp=${timestamp}`,
      `level=${level}`,
      `message=${formattedMessage}`,
    ];

    // Добавляем дополнительные параметры если есть
    if (optionalParams.length > 0) {
      optionalParams.forEach((param, index) => {
        if (param) {
          fields.push(
            `param${index}=${typeof param === 'object' ? JSON.stringify(param) : String(param)}`,
          );
        }
      });
    }

    return fields.join('\t') + '\n';
  }

  log(message: any, ...optionalParams: any[]) {
    process.stdout.write(this.formatMessage('log', message, ...optionalParams));
  }

  error(message: any, ...optionalParams: any[]) {
    process.stderr.write(
      this.formatMessage('error', message, ...optionalParams),
    );
  }

  warn(message: any, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('warn', message, ...optionalParams),
    );
  }

  debug(message: any, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('debug', message, ...optionalParams),
    );
  }

  verbose(message: any, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('verbose', message, ...optionalParams),
    );
  }
}
