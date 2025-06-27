import { clearCache, cssSupports } from '../cssSupports';

// Mock CSS.supports
const originalCSSSupports = CSS.supports;

beforeAll(() => {
  CSS.supports = jest.fn(feature => {
    if (feature === 'hsl(from white h s l)') return true;
    if (feature === 'color-mix(in srgb, white, black)') return false;
    return false;
  });
});

afterAll(() => {
  CSS.supports = originalCSSSupports;
});

beforeEach(() => {
  clearCache();
  (CSS.supports as jest.Mock).mockClear();
});

describe('cssSupports', () => {
  test('relativeColorSyntax should return true when supported', () => {
    expect(cssSupports.relativeColorSyntax()).toBe(true);
  });

  test('colorMix should return false when not supported', () => {
    expect(cssSupports.colorMix()).toBe(false);
  });

  test('modernColor should return true when at least one feature is supported', () => {
    expect(cssSupports.modernColor()).toBe(true);
  });

  test('caching works correctly', () => {
    cssSupports.relativeColorSyntax();
    expect(CSS.supports).toHaveBeenCalledTimes(1);
    cssSupports.relativeColorSyntax();
    expect(CSS.supports).toHaveBeenCalledTimes(1); // Should not call again due to caching
  });
});
