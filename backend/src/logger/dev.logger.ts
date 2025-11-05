import { Injectable, ConsoleLogger } from '@nestjs/common';

@Injectable()
export class DevLogger extends ConsoleLogger {
  // Можно добавить кастомную логику для разработки
  log(message: any, ...optionalParams: any[]) {
    super.log(`🔧 ${message}`, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    super.error(`❌ ${message}`, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    super.warn(`⚠️ ${message}`, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    super.debug(`🐛 ${message}`, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    super.verbose(`📝 ${message}`, ...optionalParams);
  }
}
