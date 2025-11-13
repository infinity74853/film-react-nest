import {
  configProvider,
  AppConfig,
  AppConfigDatabase,
} from '../../src/app.config.provider';

describe('AppConfigProvider', () => {
  describe('TypeScript interfaces', () => {
    it('should have correct AppConfig interface', () => {
      const testConfig: AppConfig = {
        database: {
          driver: 'postgres',
          url: 'postgresql://user:pass@localhost:5432/db',
        },
      };

      expect(testConfig.database.driver).toBe('postgres');
      expect(testConfig.database.url).toBe(
        'postgresql://user:pass@localhost:5432/db',
      );
    });

    it('should have correct AppConfigDatabase interface', () => {
      const testDatabase: AppConfigDatabase = {
        driver: 'mysql',
        url: 'mysql://localhost:3306/db',
      };

      expect(testDatabase.driver).toBe('mysql');
      expect(testDatabase.url).toBe('mysql://localhost:3306/db');
    });
  });

  describe('configProvider structure', () => {
    it('should have correct NestJS provider structure', () => {
      expect(configProvider).toBeDefined();
      expect(configProvider.provide).toBe('CONFIG');
      expect(Array.isArray(configProvider.imports)).toBe(true);
      expect(typeof configProvider.useValue).toBe('object');
    });

    it('should have configuration object with database properties', () => {
      const config = configProvider.useValue as AppConfig;

      expect(config.database).toBeDefined();
      expect(typeof config.database.driver).toBe('string');
      expect(typeof config.database.url).toBe('string');
    });
  });
});
