import { isDevelopmentEnvironment, isProductionEnvironment, isTestEnvironment } from './runtimeEnvironment';

async function withEnv(name: string, value: any, cb: () => any | Promise<any>) {
  const currentValue = process.env[name];

  process.env[name] = value;
  const res = await cb();

  process.env[name] = currentValue;
  return res;
}

describe('isDevelopmentEnvironment(env)', () => {
  test('is false for undefined process.env.NODE_ENV', async () => {
    const isDev = await withEnv('NODE_ENV', undefined, () => {
      return isDevelopmentEnvironment();
    });

    expect(isDev).toBe(false);
  });

  test('is false for non-development process.env.NODE_ENV', async () => {
    const isDev = await withEnv('NODE_ENV', 'whatever', () => {
      return isDevelopmentEnvironment();
    });

    expect(isDev).toBe(false);
  });

  test('is true for development process.env.NODE_ENV', async () => {
    const isDev = await withEnv('NODE_ENV', 'development', () => {
      return isDevelopmentEnvironment();
    });

    expect(isDev).toBe(true);
  });

  describe('when env is passed as parameter', () => {
    test('is false for non-development process.env.NODE_ENV', async () => {
      const isDev = await withEnv('NODE_ENV', 'whatever', () => {
        return isDevelopmentEnvironment(process.env);
      });

      expect(isDev).toBe(false);
    });

    test('is true for development process.env.NODE_ENV', async () => {
      const isDev = await withEnv('NODE_ENV', 'development', () => {
        return isDevelopmentEnvironment(process.env);
      });

      expect(isDev).toBe(true);
    });
  });

  // This case is related to per-request env on Cloudflare fetch handler
  describe('when env-like object is passed as parameter', () => {
    test('is false for non-development process.env.NODE_ENV', async () => {
      const isDev = isDevelopmentEnvironment({ NODE_ENV: 'whatever' });
      expect(isDev).toBe(false);
    });

    test('is true for development process.env.NODE_ENV', async () => {
      const isDev = isDevelopmentEnvironment({ NODE_ENV: 'development' });
      expect(isDev).toBe(true);
    });
  });

  describe('when publishableKey is passed as parameter', () => {
    test('is false for non-development process.env.NODE_ENV', async () => {
      const isDev = isDevelopmentEnvironment('pk_live_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk');
      expect(isDev).toBe(false);
    });

    test('is true for development process.env.NODE_ENV', async () => {
      const isDev = isDevelopmentEnvironment('pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk');
      expect(isDev).toBe(true);
    });
  });
});

describe('isProductionEnvironment(env)', () => {
  test('is false for undefined process.env.NODE_ENV', async () => {
    const isDev = await withEnv('NODE_ENV', undefined, () => {
      return isProductionEnvironment();
    });

    expect(isDev).toBe(false);
  });

  test('is false for non-production process.env.NODE_ENV', async () => {
    const isDev = await withEnv('NODE_ENV', 'whatever', () => {
      return isProductionEnvironment();
    });

    expect(isDev).toBe(false);
  });

  test('is true for production process.env.NODE_ENV', async () => {
    const isDev = await withEnv('NODE_ENV', 'production', () => {
      return isProductionEnvironment();
    });

    expect(isDev).toBe(true);
  });

  describe('when env is passed as parameter', () => {
    test('is false for non-production process.env.NODE_ENV', async () => {
      const isDev = await withEnv('NODE_ENV', 'whatever', () => {
        return isProductionEnvironment(process.env);
      });

      expect(isDev).toBe(false);
    });

    test('is true for production process.env.NODE_ENV', async () => {
      const isDev = await withEnv('NODE_ENV', 'production', () => {
        return isProductionEnvironment(process.env);
      });

      expect(isDev).toBe(true);
    });
  });

  // This case is related to per-request env on Cloudflare fetch handler
  describe('when env-like object is passed as parameter', () => {
    test('is false for non-production process.env.NODE_ENV', async () => {
      const isDev = isProductionEnvironment({ NODE_ENV: 'whatever' });
      expect(isDev).toBe(false);
    });

    test('is true for production process.env.NODE_ENV', async () => {
      const isDev = isProductionEnvironment({ NODE_ENV: 'production' });
      expect(isDev).toBe(true);
    });
  });

  describe('when publishableKey is passed as parameter', () => {
    test('is false for non-production process.env.NODE_ENV', async () => {
      const isDev = isProductionEnvironment('pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk');
      expect(isDev).toBe(false);
    });

    test('is true for production process.env.NODE_ENV', async () => {
      const isDev = isProductionEnvironment('pk_live_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk');
      expect(isDev).toBe(true);
    });
  });
});

describe('isTestEnvironment(env)', () => {
  test('is false for undefined process.env.NODE_ENV', async () => {
    const isDev = await withEnv('NODE_ENV', undefined, () => {
      return isTestEnvironment();
    });

    expect(isDev).toBe(false);
  });

  test('is false for non-test process.env.NODE_ENV', async () => {
    const isDev = await withEnv('NODE_ENV', 'whatever', () => {
      return isTestEnvironment();
    });

    expect(isDev).toBe(false);
  });

  test('is true for test process.env.NODE_ENV', async () => {
    const isDev = await withEnv('NODE_ENV', 'test', () => {
      return isTestEnvironment();
    });

    expect(isDev).toBe(true);
  });

  describe('when env is passed as parameter', () => {
    test('is false non-test process.env.NODE_ENV', async () => {
      const isDev = await withEnv('NODE_ENV', 'whatever', () => {
        return isTestEnvironment(process.env);
      });

      expect(isDev).toBe(false);
    });

    test('is true for test process.env.NODE_ENV', async () => {
      const isDev = await withEnv('NODE_ENV', 'test', () => {
        return isTestEnvironment(process.env);
      });

      expect(isDev).toBe(true);
    });
  });

  // This case is related to per-request env on Cloudflare fetch handler
  describe('when env-like object is passed as parameter', () => {
    test('is false for non-test process.env.NODE_ENV', async () => {
      const isDev = isTestEnvironment({ NODE_ENV: 'whatever' });
      expect(isDev).toBe(false);
    });

    test('is false for test process.env.NODE_ENV', async () => {
      const isDev = isTestEnvironment({ NODE_ENV: 'test' });
      expect(isDev).toBe(true);
    });
  });

  // There is no publishableKey for test env (only prod /dev)
  describe('when publishableKey is passed as parameter', () => {
    test('is false for non-test process.env.NODE_ENV', async () => {
      const isDev = isTestEnvironment('pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk');
      expect(isDev).toBe(false);
    });

    test('is false for test process.env.NODE_ENV', async () => {
      const isDev = isTestEnvironment('pk_live_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk');
      expect(isDev).toBe(false);
    });
  });
});
