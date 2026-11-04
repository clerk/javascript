// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { Autocomplete } from './index';

describe('Autocomplete SSR', () => {
  it('renders on the server without warnings', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderToString(
      <Autocomplete.Root>
        <Autocomplete.Input aria-label='Fruit' />
      </Autocomplete.Root>,
    );

    expect(error).not.toHaveBeenCalled();
  });
});
