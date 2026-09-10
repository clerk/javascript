import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Combobox } from './index';

afterEach(() => cleanup());

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
];

describe('Combobox', () => {
  describe('selection-only input', () => {
    it('keeps the selected option when hover and keyboard highlight move', async () => {
      const user = userEvent.setup();
      render(<SelectionOnly />);
      const trigger = screen.getByRole('button', { name: 'Show fruits' });
      await user.click(trigger);
      await user.click(screen.getByRole('option', { name: 'Banana' }));
      await user.click(trigger);
      await user.hover(screen.getByRole('option', { name: 'Cherry' }));
      expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('data-active');
      expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('aria-selected', 'false');
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('option', { name: 'Date' })).toHaveAttribute('data-active');
      expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true');
    });
    function SelectionOnly({ onValueChange }: { onValueChange?: (value: string | null) => void }) {
      return (
        <Combobox.Root onValueChange={onValueChange}>
          <Combobox.Input aria-label='Fruit' />
          <Combobox.Trigger aria-label='Show fruits' />
          <Combobox.Positioner>
            <Combobox.Popup>
              <Combobox.Collection
                items={fruits}
                itemToStringLabel={fruit => fruit.label}
              >
                {fruit => (
                  <Combobox.Option
                    key={fruit.value}
                    value={fruit.value}
                    label={fruit.label}
                  >
                    {fruit.label}
                  </Combobox.Option>
                )}
              </Combobox.Collection>
            </Combobox.Popup>
          </Combobox.Positioner>
          <button type='button'>Outside</button>
        </Combobox.Root>
      );
    }

    it.each(['escape', 'outside', 'tab', 'trigger'])('restores the selection when dismissed with %s', async method => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<SelectionOnly onValueChange={onValueChange} />);
      const input = screen.getByRole('combobox');
      const trigger = screen.getByRole('button', { name: 'Show fruits' });
      const outside = screen.getByRole('button', { name: 'Outside' });
      await user.click(trigger);
      await user.click(screen.getByRole('option', { name: 'Apple' }));
      await user.type(input, ' not a fruit');
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith('apple');

      if (method === 'escape') {
        await user.keyboard('{Escape}');
      } else if (method === 'outside') {
        await user.click(outside);
      } else if (method === 'tab') {
        await user.tab();
      } else {
        await user.click(trigger);
      }

      await waitFor(() => expect(input).toHaveValue('Apple'));
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith('apple');
    });

    it('discards unmatched text when there is no selection', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<SelectionOnly onValueChange={onValueChange} />);
      const input = screen.getByRole('combobox');
      await user.type(input, 'not a fruit');
      await user.keyboard('{Escape}');
      expect(input).toHaveValue('');
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('keeps the selected label on reopen', async () => {
      const user = userEvent.setup();
      render(<SelectionOnly />);
      const trigger = screen.getByRole('button', { name: 'Show fruits' });
      await user.click(trigger);
      await user.click(screen.getByRole('option', { name: 'Banana' }));
      await user.click(trigger);
      expect(screen.getByRole('combobox')).toHaveValue('Banana');
      expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('data-selected', '');
      await user.keyboard('{Escape}');
      expect(screen.getByRole('combobox')).toHaveValue('Banana');
    });

    it('shows all options on reopen and filters only after editing the selected label', async () => {
      const user = userEvent.setup();
      render(<SelectionOnly />);
      const input = screen.getByRole('combobox');
      const trigger = screen.getByRole('button', { name: 'Show fruits' });
      await user.type(input, 'Ban');
      expect(screen.getAllByRole('option')).toHaveLength(1);
      await user.click(screen.getByRole('option', { name: 'Banana' }));
      await user.click(trigger);
      expect(input).toHaveValue('Banana');
      expect(screen.getAllByRole('option')).toHaveLength(4);
      expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('data-active');
      await user.type(input, 'Cherry', { initialSelectionStart: 0, initialSelectionEnd: 6 });
      expect(screen.getAllByRole('option')).toHaveLength(1);
      await user.keyboard('{Escape}');
      expect(input).toHaveValue('Banana');
      await user.keyboard('{ArrowDown}');
      expect(screen.getAllByRole('option')).toHaveLength(4);
    });

    it('keeps the popup open when the search is cleared', async () => {
      const user = userEvent.setup();
      render(<SelectionOnly />);
      const input = screen.getByRole('combobox');
      await user.type(input, 'a');
      await user.clear(input);
      expect(input).toHaveValue('');
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    it.each(['backspace', 'clear'])('clears the selection when the input is emptied with %s', async method => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<SelectionOnly onValueChange={onValueChange} />);
      const input = screen.getByRole('combobox');
      await user.click(screen.getByRole('button', { name: 'Show fruits' }));
      await user.click(screen.getByRole('option', { name: 'Banana' }));
      if (method === 'backspace') {
        await user.keyboard('{End}{Backspace>6/}');
      } else {
        await user.clear(input);
      }
      expect(onValueChange).toHaveBeenLastCalledWith(null);
      expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'false');
      await user.keyboard('{Escape}');
      expect(input).toHaveValue('');
      await user.keyboard('{ArrowDown}');
      expect(screen.getAllByRole('option')).toHaveLength(4);
      expect(screen.getByRole('option', { name: 'Banana' })).not.toHaveAttribute('data-selected');
    });

    it('resets a separate popup search without clearing its selection', async () => {
      const user = userEvent.setup();
      function Picker() {
        const [open, setOpen] = useState(false);
        const [value, setValue] = useState<string | null>('apple');
        return (
          <Combobox.Root
            inline
            open={open}
            onOpenChange={setOpen}
            value={value}
            onValueChange={setValue}
          >
            <button
              type='button'
              onClick={() => setOpen(!open)}
            >
              {value}
            </button>
            {open && (
              <>
                <Combobox.Input aria-label='Search fruit' />
                <Combobox.List>
                  <Combobox.Collection
                    items={fruits}
                    itemToStringLabel={fruit => fruit.label}
                  >
                    {fruit => (
                      <Combobox.Option
                        key={fruit.value}
                        value={fruit.value}
                        label={fruit.label}
                      >
                        {fruit.label}
                      </Combobox.Option>
                    )}
                  </Combobox.Collection>
                </Combobox.List>
              </>
            )}
          </Combobox.Root>
        );
      }
      render(<Picker />);
      await user.click(screen.getByRole('button', { name: 'apple' }));
      expect(screen.getByRole('combobox')).toHaveValue('');
      await user.type(screen.getByRole('combobox'), 'Ban');
      await user.click(screen.getByRole('option', { name: 'Banana' }));
      await user.click(screen.getByRole('button', { name: 'banana' }));
      expect(screen.getByRole('combobox')).toHaveValue('');
      expect(screen.getAllByRole('option')).toHaveLength(4);
      expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('data-selected');
      await user.type(screen.getByRole('combobox'), 'Cher');
      await user.clear(screen.getByRole('combobox'));
      expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true');
      await user.click(screen.getByRole('button', { name: 'banana' }));
      await user.click(screen.getByRole('button', { name: 'banana' }));
      expect(screen.getByRole('combobox')).toHaveValue('');
      expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('data-selected');
    });

    it.each([true, false])('respects a controlled clearing request when accepted=%s', async accept => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      function Controlled() {
        const [value, setValue] = useState<string | null>('apple');
        return (
          <Combobox.Root
            value={value}
            defaultInputValue='Apple'
            onValueChange={next => {
              onValueChange(next);
              if (accept) {
                setValue(next);
              }
            }}
          >
            <Combobox.Input aria-label='Fruit' />
            <Combobox.Positioner>
              <Combobox.Popup>
                <Combobox.Option
                  value='apple'
                  label='Apple'
                >
                  Apple
                </Combobox.Option>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Root>
        );
      }
      render(<Controlled />);
      const input = screen.getByRole('combobox');
      await user.clear(input);
      expect(onValueChange).toHaveBeenLastCalledWith(null);
      expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', String(!accept));
      await user.keyboard('{Escape}');
      expect(input).toHaveValue(accept ? '' : 'Apple');
    });

    it('restores a controlled selection and query when the parent closes the popup', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      function Controlled({ open }: { open: boolean }) {
        const [query, setQuery] = useState('');
        return (
          <Combobox.Root
            open={open}
            value='apple'
            inputValue={query}
            onInputValueChange={setQuery}
            onValueChange={onValueChange}
          >
            <Combobox.Input aria-label='Fruit' />
            <Combobox.Positioner>
              <Combobox.Popup>
                <Combobox.Option
                  value='apple'
                  label='Apple'
                >
                  Apple
                </Combobox.Option>
                <Combobox.Option
                  value='banana'
                  label='Banana'
                >
                  Banana
                </Combobox.Option>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Root>
        );
      }

      const { rerender } = render(<Controlled open />);
      const input = screen.getByRole('combobox');
      await user.type(input, 'banana');
      await user.click(screen.getByRole('option', { name: 'Banana' }));
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith('banana');
      rerender(<Controlled open={false} />);
      expect(input).toHaveValue('Apple');
    });
  });
});
