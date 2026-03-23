import { describe, expect, it } from 'vitest';

import { ui } from '../index';
import { ui as serverUi } from '../server';

describe('module exports', () => {
  describe('default export (index.ts)', () => {
    it('should have the expected shape', () => {
      expect(Object.keys(ui).sort()).toMatchSnapshot();
    });

    it('should include __brand marker', () => {
      expect((ui as any).__brand).toBe('__clerkUI');
    });

    it('should include ClerkUI constructor', () => {
      expect((ui as any).ClerkUI).toBeDefined();
      expect(typeof (ui as any).ClerkUI).toBe('function');
    });

    it('should include version', () => {
      expect((ui as any).version).toBeDefined();
      expect(typeof (ui as any).version).toBe('string');
    });
  });

  describe('server export (server.ts)', () => {
    it('should have the expected shape', () => {
      expect(Object.keys(serverUi).sort()).toMatchSnapshot();
    });

    it('should include __brand marker', () => {
      expect((serverUi as any).__brand).toBe('__clerkUI');
    });

    it('should include ClerkUI constructor for RSC client reference', () => {
      expect((serverUi as any).ClerkUI).toBeDefined();
      expect(typeof (serverUi as any).ClerkUI).toBe('function');
    });

    it('should include version', () => {
      expect((serverUi as any).version).toBeDefined();
      expect(typeof (serverUi as any).version).toBe('string');
    });
  });
});
