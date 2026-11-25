import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Combobox } from '.';

afterEach(() => cleanup());

describe('Combobox.ItemIndicator', () => {
  it('shows the kept-mounted check only on the selected item and keeps its width on the others', () => {
    render(
      <Combobox.Root
        defaultValue='apple'
        defaultOpen
      >
        <Combobox.Input aria-label='Fruit' />
        <Combobox.Popup>
          <Combobox.Item
            value='apple'
            label='Apple'
          >
            Apple
            <Combobox.ItemIndicator
              keepMounted
              data-testid='apple-check'
            />
          </Combobox.Item>
          <Combobox.Item
            value='banana'
            label='Banana'
          >
            Banana
            <Combobox.ItemIndicator
              keepMounted
              data-testid='banana-check'
            />
          </Combobox.Item>
        </Combobox.Popup>
      </Combobox.Root>,
    );

    const apple = screen.getByTestId('apple-check');
    const banana = screen.getByTestId('banana-check');
    expect(getComputedStyle(apple).visibility).toBe('visible');
    expect(getComputedStyle(banana).visibility).toBe('hidden');
    expect(banana.getBoundingClientRect().width).toBe(apple.getBoundingClientRect().width);
  });
});
