import { describe, expect, it } from 'vitest';

import { js } from '../bundled';
import { js as serverJs } from '../server';

describe('module exports', () => {
  describe('bundled export (bundled.ts)', () => {
    it('should have the expected shape', () => {
      expect(Object.keys(js).sort()).toMatchSnapshot();
    });

    it('should include __brand marker', () => {
      expect((js as any).__brand).toBe('__clerkJS');
    });

    it('should include ClerkJS constructor', () => {
      expect((js as any).ClerkJS).toBeDefined();
      expect(typeof (js as any).ClerkJS).toBe('function');
    });

    it('should include version', () => {
      expect((js as any).version).toBeDefined();
      expect(typeof (js as any).version).toBe('string');
    });
  });

  describe('server export (server.ts)', () => {
    it('should have the expected shape', () => {
      expect(Object.keys(serverJs).sort()).toMatchSnapshot();
    });

    it('should include __brand marker', () => {
      expect((serverJs as any).__brand).toBe('__clerkJS');
    });

    it('should NOT include ClerkJS constructor', () => {
      expect((serverJs as any).ClerkJS).toBeUndefined();
    });

    it('should include version', () => {
      expect((serverJs as any).version).toBeDefined();
      expect(typeof (serverJs as any).version).toBe('string');
    });
  });
});
