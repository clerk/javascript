import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the dependencies before importing the module
vi.mock('@clerk/shared/logger', () => ({
  logger: {
    warnOnce: vi.fn(),
  },
}));

vi.mock('../detectClerkStylesheetUsage', () => ({
  detectStructuralClerkCss: vi.fn(() => []),
}));

import { logger } from '@clerk/shared/logger';

import { detectStructuralClerkCss } from '../detectClerkStylesheetUsage';
import { warnAboutCustomizationWithoutPinning } from '../warnAboutCustomizationWithoutPinning';

describe('warnAboutCustomizationWithoutPinning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(detectStructuralClerkCss).mockReturnValue([]);
  });

  describe('version pinning check', () => {
    test('does not warn when ui is provided (version is pinned)', () => {
      warnAboutCustomizationWithoutPinning({
        ui: { version: '1.0.0' } as any,
        appearance: {
          elements: { card: { '& > div': { color: 'red' } } },
        },
      });

      expect(logger.warnOnce).not.toHaveBeenCalled();
    });

    test('warns when ui is not provided and structural customization is used', () => {
      warnAboutCustomizationWithoutPinning({
        appearance: {
          elements: { card: { '& > div': { color: 'red' } } },
        },
      });

      expect(logger.warnOnce).toHaveBeenCalledTimes(1);
    });

    test('still warns when clerkUiCtor is provided without ui (CDN scenario)', () => {
      // clerkUiCtor is always set when loading from CDN, but ui is only set
      // when the user explicitly imports @clerk/ui
      warnAboutCustomizationWithoutPinning({
        clerkUiCtor: class MockClerkUi {} as any,
        appearance: {
          elements: { card: { '& > div': { color: 'red' } } },
        },
      });

      expect(logger.warnOnce).toHaveBeenCalledTimes(1);
    });
  });

  describe('appearance.elements - should NOT warn', () => {
    test('when elements is undefined', () => {
      warnAboutCustomizationWithoutPinning({});

      expect(logger.warnOnce).not.toHaveBeenCalled();
    });

    test('when elements is empty', () => {
      warnAboutCustomizationWithoutPinning({ appearance: { elements: {} } });

      expect(logger.warnOnce).not.toHaveBeenCalled();
    });

    test('for simple className string values', () => {
      warnAboutCustomizationWithoutPinning({
        appearance: {
          elements: {
            card: 'my-custom-card',
            button: 'my-custom-button',
          },
        },
      });

      expect(logger.warnOnce).not.toHaveBeenCalled();
    });

    test('for simple CSS object without nested selectors', () => {
      warnAboutCustomizationWithoutPinning({
        appearance: {
          elements: {
            card: { backgroundColor: 'red', padding: '10px' },
            button: { color: 'blue' },
          },
        },
      });

      expect(logger.warnOnce).not.toHaveBeenCalled();
    });

    test('for &:hover pseudo-class (non-structural)', () => {
      warnAboutCustomizationWithoutPinning({
        appearance: {
          elements: {
            button: {
              '&:hover': { opacity: 0.8 },
              '&:focus': { outline: '2px solid blue' },
            },
          },
        },
      });

      expect(logger.warnOnce).not.toHaveBeenCalled();
    });

    test('for &::before pseudo-element (non-structural)', () => {
      warnAboutCustomizationWithoutPinning({
        appearance: {
          elements: {
            card: {
              '&::before': { content: '""', position: 'absolute' },
            },
          },
        },
      });

      expect(logger.warnOnce).not.toHaveBeenCalled();
    });
  });

  describe('appearance.elements - should warn', () => {
    test('for nested selector with .cl- class reference', () => {
      warnAboutCustomizationWithoutPinning({
        appearance: {
          elements: {
            card: {
              '& .cl-cardContent': { padding: '20px' },
            },
          },
        },
      });

      expect(logger.warnOnce).toHaveBeenCalledTimes(1);
    });

    test('for child combinator with selector', () => {
      warnAboutCustomizationWithoutPinning({
        appearance: {
          elements: {
            card: {
              '& > div': { margin: 0 },
            },
          },
        },
      });

      expect(logger.warnOnce).toHaveBeenCalledTimes(1);
    });

    test('for descendant combinator with class', () => {
      warnAboutCustomizationWithoutPinning({
        appearance: {
          elements: {
            card: {
              '& .inner': { padding: '10px' },
            },
          },
        },
      });

      expect(logger.warnOnce).toHaveBeenCalledTimes(1);
    });

    test('for positional pseudo-selector', () => {
      warnAboutCustomizationWithoutPinning({
        appearance: {
          elements: {
            card: {
              '&:first-child': { marginTop: 0 },
            },
          },
        },
      });

      expect(logger.warnOnce).toHaveBeenCalledTimes(1);
    });

    test('for :nth-child selector', () => {
      warnAboutCustomizationWithoutPinning({
        appearance: {
          elements: {
            item: {
              '&:nth-child(odd)': { backgroundColor: '#f5f5f5' },
            },
          },
        },
      });

      expect(logger.warnOnce).toHaveBeenCalledTimes(1);
    });

    test('for :has() selector', () => {
      warnAboutCustomizationWithoutPinning({
        appearance: {
          elements: {
            card: {
              '&:has(.active)': { borderColor: 'blue' },
            },
          },
        },
      });

      expect(logger.warnOnce).toHaveBeenCalledTimes(1);
    });

    test('for deeply nested structural selectors', () => {
      warnAboutCustomizationWithoutPinning({
        appearance: {
          elements: {
            card: {
              padding: '10px',
              nested: {
                '& > .child': { color: 'red' },
              },
            },
          },
        },
      });

      expect(logger.warnOnce).toHaveBeenCalledTimes(1);
    });

    test('for sibling combinator', () => {
      warnAboutCustomizationWithoutPinning({
        appearance: {
          elements: {
            input: {
              '& + .error': { color: 'red' },
            },
          },
        },
      });

      expect(logger.warnOnce).toHaveBeenCalledTimes(1);
    });
  });

  describe('CSS stylesheet detection integration', () => {
    test('warns when detectStructuralClerkCss returns hits', () => {
      vi.mocked(detectStructuralClerkCss).mockReturnValue([
        {
          stylesheetHref: 'styles.css',
          selector: '.cl-card > div',
          cssText: '.cl-card > div { }',
          reason: ['combinator(>+~)'],
        },
      ]);

      warnAboutCustomizationWithoutPinning({});

      expect(logger.warnOnce).toHaveBeenCalledTimes(1);
    });

    test('warns when both elements and CSS have structural patterns', () => {
      vi.mocked(detectStructuralClerkCss).mockReturnValue([
        {
          stylesheetHref: null,
          selector: '.cl-card .inner',
          cssText: '.cl-card .inner { }',
          reason: ['descendant(combinator)'],
        },
      ]);

      warnAboutCustomizationWithoutPinning({
        appearance: {
          elements: {
            button: { '& > span': { marginLeft: '8px' } },
          },
        },
      });

      // Should only warn once even with multiple structural patterns
      expect(logger.warnOnce).toHaveBeenCalledTimes(1);
    });

    test('does not warn for structural CSS when ui is provided', () => {
      vi.mocked(detectStructuralClerkCss).mockReturnValue([
        {
          stylesheetHref: 'styles.css',
          selector: '.cl-card > div',
          cssText: '.cl-card > div { }',
          reason: ['combinator(>+~)'],
        },
      ]);

      warnAboutCustomizationWithoutPinning({
        ui: { version: '1.0.0' } as any,
      });

      expect(logger.warnOnce).not.toHaveBeenCalled();
    });
  });
});
