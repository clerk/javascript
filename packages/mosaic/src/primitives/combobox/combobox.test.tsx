import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, StrictMode, Suspense, useDeferredValue, useState, useTransition } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { axe } from '../test-utils/axe';
import { Combobox, type ComboboxTriggerProps } from './index';

afterEach(() => cleanup());

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
];

describe('Combobox', () => {
  it('keeps selection aligned through repeated reordering, removal, and remounting in Strict Mode', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    function Fixture({ items, value }: { items: typeof fruits; value: string }) {
      return (
        <StrictMode>
          <Combobox.Root
            value={value}
            onValueChange={onValueChange}
          >
            <Combobox.Input aria-label='Fruit' />
            <Combobox.Trigger aria-label='Toggle' />
            <Combobox.List>
              {items.map(item => (
                <Combobox.Option
                  key={item.value}
                  value={item.value}
                  label={item.label}
                >
                  {item.label}
                </Combobox.Option>
              ))}
            </Combobox.List>
          </Combobox.Root>
        </StrictMode>
      );
    }
    const { rerender } = render(
      <Fixture
        items={fruits}
        value='banana'
      />,
    );
    for (let cycle = 0; cycle < 5; cycle++) {
      for (const items of [fruits, [...fruits].reverse(), fruits.filter(item => item.value !== 'banana'), fruits]) {
        rerender(
          <Fixture
            items={items}
            value='banana'
          />,
        );
        await user.click(screen.getByRole('button', { name: 'Toggle' }));
        const banana = screen.queryByRole('option', { name: 'Banana' });
        if (banana) {
          expect(banana).toHaveAttribute('data-active');
          expect(banana).toHaveAttribute('aria-selected', 'true');
        } else {
          expect(screen.getAllByRole('option').every(option => option.getAttribute('aria-selected') === 'false')).toBe(
            true,
          );
        }
        await user.click(screen.getByRole('button', { name: 'Toggle' }));
      }
      rerender(
        <Fixture
          items={fruits.filter(item => item.value !== 'banana')}
          value='cherry'
        />,
      );
      await user.click(screen.getByRole('button', { name: 'Toggle' }));
      expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('data-active');
      await user.click(screen.getByRole('button', { name: 'Toggle' }));
    }
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('forwards the arrow ref without requiring a floating context prop', async () => {
    const ref = createRef<SVGSVGElement>();
    const { unmount } = render(
      <Combobox.Root defaultOpen>
        <Combobox.Input aria-label='Fruit' />
        <Combobox.Positioner>
          <Combobox.Popup>
            <Combobox.Arrow
              ref={ref}
              data-testid='arrow'
            />
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Root>,
    );
    await waitFor(() => expect(ref.current).toBe(screen.getByTestId('arrow')));
    expect(ref.current).toHaveAttribute('data-side', 'bottom');
    unmount();
    expect(ref.current).toBeNull();
  });

  it.each(['banana', 'cherry'])('handles option removal with %s selected', async selected => {
    const user = userEvent.setup();
    function Fixture({ showBanana, value = 'banana' }: { showBanana: boolean; value?: string }) {
      return (
        <Combobox.Root value={value}>
          <Combobox.Input aria-label='Fruit' />
          <Combobox.Trigger aria-label='Open' />
          <Combobox.List>
            <Combobox.Option value='apple'>Apple</Combobox.Option>
            {showBanana && <Combobox.Option value='banana'>Banana</Combobox.Option>}
            <Combobox.Option value='cherry'>Cherry</Combobox.Option>
          </Combobox.List>
        </Combobox.Root>
      );
    }
    const { rerender } = render(<Fixture showBanana />);
    rerender(
      <Fixture
        showBanana={false}
        value={selected}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const cherry = screen.getByRole('option', { name: 'Cherry' });
    if (selected === 'cherry') {
      expect(cherry).toHaveAttribute('data-active');
      expect(cherry).toHaveAttribute('aria-selected', 'true');
    } else {
      expect(cherry).not.toHaveAttribute('data-active');
    }
  });

  it('requires an option around the selection indicator', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Combobox.OptionIndicator />)).toThrow(
      'Combobox.OptionIndicator must be used within Combobox.Option',
    );
  });

  it('measures a custom popup anchor while keeping keyboard focus on the input', async () => {
    const user = userEvent.setup();
    const anchor = document.createElement('div');
    document.body.append(anchor);
    const measureAnchor = vi.spyOn(anchor, 'getBoundingClientRect');

    function AnchoredCombobox({ anchor }: { anchor?: HTMLElement }) {
      return (
        <Combobox.Root>
          <Combobox.Input aria-label='Fruit' />
          <Combobox.Positioner anchor={anchor}>
            <Combobox.Popup>
              <Combobox.Option value='apple'>Apple</Combobox.Option>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Root>
      );
    }

    const { rerender } = render(<AnchoredCombobox anchor={anchor} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await user.type(input, 'a');

    await waitFor(() => expect(measureAnchor).toHaveBeenCalled());
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-controls', screen.getByRole('listbox').id);

    const measureInput = vi.spyOn(input, 'getBoundingClientRect');
    rerender(<AnchoredCombobox />);
    await waitFor(() => expect(measureInput).toHaveBeenCalled());
    expect(input).toHaveFocus();
    anchor.remove();
  });

  it('toggles from a popup button while keeping focus on the input', async () => {
    const user = userEvent.setup();
    const triggerProps: ComboboxTriggerProps = { 'aria-label': 'Toggle fruit options' };
    const onOpenChange = vi.fn();
    render(
      <Combobox.Root onOpenChange={onOpenChange}>
        <Combobox.Input placeholder='Search fruits...' />
        <Combobox.Trigger {...triggerProps} />
        <Combobox.Positioner>
          <Combobox.Popup>
            <Combobox.Option value='apple'>Apple</Combobox.Option>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Root>,
    );

    const input = screen.getByRole('combobox');
    const trigger = screen.getByRole('button', { name: 'Toggle fruit options' });
    expect(trigger).toHaveAttribute('tabindex', '-1');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    const listbox = screen.getByRole('listbox');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', listbox.id);
    expect(input).toHaveFocus();

    await user.click(trigger);

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveFocus();
  });

  it('opens on an input click only when asked to', async () => {
    const user = userEvent.setup();
    function Fixture({ openOnInputClick }: { openOnInputClick?: boolean }) {
      return (
        <Combobox.Root openOnInputClick={openOnInputClick}>
          <Combobox.Input aria-label='Fruit' />
          <Combobox.Positioner>
            <Combobox.Popup>
              <Combobox.Option value='apple'>Apple</Combobox.Option>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Root>
      );
    }
    const { rerender } = render(<Fixture />);

    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    rerender(<Fixture openOnInputClick />);
    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('holds options during exit and shows updated options when reopened', () => {
    function Fixture({ open, label }: { open: boolean; label: string }) {
      return (
        <Combobox.Root open={open}>
          <Combobox.Input aria-label='Fruit' />
          <Combobox.Positioner>
            <Combobox.Popup data-testid='combobox-popup'>
              <Combobox.Option value={label}>{label}</Combobox.Option>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Root>
      );
    }

    const { rerender } = render(
      <Fixture
        open
        label='Apple'
      />,
    );
    const popup = screen.getByTestId('combobox-popup');
    Object.defineProperty(popup, 'getAnimations', {
      value: () => [{ finished: new Promise<void>(() => {}) }],
    });

    rerender(
      <Fixture
        open={false}
        label='Banana'
      />,
    );

    expect(popup).toHaveAttribute('data-closed', '');
    expect(popup).toHaveTextContent('Apple');
    expect(popup).not.toHaveTextContent('Banana');

    rerender(
      <Fixture
        open
        label='Banana'
      />,
    );

    expect(popup).toHaveAttribute('data-open', '');
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
    expect(popup).not.toHaveTextContent('Apple');
  });

  it('moves the highlight with the arrow keys right after typing opens a popup', async () => {
    const user = userEvent.setup();
    render(
      <Combobox.Root>
        <Combobox.Input aria-label='Fruit' />
        <Combobox.Positioner>
          <Combobox.Popup>
            {fruits.map(fruit => (
              <Combobox.Option
                key={fruit.value}
                value={fruit.value}
                label={fruit.label}
              >
                {fruit.label}
              </Combobox.Option>
            ))}
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Root>,
    );

    await user.type(screen.getByRole('combobox', { name: 'Fruit' }), 'a');
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('data-active');
  });

  it('moves the highlight with the arrow keys right after typing shows an inline list', async () => {
    const user = userEvent.setup();
    function Fixture() {
      const [query, setQuery] = useState('');
      return (
        <Combobox.Root
          inline
          open={query !== ''}
          inputValue={query}
          onInputValueChange={setQuery}
        >
          <Combobox.Input aria-label='Fruit' />
          {query ? (
            <Combobox.List>
              {fruits.map(fruit => (
                <Combobox.Option
                  key={fruit.value}
                  value={fruit.value}
                  label={fruit.label}
                >
                  {fruit.label}
                </Combobox.Option>
              ))}
            </Combobox.List>
          ) : null}
        </Combobox.Root>
      );
    }
    render(<Fixture />);

    await user.type(screen.getByRole('combobox', { name: 'Fruit' }), 'a');
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('data-active');
  });

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
        <Combobox.Root
          onValueChange={onValueChange}
          items={fruits}
          itemToStringLabel={fruit => fruit.label}
        >
          <Combobox.Input aria-label='Fruit' />
          <Combobox.Trigger aria-label='Show fruits' />
          <Combobox.Positioner>
            <Combobox.Popup>
              <Combobox.Collection>
                {(fruit: (typeof fruits)[number]) => (
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
            items={fruits}
            itemToStringLabel={fruit => fruit.label}
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
                  <Combobox.Collection>
                    {(fruit: (typeof fruits)[number]) => (
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

describe('Combobox.Empty', () => {
  type Fruit = (typeof fruits)[number];

  function FruitOption({ fruit }: { fruit: Fruit }) {
    return (
      <Combobox.Option
        key={fruit.value}
        value={fruit.value}
        label={fruit.label}
      >
        {fruit.label}
      </Combobox.Option>
    );
  }

  it('announces the empty message in a region that stays mounted while filtering', async () => {
    const user = userEvent.setup();
    render(
      <Combobox.Root
        items={fruits}
        itemToStringLabel={fruit => fruit.label}
      >
        <Combobox.Input aria-label='Fruit' />
        <Combobox.Positioner>
          <Combobox.Popup>
            <Combobox.Empty>No fruit found</Combobox.Empty>
            <Combobox.Collection>
              {(fruit: Fruit) => (
                <FruitOption
                  key={fruit.value}
                  fruit={fruit}
                />
              )}
            </Combobox.Collection>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Root>,
    );
    const input = screen.getByRole('combobox', { name: 'Fruit' });

    await user.type(input, 'an');
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
    expect(status).toBeEmptyDOMElement();
    expect(screen.getAllByRole('option')).toHaveLength(1);

    await user.type(input, 'zzz');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toHaveTextContent('No fruit found');

    await user.clear(input);
    await user.type(input, 'e');
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toBeEmptyDOMElement();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('fills the region beside an inline list when the search matches nothing', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Combobox.Root
        inline
        open
        items={fruits}
        itemToStringLabel={fruit => fruit.label}
      >
        <Combobox.Input aria-label='Search fruit' />
        <Combobox.Empty>No fruit found</Combobox.Empty>
        <Combobox.List aria-label='Fruits'>
          <Combobox.Collection>
            {(fruit: Fruit) => (
              <FruitOption
                key={fruit.value}
                fruit={fruit}
              />
            )}
          </Combobox.Collection>
        </Combobox.List>
      </Combobox.Root>,
    );
    const status = screen.getByRole('status');
    expect(status).toBeEmptyDOMElement();
    expect(screen.getAllByRole('option')).toHaveLength(4);

    await user.type(screen.getByRole('combobox', { name: 'Search fruit' }), 'zzz');

    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toHaveTextContent('No fruit found');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('always renders its children when the root has no items', () => {
    render(
      <Combobox.Root
        inline
        open
      >
        <Combobox.Input aria-label='Search fruit' />
        <Combobox.Empty>No fruit found</Combobox.Empty>
        <Combobox.List aria-label='Fruits'>
          <Combobox.Option value='apple'>Apple</Combobox.Option>
        </Combobox.List>
      </Combobox.Root>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('No fruit found');
  });

  describe('when the region mounts with its message already shown', () => {
    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    function EmptyOnMount() {
      return (
        <Combobox.Root
          inline
          open
          items={[]}
          itemToStringLabel={(fruit: string) => fruit}
        >
          <Combobox.Input aria-label='Search fruit' />
          <Combobox.Empty>No fruit found</Combobox.Empty>
        </Combobox.Root>
      );
    }

    it('changes the text once after mount so screen readers announce it', () => {
      vi.useFakeTimers();
      render(<EmptyOnMount />);
      const status = screen.getByRole('status');

      expect(status.textContent).toBe('No fruit found⁠');

      vi.advanceTimersByTime(200);
      expect(status.textContent).toBe('No fruit found');
    });

    it('leaves the text alone on iOS', () => {
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('iPhone');
      render(<EmptyOnMount />);

      expect(screen.getByRole('status').textContent).toBe('No fruit found');
    });
  });
});

describe('Combobox option renders', () => {
  it('re-renders only the options whose highlight changes', async () => {
    const user = userEvent.setup();
    const renders: string[] = [];
    function Fixture({ value }: { value: string }) {
      return (
        <Combobox.Root value={value}>
          <Combobox.Input aria-label='Fruit' />
          <Combobox.Trigger aria-label='Show fruits' />
          <Combobox.Positioner>
            <Combobox.Popup>
              {fruits.map(fruit => (
                <Combobox.Option
                  key={fruit.value}
                  value={fruit.value}
                  label={fruit.label}
                  render={props => {
                    renders.push(fruit.value);
                    return <div {...props} />;
                  }}
                >
                  {fruit.label}
                </Combobox.Option>
              ))}
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Root>
      );
    }
    const { rerender } = render(<Fixture value='banana' />);
    await user.click(screen.getByRole('button', { name: 'Show fruits' }));
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('data-active');

    renders.length = 0;
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('data-active');
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Cherry' }).id,
    );
    expect(new Set(renders)).toEqual(new Set(['banana', 'cherry']));

    renders.length = 0;
    await user.hover(screen.getByRole('option', { name: 'Apple' }));
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('data-active');
    expect(new Set(renders)).toEqual(new Set(['cherry', 'apple']));

    rerender(<Fixture value='cherry' />);
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'false');
  });
});

describe('Combobox selection in a transition', () => {
  const neverResolves = new Promise<never>(() => {});
  function Suspends(): never {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- Suspending is React's thrown-thenable protocol; `React.use()` needs React 19.
    throw neverResolves;
  }

  type HoverRender = { option: string; hovered: string | null; active: boolean };
  type OptionRender = { option: string; parentValue: string | null; selected: unknown };

  function Fixture({
    update = 'transition',
    onRenderOption,
    suspendSelected = false,
    hoverInTransition = false,
    onRenderHover,
    suspendWhenActive,
  }: {
    update?: 'transition' | 'deferred';
    onRenderOption?: (render: OptionRender) => void;
    suspendSelected?: boolean;
    hoverInTransition?: boolean;
    onRenderHover?: (render: HoverRender) => void;
    suspendWhenActive?: string;
  }) {
    const [value, setValue] = useState<string | null>(null);
    const deferredValue = useDeferredValue(value);
    const [isPending, startTransition] = useTransition();
    const [hovered, setHovered] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isLoadingMore, startLoadingMore] = useTransition();
    const parentValue = update === 'deferred' ? deferredValue : value;
    return (
      <>
        <button
          type='button'
          onClick={() => startLoadingMore(() => setLoadingMore(true))}
        >
          Load more
        </button>
        <p>{isLoadingMore ? 'Loading more' : 'Loaded'}</p>
        <Suspense fallback={<p>Loading more fallback</p>}>{loadingMore ? <Suspends /> : null}</Suspense>
        <Suspense fallback={<p>Loading</p>}>
          <p>{isPending || value !== deferredValue ? 'Pending' : 'Idle'}</p>
          <Combobox.Root
            open
            value={parentValue}
            onValueChange={next => (update === 'deferred' ? setValue(next) : startTransition(() => setValue(next)))}
          >
            <Combobox.Input aria-label='Fruit' />
            <Combobox.List>
              {fruits.map(option => (
                <Combobox.Option
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  render={props => {
                    onRenderOption?.({ option: option.value, parentValue, selected: props['aria-selected'] });
                    const active = 'data-active' in props;
                    onRenderHover?.({ option: option.value, hovered, active });
                    return (
                      <div
                        {...props}
                        onMouseMove={
                          hoverInTransition
                            ? event =>
                                startTransition(() => {
                                  setHovered(option.value);
                                  props.onMouseMove?.(event);
                                })
                            : props.onMouseMove
                        }
                      >
                        {props.children}
                        {suspendSelected && props['aria-selected'] ? <Suspends /> : null}
                        {active && suspendWhenActive === option.value ? <Suspends /> : null}
                      </div>
                    );
                  }}
                >
                  {option.label}
                </Combobox.Option>
              ))}
            </Combobox.List>
          </Combobox.Root>
        </Suspense>
      </>
    );
  }

  describe.each(['transition', 'deferred'] as const)('when the parent updates the value with %s', update => {
    it('renders each option with the selection its parent passed down', async () => {
      const user = userEvent.setup();
      const renders: OptionRender[] = [];
      render(
        <Fixture
          update={update}
          onRenderOption={entry => renders.push(entry)}
        />,
      );

      await user.click(screen.getByRole('option', { name: 'Banana' }));

      await waitFor(() =>
        expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true'),
      );
      expect(renders).not.toContainEqual({ option: 'banana', parentValue: 'banana', selected: false });
    });

    it('renders the new selection in the same render as its parent, with no second pass', async () => {
      const user = userEvent.setup();
      const renders: OptionRender[] = [];
      render(
        <Fixture
          update={update}
          onRenderOption={entry => renders.push(entry)}
        />,
      );

      await user.click(screen.getByRole('option', { name: 'Banana' }));

      await waitFor(() =>
        expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true'),
      );
      expect(renders.filter(entry => entry.option === 'banana' && entry.parentValue === 'banana')).toEqual([
        { option: 'banana', parentValue: 'banana', selected: true },
      ]);
    });

    it('keeps the current options on screen while a selection suspends', async () => {
      const user = userEvent.setup();
      render(
        <Fixture
          update={update}
          suspendSelected
        />,
      );

      await user.click(screen.getByRole('option', { name: 'Banana' }));

      await waitFor(() => expect(screen.getByText('Pending')).toBeInTheDocument());
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'false');
    });
  });

  it('moves the highlight with arrow keys while an unrelated transition is pending', async () => {
    const user = userEvent.setup();
    render(<Fixture />);

    await user.click(screen.getByRole('button', { name: 'Load more' }));
    await waitFor(() => expect(screen.getByText('Loading more')).toBeInTheDocument());

    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');

    const banana = screen.getByRole('option', { name: 'Banana' });
    expect(banana).toHaveAttribute('data-active');
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-activedescendant', banana.id);
    expect(screen.getByText('Loading more')).toBeInTheDocument();
  });

  it('renders the hovered option as active in the same render as a hover transition', async () => {
    const user = userEvent.setup();
    const renders: HoverRender[] = [];
    render(
      <Fixture
        hoverInTransition
        onRenderHover={entry => renders.push(entry)}
      />,
    );

    await user.hover(screen.getByRole('option', { name: 'Banana' }));

    await waitFor(() => expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('data-active'));
    expect(renders).not.toContainEqual({ option: 'banana', hovered: 'banana', active: false });
  });

  it('keeps the current options on screen while a hover transition suspends', async () => {
    const user = userEvent.setup();
    render(
      <Fixture
        hoverInTransition
        suspendWhenActive='banana'
      />,
    );

    await user.hover(screen.getByRole('option', { name: 'Banana' }));

    await waitFor(() => expect(screen.getByText('Pending')).toBeInTheDocument());
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Banana' })).not.toHaveAttribute('data-active');
  });
});
