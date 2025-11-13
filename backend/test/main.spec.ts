describe('Bootstrap', () => {
  it('should have crypto polyfill in test environment', () => {
    // Проверяем что полифил установлен
    expect(typeof global.crypto).toBe('object');
    expect(typeof global.crypto.randomUUID).toBe('function');
    expect(typeof global.crypto.getRandomValues).toBe('function');
  });

  it('should generate UUID with polyfill', () => {
    const uuid = global.crypto.randomUUID();
    expect(typeof uuid).toBe('string');
    expect(uuid).toHaveLength(36); // Стандартная длина UUID
  });
});
