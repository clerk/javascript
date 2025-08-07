import type { TelemetryEventRaw } from '@clerk/types';

import {
  eventComponentMounted,
  eventPrebuiltComponentMounted,
  eventPrebuiltComponentOpened,
} from '../telemetry/events/component-mounted';

describe('Component-mounted telemetry events', () => {
  beforeEach(() => {
    // Clean up any existing window mock
    delete (global as any).window;
  });

  describe('eventPrebuiltComponentMounted', () => {
    test('uses default sampling rate when not in keyless mode', () => {
      (global as any).window = {};

      const event = eventPrebuiltComponentMounted('SignIn');

      expect(event.eventSamplingRate).toBe(0.1);
    });

    test('boosts sampling rate to 1.0 when in keyless mode', () => {
      (global as any).window = {
        __clerk_keyless: true,
      };

      const event = eventPrebuiltComponentMounted('SignIn');

      expect(event.eventSamplingRate).toBe(1.0);
    });

    test('respects explicit sampling rate override even in keyless mode', () => {
      (global as any).window = {
        __clerk_keyless: true,
      };

      const event = eventPrebuiltComponentMounted('SignIn', {}, {}, 0.5);

      expect(event.eventSamplingRate).toBe(0.5);
    });

    test('works in server environment without window object', () => {
      delete (global as any).window;

      const event = eventPrebuiltComponentMounted('SignIn');

      expect(event.eventSamplingRate).toBe(0.1);
    });

    test('ignores non-boolean keyless flag', () => {
      (global as any).window = {
        __clerk_keyless: 'true', // string instead of boolean
      };

      const event = eventPrebuiltComponentMounted('SignIn');

      expect(event.eventSamplingRate).toBe(0.1);
    });
  });

  describe('eventPrebuiltComponentOpened', () => {
    test('uses default sampling rate when not in keyless mode', () => {
      (global as any).window = {};

      const event = eventPrebuiltComponentOpened('GoogleOneTap');

      expect(event.eventSamplingRate).toBe(0.1);
    });

    test('boosts sampling rate to 1.0 when in keyless mode', () => {
      (global as any).window = {
        __clerk_keyless: true,
      };

      const event = eventPrebuiltComponentOpened('GoogleOneTap');

      expect(event.eventSamplingRate).toBe(1.0);
    });

    test('respects explicit sampling rate override even in keyless mode', () => {
      (global as any).window = {
        __clerk_keyless: true,
      };

      const event = eventPrebuiltComponentOpened('GoogleOneTap', {}, {}, 0.25);

      expect(event.eventSamplingRate).toBe(0.25);
    });
  });

  describe('eventComponentMounted', () => {
    test('uses default sampling rate when not in keyless mode', () => {
      (global as any).window = {};

      const event = eventComponentMounted('CustomComponent');

      expect(event.eventSamplingRate).toBe(0.1);
    });

    test('boosts sampling rate to 1.0 when in keyless mode', () => {
      (global as any).window = {
        __clerk_keyless: true,
      };

      const event = eventComponentMounted('CustomComponent');

      expect(event.eventSamplingRate).toBe(1.0);
    });

    test('respects explicit sampling rate override even in keyless mode', () => {
      (global as any).window = {
        __clerk_keyless: true,
      };

      const event = eventComponentMounted('CustomComponent', {}, 0.75);

      expect(event.eventSamplingRate).toBe(0.75);
    });

    test('includes component name and props in payload', () => {
      (global as any).window = {};

      const event = eventComponentMounted('MyComponent', { custom: 'data' });

      expect(event.payload).toMatchObject({
        component: 'MyComponent',
        custom: 'data',
      });
    });
  });

  describe('payload structure', () => {
    test('eventPrebuiltComponentMounted includes appearance tracking', () => {
      (global as any).window = {};

      const event = eventPrebuiltComponentMounted('SignIn', {
        appearance: {
          baseTheme: 'dark',
          elements: { card: 'custom' },
          variables: { colorPrimary: 'blue' },
        },
      });

      expect(event.payload).toMatchObject({
        component: 'SignIn',
        appearanceProp: true,
        baseTheme: true,
        elements: true,
        variables: true,
      });
    });

    test('eventPrebuiltComponentMounted tracks absence of appearance props', () => {
      (global as any).window = {};

      const event = eventPrebuiltComponentMounted('SignIn', {});

      expect(event.payload).toMatchObject({
        component: 'SignIn',
        appearanceProp: false,
        baseTheme: false,
        elements: false,
        variables: false,
      });
    });

    test('includes additional payload data', () => {
      (global as any).window = {};

      const event = eventPrebuiltComponentMounted('SignIn', {}, { customData: 'test' });

      expect(event.payload).toMatchObject({
        component: 'SignIn',
        customData: 'test',
      });
    });
  });
});
