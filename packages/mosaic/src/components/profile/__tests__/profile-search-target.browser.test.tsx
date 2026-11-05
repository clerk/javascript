import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { SearchTarget } from '../profile-search-target';

afterEach(() => cleanup());

it('keeps the styles of the element passed as `render`', () => {
  render(
    <>
      <style>{'@layer app { .usage-card { padding: 16px; margin: 8px; } }'}</style>
      <SearchTarget
        id='rate-limits'
        render={<section className='usage-card' />}
      >
        Rate limits
      </SearchTarget>
    </>,
  );

  const target = getComputedStyle(screen.getByText('Rate limits'));
  expect(target.padding).toBe('16px');
  expect(target.margin).toBe('8px');
});
