import { describe, expect, it } from 'vitest';

import { EVENT_SAMPLING_RATE, EVENT_THEME_USAGE, eventThemeUsage } from '../theme-usage';

describe('eventThemeUsage', () => {
  it('should create telemetry event with shadcn theme name', () => {
    const appearance = {
      theme: {
        __type: 'prebuilt_appearance' as const,
        name: 'shadcn',
        variables: { colorPrimary: 'var(--primary)' },
      },
    };

    const result = eventThemeUsage(appearance);

    expect(result).toEqual({
      event: EVENT_THEME_USAGE,
      eventSamplingRate: EVENT_SAMPLING_RATE,
      payload: { themeName: 'shadcn' },
    });
  });

  it('should handle string themes', () => {
    const appearance = {
      theme: 'clerk' as any, // String themes are valid at runtime
    };

    const result = eventThemeUsage(appearance);

    expect(result).toEqual({
      event: EVENT_THEME_USAGE,
      eventSamplingRate: EVENT_SAMPLING_RATE,
      payload: { themeName: 'clerk' },
    });
  });

  it('should handle array of themes', () => {
    const appearance = {
      theme: [
        'clerk' as any, // String themes are valid at runtime
        {
          __type: 'prebuilt_appearance' as const,
          name: 'shadcn',
        },
      ] as any,
    };

    const result = eventThemeUsage(appearance);

    expect(result).toEqual({
      event: EVENT_THEME_USAGE,
      eventSamplingRate: EVENT_SAMPLING_RATE,
      payload: { themeName: 'clerk' },
    });
  });

  it('should handle themes without explicit names', () => {
    const appearance = {
      theme: {
        __type: 'prebuilt_appearance' as const,
        variables: { colorPrimary: 'blue' },
      },
    };

    const result = eventThemeUsage(appearance);

    expect(result).toEqual({
      event: EVENT_THEME_USAGE,
      eventSamplingRate: EVENT_SAMPLING_RATE,
      payload: { themeName: undefined },
    });
  });

  it('should handle undefined appearance', () => {
    const result = eventThemeUsage();

    expect(result).toEqual({
      event: EVENT_THEME_USAGE,
      eventSamplingRate: EVENT_SAMPLING_RATE,
      payload: {},
    });
  });

  it('should handle null appearance', () => {
    const result = eventThemeUsage(null as any);

    expect(result).toEqual({
      event: EVENT_THEME_USAGE,
      eventSamplingRate: EVENT_SAMPLING_RATE,
      payload: {},
    });
  });
});
