import { data, type LoaderFunctionArgs } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { middlewareMigrationWarning } from '../../utils/errors';
import { legacyAuthenticateRequest } from '../legacyAuthenticateRequest';
import { rootAuthLoader } from '../rootAuthLoader';

vi.mock('../legacyAuthenticateRequest', () => {
  return {
    legacyAuthenticateRequest: vi.fn().mockResolvedValue({
      toAuth: vi.fn().mockReturnValue({ userId: 'user_xxx' }),
      headers: new Headers(),
      status: 'signed-in',
    }),
  };
});

describe('rootAuthLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_SECRET_KEY = 'sk_test_...';
  });

  describe('with middleware context', () => {
    const mockContext = {
      get: vi.fn().mockReturnValue({
        toAuth: vi.fn().mockReturnValue({ userId: 'user_xxx' }),
      }),
      set: vi.fn(),
    };

    const args = {
      context: mockContext,
      request: new Request('http://clerk.com'),
    } as LoaderFunctionArgs;

    it('should not call legacyAuthenticateRequest when middleware context exists', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await rootAuthLoader(args, () => ({ data: 'test' }));

      expect(legacyAuthenticateRequest).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should handle no callback - returns clerkState only', async () => {
      const result = await rootAuthLoader(args);

      expect(result).toHaveProperty('clerkState');
      expect(legacyAuthenticateRequest).not.toHaveBeenCalled();
    });

    it('should handle callback returning a Response', async () => {
      const mockResponse = new Response(JSON.stringify({ message: 'Hello' }), {
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await rootAuthLoader(args, () => mockResponse);

      expect(result).toBeInstanceOf(Response);
      const json = await result.json();
      expect(json).toHaveProperty('message', 'Hello');
      expect(json).toHaveProperty('clerkState');
      expect(legacyAuthenticateRequest).not.toHaveBeenCalled();
    });

    it('should handle callback returning data() format', async () => {
      const result = await rootAuthLoader(args, () => data({ message: 'Hello from data()' }));

      expect(result).toBeInstanceOf(Response);
      const response = result as unknown as Response;
      expect(await response.json()).toHaveProperty('message', 'Hello from data()');
      expect(legacyAuthenticateRequest).not.toHaveBeenCalled();
    });

    it('should handle callback returning plain object', async () => {
      const nonCriticalData = new Promise(res => setTimeout(() => res('non-critical'), 5000));
      const plainObject = { message: 'Hello from plain object', nonCriticalData };

      const result = await rootAuthLoader(args, () => plainObject);

      expect(result).toHaveProperty('message', 'Hello from plain object');
      expect(result).toHaveProperty('nonCriticalData', nonCriticalData);
      expect(result).toHaveProperty('clerkState');
      expect(legacyAuthenticateRequest).not.toHaveBeenCalled();
    });

    it('should handle callback returning null', async () => {
      const result = await rootAuthLoader(args, () => null);

      expect(result).toHaveProperty('clerkState');
      expect(legacyAuthenticateRequest).not.toHaveBeenCalled();
    });
  });

  describe('without middleware context (legacy path)', () => {
    const mockContext = {
      get: vi.fn().mockReturnValue(null),
    };

    const args = {
      context: mockContext,
      request: new Request('http://clerk.com'),
    } as LoaderFunctionArgs;

    it('should call legacyAuthenticateRequest when middleware context is missing', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await rootAuthLoader(args, () => ({ data: 'test' }));

      expect(legacyAuthenticateRequest).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(middlewareMigrationWarning);

      consoleWarnSpy.mockRestore();
    });

    it('should handle no callback in legacy mode', async () => {
      const result = await rootAuthLoader(args);

      expect(result).toBeInstanceOf(Response);
      expect(legacyAuthenticateRequest).toHaveBeenCalled();
    });

    it('should handle callback returning Response in legacy mode', async () => {
      const mockResponse = new Response(JSON.stringify({ message: 'Hello' }));

      const result = await rootAuthLoader(args, () => mockResponse);

      expect(result).toBeInstanceOf(Response);
      expect(legacyAuthenticateRequest).toHaveBeenCalled();
    });

    it('should handle callback returning data() format in legacy mode', async () => {
      const result = await rootAuthLoader(args, () => data({ message: 'Hello from data()' }));

      expect(result).toBeInstanceOf(Response);
      expect(legacyAuthenticateRequest).toHaveBeenCalled();
    });

    it('should handle callback returning plain object in legacy mode', async () => {
      const nonCriticalData = new Promise(res => setTimeout(() => res('non-critical'), 5000));
      const plainObject = { message: 'Hello from plain object', nonCriticalData };

      const result = await rootAuthLoader(args, () => plainObject);

      expect(result).toBeInstanceOf(Response);
      const response = result as unknown as Response;
      const json = await response.json();
      expect(json).toHaveProperty('message', 'Hello from plain object');
      expect(json).toHaveProperty('nonCriticalData', {}); // serialized to {}
      expect(json).toHaveProperty('clerkState');
      expect(legacyAuthenticateRequest).toHaveBeenCalled();
    });

    it('should handle callback returning null in legacy mode', async () => {
      const result = await rootAuthLoader(args, () => null);

      expect(result).toBeInstanceOf(Response);
      const response = result as unknown as Response;
      const json = await response.json();
      expect(json).toHaveProperty('clerkState');
      expect(legacyAuthenticateRequest).toHaveBeenCalled();
    });
  });
});
