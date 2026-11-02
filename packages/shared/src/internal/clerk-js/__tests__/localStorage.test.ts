import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SafeLocalStorage } from '../localStorage';

describe('SafeLocalStorage', () => {
  let mockStorage: { [key: string]: string } = {};

  beforeEach(() => {
    mockStorage = {};

    // Create a mock implementation of localStorage
    const localStorageMock = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
    };

    // Replace window.localStorage with our mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    mockStorage = {};
    vi.restoreAllMocks();
  });

  describe('setItem', () => {
    it('stores value with clerk prefix', () => {
      SafeLocalStorage.setItem('test', 'value');
      expect(mockStorage['__clerk_test']).toBeDefined();
      const parsed = JSON.parse(mockStorage['__clerk_test']);
      expect(parsed.value).toBe('value');
    });

    it('handles localStorage errors gracefully', () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          setItem: () => {
            throw new Error('Storage full');
          },
        },
        writable: true,
      });

      expect(() => {
        SafeLocalStorage.setItem('test', 'value');
      }).not.toThrow();
    });

    it('sets expiration when provided', () => {
      vi.useFakeTimers();
      const now = Date.now();
      SafeLocalStorage.setItem('test', 'value', 1000);

      const stored = JSON.parse(mockStorage['__clerk_test']);
      expect(stored.exp).toBe(now + 1000);
      vi.useRealTimers();
    });

    it('stores complex objects correctly', () => {
      const complexObject = { foo: 'bar', nested: { value: 42 } };
      SafeLocalStorage.setItem('complex', complexObject);
      const stored = JSON.parse(mockStorage['__clerk_complex']);
      expect(stored.value).toEqual(complexObject);
    });

    it('does not set expiration when not provided', () => {
      SafeLocalStorage.setItem('test', 'value');
      const stored = JSON.parse(mockStorage['__clerk_test']);
      expect(stored.exp).toBeUndefined();
    });
  });

  describe('getItem', () => {
    it('retrieves stored value', () => {
      SafeLocalStorage.setItem('test', 'value');
      expect(SafeLocalStorage.getItem('test', 'default')).toBe('value');
    });

    it('retrieves stored value when not expired', () => {
      SafeLocalStorage.setItem('test', 'value', 1_000);
      expect(SafeLocalStorage.getItem('test', 'default')).toBe('value');
    });

    it('returns default value when key not found', () => {
      expect(SafeLocalStorage.getItem('nonexistent', 'default')).toBe('default');
    });

    it('handles localStorage errors by returning default value', () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => {
            throw new Error('Storage error');
          },
        },
        writable: true,
      });

      expect(SafeLocalStorage.getItem('test', 'default')).toBe('default');
    });

    it('returns default value and removes item when expired', () => {
      vi.useFakeTimers();
      SafeLocalStorage.setItem('test', 'value', 1_000);

      // Advance time beyond expiration
      vi.advanceTimersByTime(1_001);

      expect(SafeLocalStorage.getItem('test', 'default')).toBe('default');
      expect(mockStorage['__clerk_test']).toBeUndefined();
      vi.useRealTimers();
    });

    it('handles malformed JSON data by returning default value', () => {
      mockStorage['__clerk_malformed'] = 'not-json-data';
      expect(SafeLocalStorage.getItem('malformed', 'default')).toBe('default');
    });

    it('handles empty stored value by returning default', () => {
      mockStorage['__clerk_empty'] = JSON.stringify({ value: null });
      expect(SafeLocalStorage.getItem('empty', 'default')).toBe('default');
    });

    it('retrieves complex objects correctly', () => {
      const complexObject = { foo: 'bar', nested: { value: 42 } };
      SafeLocalStorage.setItem('complex', complexObject);
      expect(SafeLocalStorage.getItem('complex', {})).toEqual(complexObject);
    });

    it('handles edge case with zero as stored value', () => {
      SafeLocalStorage.setItem('zero', 0);
      expect(SafeLocalStorage.getItem('zero', 1)).toBe(0);
    });
  });

  describe('removeItem', () => {
    it('removes item with clerk prefix', () => {
      SafeLocalStorage.setItem('test', 'value');
      expect(mockStorage['__clerk_test']).toBeDefined();
      SafeLocalStorage.removeItem('test');
      expect(mockStorage['__clerk_test']).toBeUndefined();
    });

    it('handles localStorage errors gracefully', () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          removeItem: () => {
            throw new Error('Storage error');
          },
        },
        writable: true,
      });

      expect(() => {
        SafeLocalStorage.removeItem('test');
      }).not.toThrow();
    });

    it('does nothing when removing non-existent item', () => {
      SafeLocalStorage.removeItem('nonexistent');
      expect(mockStorage['__clerk_nonexistent']).toBeUndefined();
    });
  });
});
