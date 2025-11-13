import { Injectable, ConsoleLogger } from '@nestjs/common';

@Injectable()
export class DevLogger extends ConsoleLogger {
  constructor(context?: string) {
    // Вызываем родительский конструктор с контекстом или значением по умолчанию
    super(context ?? 'Application');
  }

  // Опционально: можно добавить метод для смены контекста
  setContext(context: string) {
    this.context = context;
  }
}
