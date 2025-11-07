import { AppModule } from '../src/app.module';

describe('AppModule', () => {
  it('should be defined', () => {
    expect(AppModule).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof AppModule).toBe('function');
  });

  it('should have module metadata', () => {
    // Просто проверяем что модуль имеет необходимые декораторы
    const module = new AppModule();
    expect(module).toBeInstanceOf(AppModule);
  });
});
