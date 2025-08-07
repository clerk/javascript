import type { TelemetryEventRaw } from '@clerk/types';

import {
  eventComponentMounted,
  eventPrebuiltComponentMounted,
  eventPrebuiltComponentOpened,
} from '../telemetry/events/component-mounted';

describe('Component-mounted telemetry events', () => {
  describe('eventPrebuiltComponentMounted', () => {
    test('uses default sampling rate', () => {
      const event = eventPrebuiltComponentMounted('SignIn');

      expect(event.eventSamplingRate).toBe(0.1);
    });

    test('respects explicit sampling rate override', () => {
      const event = eventPrebuiltComponentMounted('SignIn', {}, {}, 0.5);

      expect(event.eventSamplingRate).toBe(0.5);
    });
  });

  describe('eventPrebuiltComponentOpened', () => {
    test('uses default sampling rate', () => {
      const event = eventPrebuiltComponentOpened('GoogleOneTap');

      expect(event.eventSamplingRate).toBe(0.1);
    });

    test('respects explicit sampling rate override', () => {
      const event = eventPrebuiltComponentOpened('GoogleOneTap', {}, {}, 0.25);

      expect(event.eventSamplingRate).toBe(0.25);
    });
  });

  describe('eventComponentMounted', () => {
    test('uses default sampling rate', () => {
      const event = eventComponentMounted('CustomComponent');

      expect(event.eventSamplingRate).toBe(0.1);
    });

    test('respects explicit sampling rate override', () => {
      const event = eventComponentMounted('CustomComponent', {}, 0.75);

      expect(event.eventSamplingRate).toBe(0.75);
    });

    test('includes component name and props in payload', () => {
      const event = eventComponentMounted('MyComponent', { custom: 'data' });

      expect(event.payload).toMatchObject({
        component: 'MyComponent',
        custom: 'data',
      });
    });
  });

  describe('payload structure', () => {
    test('eventPrebuiltComponentMounted includes appearance tracking', () => {
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
      const event = eventPrebuiltComponentMounted('SignIn', {}, { customData: 'test' });

      expect(event.payload).toMatchObject({
        component: 'SignIn',
        customData: 'test',
      });
    });
  });
});
