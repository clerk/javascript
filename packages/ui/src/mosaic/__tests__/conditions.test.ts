import { describe, expect, it } from 'vitest';

import { conditions, expandConditions } from '../conditions';

describe('expandConditions', () => {
  it('rewrites _hover into an @media (hover: hover) + &:hover block', () => {
    expect(expandConditions({ _hover: { color: 'red' } })).toEqual({
      '@media (hover: hover)': { '&:hover': { color: 'red' } },
    });
  });

  it('maps each built-in condition to its selector chain', () => {
    expect(expandConditions({ _focusVisible: { outline: '2px' } })).toEqual({
      '&:focus-visible': { outline: '2px' },
    });
    expect(expandConditions({ _disabled: { opacity: 0.5 } })).toEqual({
      '&[data-cl-disabled]': { opacity: 0.5 },
    });
    expect(expandConditions({ _invalid: { borderColor: 'red' } })).toEqual({
      '&[aria-invalid="true"]': { borderColor: 'red' },
    });
    expect(expandConditions({ _motionSafe: { transition: 'all 0.2s' } })).toEqual({
      '@media (prefers-reduced-motion: no-preference)': { transition: 'all 0.2s' },
    });
  });

  it('merges a condition into a raw selector that resolves to the same wrapper', () => {
    expect(
      expandConditions({
        '@media (hover: hover)': { '&:focus': { color: 'blue' } },
        _hover: { color: 'red' },
      }),
    ).toEqual({
      '@media (hover: hover)': {
        '&:focus': { color: 'blue' },
        '&:hover': { color: 'red' },
      },
    });
  });

  it('expands nested conditions recursively', () => {
    expect(expandConditions({ _disabled: { _hover: { color: 'red' } } })).toEqual({
      '&[data-cl-disabled]': {
        '@media (hover: hover)': { '&:hover': { color: 'red' } },
      },
    });
  });

  it('leaves raw selectors and plain CSS properties untouched', () => {
    expect(
      expandConditions({
        color: 'red',
        padding: 4,
        '&:active': { color: 'blue' },
      }),
    ).toEqual({
      color: 'red',
      padding: 4,
      '&:active': { color: 'blue' },
    });
  });

  it('exposes the underscore-prefixed condition vocabulary', () => {
    expect(Object.keys(conditions)).toEqual(
      expect.arrayContaining(['_hover', '_focusVisible', '_active', '_disabled', '_invalid', '_motionSafe']),
    );
  });
});
