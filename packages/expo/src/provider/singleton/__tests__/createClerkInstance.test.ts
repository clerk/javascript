import type { Clerk } from '@clerk/clerk-js';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  return {
    constructorSpy: vi.fn(),
  };
});

vi.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
    },
    NativeModules: {},
    TurboModuleRegistry: {
      get: vi.fn(),
    },
  };
});

class MockClerk {
  public publishableKey: string;
  public proxyUrl: unknown;
  public domain: unknown;

  constructor(publishableKey: string, options?: { proxyUrl?: unknown; domain?: unknown }) {
    this.publishableKey = publishableKey;
    this.proxyUrl = options?.proxyUrl;
    this.domain = options?.domain;
    mocks.constructorSpy(publishableKey, options);
  }

  addListener = vi.fn();
  __internal_onBeforeRequest = vi.fn();
  __internal_onAfterResponse = vi.fn();
}

const loadCreateClerkInstance = async () => {
  const mod = await import('../createClerkInstance');
  return mod.createClerkInstance;
};

describe('createClerkInstance', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test('passes proxyUrl to the native Clerk constructor', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    getClerkInstance({
      publishableKey: 'pk_test_123',
      proxyUrl: 'https://proxy.example.com/api/__clerk',
    });

    expect(mocks.constructorSpy).toHaveBeenCalledWith('pk_test_123', {
      proxyUrl: 'https://proxy.example.com/api/__clerk',
      domain: undefined,
    });
  });

  test('passes domain to the native Clerk constructor', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    getClerkInstance({
      publishableKey: 'pk_test_123',
      domain: 'satellite.example.com',
    });

    expect(mocks.constructorSpy).toHaveBeenCalledWith('pk_test_123', {
      proxyUrl: undefined,
      domain: 'satellite.example.com',
    });
  });

  test('reuses the singleton when the config is unchanged', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    const first = getClerkInstance({
      publishableKey: 'pk_test_123',
      proxyUrl: 'https://proxy.example.com/api/__clerk',
    });
    const second = getClerkInstance({
      publishableKey: 'pk_test_123',
      proxyUrl: 'https://proxy.example.com/api/__clerk',
    });

    expect(first).toBe(second);
    expect(mocks.constructorSpy).toHaveBeenCalledTimes(1);
  });

  test('reuses the singleton when called without options after initialization', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    const first = getClerkInstance({
      publishableKey: 'pk_test_123',
      proxyUrl: 'https://proxy.example.com/api/__clerk',
    });
    const second = getClerkInstance();

    expect(first).toBe(second);
    expect(mocks.constructorSpy).toHaveBeenCalledTimes(1);
  });

  test('recreates the singleton when proxyUrl changes', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    const first = getClerkInstance({
      publishableKey: 'pk_test_123',
      proxyUrl: 'https://proxy-a.example.com/api/__clerk',
    });
    const second = getClerkInstance({
      publishableKey: 'pk_test_123',
      proxyUrl: 'https://proxy-b.example.com/api/__clerk',
    });

    expect(first).not.toBe(second);
    expect(mocks.constructorSpy).toHaveBeenNthCalledWith(2, 'pk_test_123', {
      proxyUrl: 'https://proxy-b.example.com/api/__clerk',
      domain: undefined,
    });
  });

  test('preserves the existing publishable key when only proxyUrl changes', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    getClerkInstance({
      publishableKey: 'pk_test_123',
      proxyUrl: 'https://proxy-a.example.com/api/__clerk',
    });
    getClerkInstance({
      proxyUrl: 'https://proxy-b.example.com/api/__clerk',
    });

    expect(mocks.constructorSpy).toHaveBeenNthCalledWith(2, 'pk_test_123', {
      proxyUrl: 'https://proxy-b.example.com/api/__clerk',
      domain: undefined,
    });
  });

  test('recreates the singleton when proxyUrl is explicitly removed', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    getClerkInstance({
      publishableKey: 'pk_test_123',
      proxyUrl: 'https://proxy.example.com/api/__clerk',
    });
    getClerkInstance({
      proxyUrl: undefined,
    });

    expect(mocks.constructorSpy).toHaveBeenNthCalledWith(2, 'pk_test_123', {
      proxyUrl: undefined,
      domain: undefined,
    });
  });

  test('does not carry proxy config across publishable key changes', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    getClerkInstance({
      publishableKey: 'pk_test_old',
      proxyUrl: 'https://proxy.example.com/api/__clerk',
      domain: 'satellite.example.com',
    });
    getClerkInstance({
      publishableKey: 'pk_test_new',
    });

    expect(mocks.constructorSpy).toHaveBeenNthCalledWith(2, 'pk_test_new', {
      proxyUrl: undefined,
      domain: undefined,
    });
  });

  test('recreates the singleton when domain changes', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    const first = getClerkInstance({
      publishableKey: 'pk_test_123',
      domain: 'satellite-a.example.com',
    });
    const second = getClerkInstance({
      publishableKey: 'pk_test_123',
      domain: 'satellite-b.example.com',
    });

    expect(first).not.toBe(second);
    expect(mocks.constructorSpy).toHaveBeenNthCalledWith(2, 'pk_test_123', {
      proxyUrl: undefined,
      domain: 'satellite-b.example.com',
    });
  });

  test('recreates the singleton when domain is explicitly removed', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    getClerkInstance({
      publishableKey: 'pk_test_123',
      domain: 'satellite.example.com',
    });
    getClerkInstance({
      domain: undefined,
    });

    expect(mocks.constructorSpy).toHaveBeenNthCalledWith(2, 'pk_test_123', {
      proxyUrl: undefined,
      domain: undefined,
    });
  });
});
