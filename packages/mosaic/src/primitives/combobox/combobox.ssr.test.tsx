// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { Combobox } from './index';

describe('Combobox SSR', () => {
  it('renders on the server without warnings', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderToString(
      <Combobox.Root>
        <Combobox.Input aria-label='Fruit' />
      </Combobox.Root>,
    );

    expect(error).not.toHaveBeenCalled();
  });
});
