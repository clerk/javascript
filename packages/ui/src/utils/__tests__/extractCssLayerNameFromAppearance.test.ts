import { describe, expect, it } from 'vitest';

import { extractCssLayerNameFromAppearance } from '../extractCssLayerNameFromAppearance';

describe('extractCssLayerNameFromAppearance', () => {
  it('promotes cssLayerName from a single theme to the appearance level', () => {
    const theme = {
      name: 'shadcn',
      cssLayerName: 'components',
      variables: {},
      elements: {},
      __type: 'prebuilt_appearance' as const,
    };

    const result = extractCssLayerNameFromAppearance({ theme });

    expect(result?.cssLayerName).toBe('components');
  });

  it('promotes cssLayerName from a theme array to the appearance level', () => {
    const theme = {
      name: 'shadcn',
      cssLayerName: 'components',
      variables: {},
      elements: {},
      __type: 'prebuilt_appearance' as const,
    };

    const result = extractCssLayerNameFromAppearance({ theme: [theme] });

    expect(result?.cssLayerName).toBe('components');
  });

  it('preserves explicit cssLayerName on appearance over theme cssLayerName', () => {
    const theme = {
      name: 'shadcn',
      cssLayerName: 'components',
      variables: {},
      elements: {},
      __type: 'prebuilt_appearance' as const,
    };

    const result = extractCssLayerNameFromAppearance({ theme, cssLayerName: 'custom' });

    expect(result?.cssLayerName).toBe('custom');
  });

  it('returns appearance unchanged when no theme is present', () => {
    const appearance = { cssLayerName: 'custom' };
    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result).toEqual(appearance);
  });

  it('returns undefined for undefined input', () => {
    expect(extractCssLayerNameFromAppearance(undefined)).toBeUndefined();
  });

  it('persists cssLayerName when appearance is re-extracted after an updateProps-style state merge', () => {
    const theme = {
      name: 'shadcn',
      cssLayerName: 'components',
      variables: {},
      elements: {},
      __type: 'prebuilt_appearance' as const,
    };

    // Initial mount: cssLayerName is extracted to appearance level
    const initialAppearance = extractCssLayerNameFromAppearance({ theme });
    expect(initialAppearance?.cssLayerName).toBe('components');

    // ClerkProvider re-renders and sends raw appearance (cssLayerName only inside theme)
    const rawAppearance = { theme };

    // updateProps must re-extract before merging into state
    const reExtracted = extractCssLayerNameFromAppearance(rawAppearance);
    expect(reExtracted?.cssLayerName).toBe('components');
  });

  it('respects a new cssLayerName passed via updateProps', () => {
    const theme = {
      name: 'shadcn',
      cssLayerName: 'components',
      variables: {},
      elements: {},
      __type: 'prebuilt_appearance' as const,
    };

    // User changes cssLayerName at the appearance level
    const updatedAppearance = { theme, cssLayerName: 'utilities' };
    const result = extractCssLayerNameFromAppearance(updatedAppearance);

    // Explicit appearance-level cssLayerName takes precedence over theme
    expect(result?.cssLayerName).toBe('utilities');
  });
});
