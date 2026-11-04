// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { Select } from './index';

describe('Select SSR', () => {
  it('renders on the server without warnings', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderToString(
      <Select.Root items={[{ label: 'Apple', value: 'apple' }]}>
        <Select.Trigger>
          <Select.Value placeholder='Pick a fruit...' />
        </Select.Trigger>
      </Select.Root>,
    );

    expect(error).not.toHaveBeenCalled();
  });
});
