/**
 * Tests for ClerkSharedWorkerManager
 */

import { ClerkSharedWorkerManager } from '../sharedWorker';
import { createInlineSharedWorker } from '../createInlineSharedWorker';

// Mock SharedWorker since it's not available in Node.js test environment
class MockSharedWorker implements SharedWorker {
  public port: MockMessagePort;
  public onerror: ((this: SharedWorker, ev: ErrorEvent) => any) | null = null;

  constructor(scriptURL: string | URL, options?: string | WorkerOptions) {
    this.port = new MockMessagePort();
  }
}

class MockMessagePort implements MessagePort {
  public onmessage: ((this: MessagePort, ev: MessageEvent) => any) | null = null;
  public onmessageerror: ((this: MessagePort, ev: MessageEvent) => any) | null = null;

  postMessage(message: any, transfer?: Transferable[]): void {
    // Mock implementation
  }

  start(): void {
    // Mock implementation
  }

  close(): void {
    // Mock implementation
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    // Mock implementation
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    // Mock implementation
  }

  dispatchEvent(event: Event): boolean {
    return true;
  }
}

// Mock global SharedWorker
(global as any).SharedWorker = MockSharedWorker;
(global as any).window = {};

describe('ClerkSharedWorkerManager', () => {
  let manager: ClerkSharedWorkerManager;
  const mockOptions = {
    scriptUrl: '/test-worker.js',
    enabled: true,
    autoStart: true,
  };

  beforeEach(() => {
    manager = new ClerkSharedWorkerManager(mockOptions, 'test-instance-id');
  });

  afterEach(() => {
    if (manager) {
      manager.terminate();
    }
  });

  test('should create manager with options', () => {
    expect(manager).toBeDefined();
    expect(manager.isActive()).toBe(false);
  });

  test('should initialize SharedWorker when supported', async () => {
    const worker = await manager.initialize();
    expect(worker).toBeInstanceOf(MockSharedWorker);
    expect(manager.isActive()).toBe(true);
  });

  test('should handle inline worker creation', async () => {
    const inlineManager = new ClerkSharedWorkerManager(
      {
        useInline: true,
        enabled: true,
      },
      'test-inline-id',
    );

    const worker = await inlineManager.initialize();
    expect(worker).toBeInstanceOf(MockSharedWorker);
    expect(inlineManager.isActive()).toBe(true);

    inlineManager.terminate();
  });

  test('should post messages to worker', async () => {
    const worker = await manager.initialize();
    expect(worker).toBeDefined();

    // Test posting a message (should not throw)
    expect(() => {
      manager.postMessage({ type: 'test', data: 'hello' });
    }).not.toThrow();
  });

  test('should post Clerk events', async () => {
    await manager.initialize();

    expect(() => {
      manager.postClerkEvent('clerk:test_event', { user: 'test-user' });
    }).not.toThrow();
  });

  test('should terminate worker properly', async () => {
    await manager.initialize();
    expect(manager.isActive()).toBe(true);

    manager.terminate();
    expect(manager.isActive()).toBe(false);
  });

  test('should return null when SharedWorker is not supported', async () => {
    // Temporarily remove SharedWorker support
    const originalSharedWorker = (global as any).SharedWorker;
    delete (global as any).SharedWorker;

    const unsupportedManager = new ClerkSharedWorkerManager(mockOptions, 'test-unsupported');
    const worker = await unsupportedManager.initialize();

    expect(worker).toBeNull();

    // Restore SharedWorker
    (global as any).SharedWorker = originalSharedWorker;
  });

  test('should return null when disabled', async () => {
    const disabledManager = new ClerkSharedWorkerManager(
      {
        ...mockOptions,
        enabled: false,
      },
      'test-disabled',
    );

    const worker = await disabledManager.initialize();
    expect(worker).toBeNull();
  });
});

describe('createInlineSharedWorker', () => {
  test('should create a blob URL for inline worker', () => {
    // Mock URL.createObjectURL
    const mockCreateObjectURL = jest.fn().mockReturnValue('blob:test-url');
    global.URL.createObjectURL = mockCreateObjectURL;

    // Mock Blob constructor
    global.Blob = jest.fn().mockImplementation(() => ({})) as any;

    const blobUrl = createInlineSharedWorker();

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(blobUrl).toBe('blob:test-url');
  });
});
