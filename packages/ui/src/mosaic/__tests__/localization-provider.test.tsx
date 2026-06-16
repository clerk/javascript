import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import frMessages from '../locales/fr.json';
import { MosaicProvider } from '../providers/mosaic-provider';
import { useMessages } from '../providers/localization-provider';

const base = { title: 'Organization Profile', tab: { general: 'General', members: 'Members' } };

describe('LocalizationProvider overrides', () => {
  it('override wins over French translation when both locale and overrides are set', () => {
    const { result } = renderHook(() => useMessages('organizationProfile', base), {
      wrapper: ({ children }) =>
        React.createElement(
          MosaicProvider,
          {
            localization: {
              locale: 'fr',
              initialMessages: { fr: frMessages },
              overrides: { 'organizationProfile.title': 'test' },
            },
          },
          children,
        ),
    });
    expect(result.current.title).toBe('test');
    // Non-overridden key still resolves from the French bundle
    expect((result.current.tab as Record<string, unknown>).general).toBe('Général');
  });
});
