import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, Suspense, useDeferredValue, useState, useTransition } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { axe } from '../../test-utils/axe';
import { Select, type SelectItem } from '../index';

afterEach(() => cleanup());

const fruits: SelectItem[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
];

function renderSelect(props: Partial<React.ComponentProps<typeof Select.Root>> = {}) {
  const { children, ...rest } = props as Record<string, unknown>;
  return render(
    <Select.Root
      items={fruits}
      alignItemWithTrigger={false}
      {...rest}
    >
      <Select.Trigger>
        <Select.Value
          data-testid='select-value'
          placeholder='Pick a fruit...'
        />
      </Select.Trigger>
      <Select.Positioner data-testid='select-positioner'>
        <Select.Popup data-testid='select-popup'>
          {fruits.map(({ label, value }) => (
            <Select.Item
              key={value}
              value={value}
              label={label}
            >
              {label}
            </Select.Item>
          ))}
        </Select.Popup>
      </Select.Positioner>
    </Select.Root>,
  );
}

describe('Select', () => {
  describe('ARIA attributes', () => {
    it('keeps the trigger/listbox aria-controls pairing intact when a custom id is passed to the positioner', () => {
      render(
        <Select.Root
          items={fruits}
          alignItemWithTrigger={false}
          defaultOpen
        >
          <Select.Trigger>
            <Select.Value placeholder='Pick a fruit...' />
          </Select.Trigger>
          <Select.Positioner
            id='consumer-custom-id'
            data-testid='select-positioner'
          >
            <Select.Popup data-testid='select-popup'>
              {fruits.map(({ label, value }) => (
                <Select.Item
                  key={value}
                  value={value}
                  label={label}
                >
                  {label}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Root>,
      );

      const trigger = screen.getByRole('combobox');
      const positioner = document.querySelector('[data-testid="select-positioner"]');

      // The listbox id is owned by floating-ui: a consumer-supplied id must not
      // override it, or the trigger's aria-controls pairing would silently break.
      expect(positioner).not.toHaveAttribute('id', 'consumer-custom-id');
      expect(trigger.getAttribute('aria-controls')).toBe(positioner?.getAttribute('id'));
    });
  });

  describe('items prop and label resolution', () => {
    it('shows placeholder when no value is selected', () => {
      renderSelect();
      const value = document.querySelector('[data-testid="select-value"]');
      expect(value?.textContent).toBe('Pick a fruit...');
    });

    it('shows placeholder when the controlled value is null', () => {
      renderSelect({ value: null });
      const value = document.querySelector('[data-testid="select-value"]');
      expect(value?.textContent).toBe('Pick a fruit...');
    });

    it('shows placeholder over a function child when no value is selected', () => {
      render(
        <Select.Root
          items={fruits}
          multiple
        >
          <Select.Trigger>
            <Select.Value
              data-testid='select-value'
              placeholder='Pick fruits...'
            >
              {(values: string[]) => `${values.length} fruits`}
            </Select.Value>
          </Select.Trigger>
        </Select.Root>,
      );
      const value = document.querySelector('[data-testid="select-value"]');
      expect(value?.textContent).toBe('Pick fruits...');
    });

    it('resolves label from items before options mount', () => {
      renderSelect({ defaultValue: 'banana' });
      const value = document.querySelector('[data-testid="select-value"]');
      expect(value?.textContent).toBe('Banana');
    });

    it('resolves label for controlled value from items', () => {
      renderSelect({ value: 'cherry' });
      const value = document.querySelector('[data-testid="select-value"]');
      expect(value?.textContent).toBe('Cherry');
    });

    it('falls back to raw value when no items provided', () => {
      render(
        <Select.Root
          defaultValue='banana'
          alignItemWithTrigger={false}
        >
          <Select.Trigger>
            <Select.Value
              data-testid='select-value'
              placeholder='Pick...'
            />
          </Select.Trigger>
          <Select.Positioner data-testid='select-positioner'>
            <Select.Popup data-testid='select-popup'>
              <Select.Item
                value='banana'
                label='Banana'
              >
                Banana
              </Select.Item>
            </Select.Popup>
          </Select.Positioner>
        </Select.Root>,
      );
      const value = document.querySelector('[data-testid="select-value"]');
      expect(value?.textContent).toBe('banana');
    });

    it('updates label after selection via option registry', async () => {
      const user = userEvent.setup();
      // No items prop — labels only known once options mount
      render(
        <Select.Root alignItemWithTrigger={false}>
          <Select.Trigger>
            <Select.Value
              data-testid='select-value'
              placeholder='Pick...'
            />
          </Select.Trigger>
          <Select.Positioner data-testid='select-positioner'>
            <Select.Popup data-testid='select-popup'>
              <Select.Item
                value='x'
                label='Special Item'
              >
                Special Item
              </Select.Item>
            </Select.Popup>
          </Select.Positioner>
        </Select.Root>,
      );

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Special Item'));

      const value = document.querySelector('[data-testid="select-value"]');
      expect(value?.textContent).toBe('Special Item');
    });
  });

  describe('open/close', () => {
    it('opens on trigger click', async () => {
      const user = userEvent.setup();
      renderSelect();

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      expect(trigger).toHaveAttribute('data-open', '');
      expect(document.querySelector('[data-testid="select-popup"]')).toBeInTheDocument();
    });

    it('closes on Escape', async () => {
      const user = userEvent.setup();
      renderSelect({ defaultOpen: true });

      await user.keyboard('{Escape}');

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('data-closed', '');
    });

    it('calls onOpenChange when toggled', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      renderSelect({ onOpenChange });

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('selection', () => {
    it('selects option on click', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      renderSelect({ onValueChange });

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      const option = screen.getByText('Banana');
      await user.click(option);

      expect(onValueChange).toHaveBeenCalledWith('banana');
    });

    it('displays selected label in Value after selection', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Cherry'));

      const value = document.querySelector('[data-testid="select-value"]');
      expect(value?.textContent).toContain('Cherry');
    });
  });

  describe('controlled value', () => {
    it('does not display a stale label when the controlled parent rejects the change', async () => {
      const user = userEvent.setup();
      // The parent keeps `value` pinned to 'apple' and ignores onValueChange,
      // so the displayed label must stay "Apple" even after clicking "Banana".
      render(
        <Select.Root
          items={fruits}
          alignItemWithTrigger={false}
          value='apple'
          onValueChange={() => {}}
        >
          <Select.Trigger>
            <Select.Value
              data-testid='select-value'
              placeholder='Pick a fruit...'
            />
          </Select.Trigger>
          <Select.Positioner data-testid='select-positioner'>
            <Select.Popup data-testid='select-popup'>
              {fruits.map(({ label, value }) => (
                <Select.Item
                  key={value}
                  value={value}
                  label={label}
                >
                  {label}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Root>,
      );

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Banana'));

      const value = document.querySelector('[data-testid="select-value"]');
      expect(value?.textContent).toBe('Apple');
    });
  });

  describe('keyboard navigation', () => {
    it('navigates options with arrow keys', async () => {
      const user = userEvent.setup();
      renderSelect();

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      await user.keyboard('{ArrowDown}');

      const activeOption = document.querySelector('[role="option"][data-active]');
      expect(activeOption).toBeInTheDocument();
    });

    it.each(['{ArrowDown}', '{ArrowUp}'])(
      'opens from a focused trigger with %s and focuses the selected option',
      async key => {
        const user = userEvent.setup();
        renderSelect({ defaultValue: 'banana' });

        const trigger = screen.getByRole('combobox');
        trigger.focus();

        await user.keyboard(key);

        const options = screen.getAllByRole('option');
        expect(options[1]).toHaveAttribute('data-selected', '');
        await waitFor(() => expect(document.activeElement).toBe(options[1]));
        expect(options[1]).toHaveAttribute('data-active', '');
      },
    );
  });

  describe('item state attributes', () => {
    it('marks selected option with data-selected', () => {
      renderSelect({ defaultValue: 'banana', defaultOpen: true });

      const options = document.querySelectorAll('[role="option"]');
      expect(options[1]).toHaveAttribute('data-selected', '');
    });

    it('marks active option with data-active', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole('combobox'));
      await user.keyboard('{ArrowDown}');

      const activeOption = document.querySelector('[role="option"][data-active]');
      expect(activeOption).toBeInTheDocument();
    });
  });

  describe('disabled item', () => {
    it('renders disabled option with data-disabled', async () => {
      const user = userEvent.setup();
      render(
        <Select.Root alignItemWithTrigger={false}>
          <Select.Trigger>
            <Select.Value
              data-testid='select-value'
              placeholder='Pick...'
            />
          </Select.Trigger>
          <Select.Positioner data-testid='select-positioner'>
            <Select.Popup data-testid='select-popup'>
              <Select.Item
                value='apple'
                label='Apple'
              >
                Apple
              </Select.Item>
              <Select.Item
                value='banana'
                label='Banana'
                disabled
              >
                Banana
              </Select.Item>
            </Select.Popup>
          </Select.Positioner>
        </Select.Root>,
      );

      await user.click(screen.getByRole('combobox'));

      const disabledOption = screen.getByText('Banana').closest("[role='option']");
      expect(disabledOption).toHaveAttribute('data-disabled', '');
      expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not select disabled option on click', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      render(
        <Select.Root
          onValueChange={onValueChange}
          alignItemWithTrigger={false}
        >
          <Select.Trigger>
            <Select.Value
              data-testid='select-value'
              placeholder='Pick...'
            />
          </Select.Trigger>
          <Select.Positioner data-testid='select-positioner'>
            <Select.Popup data-testid='select-popup'>
              <Select.Item
                value='apple'
                label='Apple'
              >
                Apple
              </Select.Item>
              <Select.Item
                value='banana'
                label='Banana'
                disabled
              >
                Banana
              </Select.Item>
            </Select.Popup>
          </Select.Positioner>
        </Select.Root>,
      );

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Banana'));

      expect(onValueChange).not.toHaveBeenCalledWith('banana');
    });
  });

  describe('ARIA roles and states', () => {
    it('options have role=option', () => {
      renderSelect({ defaultOpen: true });

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
    });

    it('selected option has aria-selected=true', () => {
      renderSelect({ defaultValue: 'apple', defaultOpen: true });

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
      expect(options[1]).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('animation lifecycle', () => {
    it('positioner is not rendered when closed', () => {
      renderSelect();
      const positioner = document.querySelector('[data-testid="select-positioner"]');
      expect(positioner).not.toBeInTheDocument();
    });

    it('applies data-open on popup when open', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole('combobox'));

      const popup = document.querySelector('[data-testid="select-popup"]');
      expect(popup).toHaveAttribute('data-open', '');
    });

    it('positioner has data-side', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole('combobox'));

      const positioner = document.querySelector('[data-testid="select-positioner"]');
      expect(positioner).toHaveAttribute('data-side');
    });

    it('holds the options at their last frame while the popup exits', async () => {
      const user = userEvent.setup();
      renderSelect({ defaultValue: 'apple' });

      await user.click(screen.getByRole('combobox'));
      const popup = screen.getByTestId('select-popup');
      Object.defineProperty(popup, 'getAnimations', {
        value: () => [{ finished: new Promise<void>(() => {}) }],
      });

      await user.click(screen.getByRole('option', { name: 'Banana' }));

      expect(popup).toHaveAttribute('data-closed', '');
      expect(screen.getByTestId('select-value')).toHaveTextContent('Banana');
      expect(screen.getByRole('option', { name: 'Apple', hidden: true })).toHaveAttribute('data-selected', '');
      expect(screen.getByRole('option', { name: 'Banana', hidden: true })).not.toHaveAttribute('data-selected');
    });
  });

  describe('controlled open', () => {
    it('respects controlled open prop', () => {
      renderSelect({ open: true });

      const positioner = document.querySelector('[data-testid="select-positioner"]');
      expect(positioner).toBeInTheDocument();
    });

    it('does not open when controlled open is false', async () => {
      const user = userEvent.setup();
      renderSelect({ open: false });

      await user.click(screen.getByRole('combobox'));

      const positioner = document.querySelector('[data-testid="select-positioner"]');
      expect(positioner).not.toBeInTheDocument();
    });
  });

  describe('alignItemWithTrigger', () => {
    it('defaults to true', () => {
      // Render without explicitly setting alignItemWithTrigger
      render(
        <Select.Root
          items={fruits}
          defaultOpen
          defaultValue='banana'
        >
          <Select.Trigger>
            <Select.Value
              data-testid='select-value'
              placeholder='Pick...'
            />
          </Select.Trigger>
          <Select.Positioner data-testid='select-positioner'>
            <Select.Popup data-testid='select-popup'>
              {fruits.map(({ label, value }) => (
                <Select.Item
                  key={value}
                  value={value}
                  label={label}
                >
                  {label}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Root>,
      );

      // The positioner should render (alignItemWithTrigger doesn't prevent rendering)
      const positioner = document.querySelector('[data-testid="select-positioner"]');
      expect(positioner).toBeInTheDocument();
    });

    it('uses standard floating styles when disabled', async () => {
      const user = userEvent.setup();
      renderSelect({ alignItemWithTrigger: false });

      await user.click(screen.getByRole('combobox'));

      const positioner = document.querySelector('[data-testid="select-positioner"]') as HTMLElement;
      // Standard Floating UI positioning uses position: absolute with transform
      expect(positioner.style.position).toBe('absolute');
    });
  });

  describe('alignItemWithTrigger positioning', () => {
    it('marks the positioner with data-side="none" and blocks page scrolling while open', async () => {
      const user = userEvent.setup();
      renderSelect({ alignItemWithTrigger: true, defaultValue: 'banana' });
      const trigger = screen.getByRole('combobox');
      trigger.getBoundingClientRect = () => new DOMRect(0, 300, 120, 32);

      await user.click(trigger);

      expect(screen.getByTestId('select-positioner')).toHaveAttribute('data-side', 'none');
      expect(document.body).toHaveStyle({ overflowY: 'hidden' });

      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByTestId('select-positioner')).not.toBeInTheDocument());
      expect(document.body).not.toHaveStyle({ overflowY: 'hidden' });
    });

    it('positions like a menu when nothing is selected', async () => {
      const user = userEvent.setup();
      renderSelect({ alignItemWithTrigger: true, value: null });

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => expect(screen.getByTestId('select-positioner')).toHaveAttribute('data-side', 'bottom'));
      expect(document.body).not.toHaveStyle({ overflowY: 'hidden' });
    });

    it('positions like a menu when opened by touch', async () => {
      const user = userEvent.setup();
      renderSelect({ alignItemWithTrigger: true });
      const trigger = screen.getByRole('combobox');

      await user.pointer({ keys: '[TouchA]', target: trigger });

      expect(screen.getByTestId('select-positioner')).toHaveAttribute('data-side', 'bottom');
      expect(document.body).not.toHaveStyle({ overflowY: 'hidden' });
    });

    it('positions like a menu when the trigger hugs the viewport edge', async () => {
      const user = userEvent.setup();
      renderSelect({ alignItemWithTrigger: true, defaultValue: 'banana' });
      const trigger = screen.getByRole('combobox');
      // jsdom lays everything out at 0,0: as close to the top edge as it gets.
      expect(trigger.getBoundingClientRect().top).toBe(0);

      await user.click(trigger);

      await waitFor(() => expect(screen.getByTestId('select-positioner')).toHaveAttribute('data-side', 'bottom'));
    });
  });

  describe('accessibility (axe)', () => {
    it('has no violations when closed', async () => {
      const { container } = render(
        <Select.Root
          items={fruits}
          alignItemWithTrigger={false}
        >
          <Select.Trigger aria-label='Fruit'>
            <Select.Value placeholder='Pick a fruit...' />
          </Select.Trigger>
          <Select.Positioner>
            <Select.Popup>
              {fruits.map(({ label, value }) => (
                <Select.Item
                  key={value}
                  value={value}
                  label={label}
                >
                  {label}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Root>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations when open', async () => {
      render(
        <Select.Root
          items={fruits}
          alignItemWithTrigger={false}
          defaultOpen
        >
          <Select.Trigger aria-label='Fruit'>
            <Select.Value placeholder='Pick a fruit...' />
          </Select.Trigger>
          <Select.Positioner>
            <Select.Popup>
              {fruits.map(({ label, value }) => (
                <Select.Item
                  key={value}
                  value={value}
                  label={label}
                >
                  {label}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Root>,
      );
      expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
    });

    it('has no violations with a selected value', async () => {
      const { container } = render(
        <Select.Root
          items={fruits}
          alignItemWithTrigger={false}
          defaultValue='banana'
        >
          <Select.Trigger aria-label='Fruit'>
            <Select.Value placeholder='Pick a fruit...' />
          </Select.Trigger>
          <Select.Positioner>
            <Select.Popup>
              {fruits.map(({ label, value }) => (
                <Select.Item
                  key={value}
                  value={value}
                  label={label}
                >
                  {label}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Root>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('item button type', () => {
    it('renders options with type="button" so they do not submit a wrapping form', () => {
      renderSelect({ defaultOpen: true });
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
      for (const option of options) {
        expect(option).toHaveAttribute('type', 'button');
      }
    });
  });

  describe('Arrow', () => {
    it('forwards a ref to the arrow element', async () => {
      const user = userEvent.setup();
      const ref = createRef<SVGSVGElement>();
      render(
        <Select.Root
          items={fruits}
          alignItemWithTrigger={false}
        >
          <Select.Trigger>
            <Select.Value placeholder='Pick a fruit...' />
          </Select.Trigger>
          <Select.Positioner>
            <Select.Popup>
              <Select.Arrow ref={ref} />
              <Select.Item
                value='apple'
                label='Apple'
              >
                Apple
              </Select.Item>
            </Select.Popup>
          </Select.Positioner>
        </Select.Root>,
      );

      await user.click(screen.getByRole('combobox'));

      expect(ref.current).toBeInstanceOf(SVGSVGElement);
    });
  });

  describe('Home/End navigation honors aria-disabled value', () => {
    it('treats aria-disabled="false" as enabled when pressing Home', async () => {
      const user = userEvent.setup();
      render(
        <Select.Root
          items={fruits}
          alignItemWithTrigger={false}
        >
          <Select.Trigger>
            <Select.Value
              data-testid='select-value'
              placeholder='Pick a fruit...'
            />
          </Select.Trigger>
          <Select.Positioner data-testid='select-positioner'>
            <Select.Popup data-testid='select-popup'>
              <Select.Item
                value='apple'
                label='Apple'
                aria-disabled={false}
              >
                Apple
              </Select.Item>
              <Select.Item
                value='banana'
                label='Banana'
              >
                Banana
              </Select.Item>
              <Select.Item
                value='cherry'
                label='Cherry'
              >
                Cherry
              </Select.Item>
            </Select.Popup>
          </Select.Positioner>
        </Select.Root>,
      );

      await user.click(screen.getByRole('combobox'));
      await user.keyboard('{Home}');

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-disabled', 'false');
      expect(options[0]).toHaveAttribute('data-active');
    });
  });

  describe('multiple', () => {
    function renderMultiple(
      props: Omit<React.ComponentProps<typeof Select.Root>, 'multiple' | 'children'> & {
        value?: string[];
        defaultValue?: string[];
        onValueChange?: (value: string[]) => void;
        renderValue?: (value: string[]) => React.ReactNode;
        disabledValue?: string;
      },
    ) {
      const { renderValue, disabledValue, ...rootProps } = props;
      return render(
        <Select.Root
          items={fruits}
          alignItemWithTrigger={false}
          {...rootProps}
          multiple
        >
          <Select.Trigger>
            <Select.Value
              data-testid='select-value'
              placeholder='Pick fruits...'
            >
              {renderValue}
            </Select.Value>
          </Select.Trigger>
          <Select.Positioner data-testid='select-positioner'>
            <Select.Popup data-testid='select-popup'>
              {fruits.map(({ label, value }) => (
                <Select.Item
                  key={value}
                  value={value}
                  label={label}
                  disabled={value === disabledValue}
                >
                  {label}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Root>,
      );
    }

    function valueText() {
      return document.querySelector('[data-testid="select-value"]')?.textContent;
    }

    it('adds and removes values on click and keeps the popup open', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      renderMultiple({ defaultValue: ['apple'], onValueChange });

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Cherry'));
      expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'cherry']);

      await user.click(screen.getByText('Apple'));
      expect(onValueChange).toHaveBeenLastCalledWith(['cherry']);

      expect(screen.getByRole('combobox')).toHaveAttribute('data-open', '');
      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'false');
      expect(options[2]).toHaveAttribute('aria-selected', 'true');
    });

    it('toggles the active option with Enter and keeps the popup open', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      renderMultiple({ onValueChange });

      await user.click(screen.getByRole('combobox'));
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange.mock.calls[0]?.[0]).toHaveLength(1);
      expect(screen.getByRole('combobox')).toHaveAttribute('data-open', '');

      await user.keyboard('{Escape}');
      expect(screen.getByRole('combobox')).toHaveAttribute('data-closed', '');
    });

    it('marks every selected option and the listbox as multiselectable', () => {
      renderMultiple({ defaultValue: ['apple', 'cherry'], defaultOpen: true });

      const options = screen.getAllByRole('option');
      expect(options.map(option => option.getAttribute('aria-selected'))).toEqual(['true', 'false', 'true']);
      expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
    });

    it('shows the placeholder for an empty selection', () => {
      renderMultiple({ defaultValue: [] });
      expect(valueText()).toBe('Pick fruits...');
    });

    it('joins the selected labels in value order', () => {
      renderMultiple({ defaultValue: ['cherry', 'apple'] });
      expect(valueText()).toBe('Cherry, Apple');
    });

    it('passes the selected values to a Value render function', () => {
      renderMultiple({
        defaultValue: ['banana', 'cherry'],
        renderValue: value => `${value.length} selected`,
      });
      expect(valueText()).toBe('2 selected');
    });

    it('keeps the labels after the popup closes', async () => {
      const user = userEvent.setup();
      renderMultiple({});

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Banana'));
      await user.click(screen.getByText('Apple'));
      await user.keyboard('{Escape}');

      expect(valueText()).toBe('Banana, Apple');
    });

    it('keeps the displayed values when the controlled parent rejects the change', async () => {
      const user = userEvent.setup();
      renderMultiple({ value: ['apple'], onValueChange: () => {} });

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Banana'));

      expect(valueText()).toBe('Apple');
      expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'false');
    });

    it('does not toggle a disabled option', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      renderMultiple({ onValueChange, disabledValue: 'banana' });

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Banana'));

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('opens on the last selected value', async () => {
      const user = userEvent.setup();
      renderMultiple({ defaultValue: ['apple', 'cherry'] });

      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{ArrowDown}');

      const options = screen.getAllByRole('option');
      await waitFor(() => expect(document.activeElement).toBe(options[2]));
      expect(options[2]).toHaveAttribute('data-active', '');
    });

    it('reopens on the first option after the last value is removed', async () => {
      const user = userEvent.setup();
      renderMultiple({ defaultValue: ['cherry'] });

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      await user.click(screen.getByRole('option', { name: 'Cherry' }));
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

      trigger.focus();
      await user.keyboard('{ArrowDown}');

      const options = screen.getAllByRole('option');
      await waitFor(() => expect(document.activeElement).toBe(options[0]));
    });
  });

  describe('select all', () => {
    function renderSelectAll(
      props: {
        value?: string[];
        defaultValue?: string[];
        onValueChange?: (value: string[]) => void;
        disabledValues?: string[];
        selectAll?: React.ComponentProps<typeof Select.SelectAll>;
      } = {},
    ) {
      const { disabledValues = [], selectAll, ...rootProps } = props;
      return render(
        <Select.Root
          items={fruits}
          alignItemWithTrigger={false}
          {...rootProps}
          multiple
        >
          <Select.Trigger aria-label='Fruits'>
            <Select.Value placeholder='Pick fruits...' />
          </Select.Trigger>
          <Select.Positioner>
            <Select.Popup>
              <Select.SelectAll {...selectAll}>Select all</Select.SelectAll>
              <Select.Separator />
              {fruits.map(({ label, value }) => (
                <Select.Item
                  key={value}
                  value={value}
                  label={label}
                  disabled={disabledValues.includes(value)}
                >
                  {label}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Root>,
      );
    }

    function selectAllOption() {
      return screen.getByRole('option', { name: 'Select all' });
    }

    it('selects every option, keeping the popup open, then clears them on a second press', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      renderSelectAll({ onValueChange });

      await user.click(screen.getByRole('combobox'));
      await user.click(selectAllOption());
      expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'banana', 'cherry']);
      expect(selectAllOption()).toHaveAttribute('aria-selected', 'true');
      expect(selectAllOption()).toHaveAttribute('aria-checked', 'true');
      expect(selectAllOption()).toHaveAttribute('data-checked', '');
      expect(screen.getByRole('combobox')).toHaveAttribute('data-open', '');

      await user.click(selectAllOption());
      expect(onValueChange).toHaveBeenLastCalledWith([]);
      expect(selectAllOption()).toHaveAttribute('aria-selected', 'false');
      expect(selectAllOption()).toHaveAttribute('aria-checked', 'false');
      expect(selectAllOption()).not.toHaveAttribute('data-checked');
    });

    it('shows the mixed state while some options are selected, and selects the rest on press', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      renderSelectAll({ defaultValue: ['cherry'], onValueChange });

      await user.click(screen.getByRole('combobox'));
      expect(selectAllOption()).toHaveAttribute('data-indeterminate', '');
      expect(selectAllOption()).toHaveAttribute('aria-selected', 'false');
      expect(selectAllOption()).toHaveAttribute('aria-checked', 'mixed');

      await user.click(selectAllOption());
      expect(onValueChange).toHaveBeenLastCalledWith(['cherry', 'apple', 'banana']);
      expect(selectAllOption()).not.toHaveAttribute('data-indeterminate');
    });

    it('leaves disabled options as they are', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      renderSelectAll({ defaultValue: ['banana'], disabledValues: ['banana', 'cherry'], onValueChange });

      await user.click(screen.getByRole('combobox'));
      await user.click(selectAllOption());
      expect(onValueChange).toHaveBeenLastCalledWith(['banana', 'apple']);
      expect(selectAllOption()).toHaveAttribute('data-checked', '');

      await user.click(selectAllOption());
      expect(onValueChange).toHaveBeenLastCalledWith(['banana']);
    });

    it('is disabled when every option is disabled', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      renderSelectAll({ disabledValues: ['apple', 'banana', 'cherry'], onValueChange });

      await user.click(screen.getByRole('combobox'));
      expect(selectAllOption()).toHaveAttribute('aria-disabled', 'true');
      expect(selectAllOption()).toHaveAttribute('data-disabled', '');

      await user.click(selectAllOption());
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('is disabled by its disabled prop, whatever element it renders', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      renderSelectAll({ selectAll: { disabled: true, render: <div /> }, onValueChange });

      await user.click(screen.getByRole('combobox'));
      expect(selectAllOption()).toHaveAttribute('aria-disabled', 'true');
      expect(selectAllOption()).toHaveAttribute('data-disabled', '');

      await user.click(selectAllOption());
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('stays checked while disabled when every option is selected', async () => {
      const user = userEvent.setup();
      renderSelectAll({ selectAll: { disabled: true }, defaultValue: ['apple', 'banana', 'cherry'] });

      await user.click(screen.getByRole('combobox'));
      expect(selectAllOption()).toHaveAttribute('aria-checked', 'true');
      expect(selectAllOption()).toHaveAttribute('data-checked', '');
      expect(selectAllOption()).not.toHaveAttribute('data-indeterminate');
    });

    it('keeps the label of a selected value whose option is not rendered', async () => {
      const user = userEvent.setup();
      render(
        <Select.Root
          items={[...fruits, { label: 'Durian', value: 'durian' }]}
          alignItemWithTrigger={false}
          defaultValue={['durian']}
          multiple
        >
          <Select.Trigger aria-label='Fruits'>
            <Select.Value data-testid='select-value' />
          </Select.Trigger>
          <Select.Positioner>
            <Select.Popup>
              <Select.SelectAll>Select all</Select.SelectAll>
              {fruits.map(({ label, value }) => (
                <Select.Item
                  key={value}
                  value={value}
                  label={label}
                >
                  {label}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Root>,
      );

      await user.click(screen.getByRole('combobox'));
      await user.click(selectAllOption());

      expect(screen.getByTestId('select-value')).toHaveTextContent('Durian, Apple, Banana, Cherry');
    });

    it('is reached with the arrow keys and pressed with Enter', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      renderSelectAll({ onValueChange });

      screen.getByRole('combobox').focus();
      await user.keyboard('{ArrowDown}');
      await waitFor(() => expect(document.activeElement).toBe(selectAllOption()));
      await user.keyboard('{Enter}');

      expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'banana', 'cherry']);
    });

    it('hides the separator from assistive tech and skips it with the arrow keys', async () => {
      const user = userEvent.setup();
      renderSelectAll();

      screen.getByRole('combobox').focus();
      await user.keyboard('{ArrowDown}');
      await waitFor(() => expect(document.activeElement).toBe(selectAllOption()));
      await user.keyboard('{ArrowDown}');

      expect(document.activeElement).toBe(screen.getByRole('option', { name: 'Apple' }));
      expect(screen.queryByRole('separator')).toBeNull();
    });

    it.each([
      ['Control', '{Control>}a{/Control}'],
      ['Meta', '{Meta>}a{/Meta}'],
    ])('toggles every option with %s+A', async (_, keys) => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      renderSelectAll({ onValueChange });

      screen.getByRole('combobox').focus();
      await user.keyboard('{ArrowDown}');
      await waitFor(() => expect(document.activeElement).toBe(selectAllOption()));

      await user.keyboard(keys);
      expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'banana', 'cherry']);

      await user.keyboard(keys);
      expect(onValueChange).toHaveBeenLastCalledWith([]);
    });

    it('leaves the value alone on Control+A while the Select all row is disabled', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      renderSelectAll({ selectAll: { disabled: true }, onValueChange });

      screen.getByRole('combobox').focus();
      await user.keyboard('{ArrowDown}');
      await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('option', { name: 'Apple' })));
      await user.keyboard('{Control>}a{/Control}');

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('leaves the value alone on Control+A without a Select all row', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      render(
        <Select.Root
          items={fruits}
          alignItemWithTrigger={false}
          multiple
          onValueChange={onValueChange}
        >
          <Select.Trigger aria-label='Fruits'>
            <Select.Value />
          </Select.Trigger>
          <Select.Positioner>
            <Select.Popup>
              {fruits.map(({ label, value }) => (
                <Select.Item
                  key={value}
                  value={value}
                  label={label}
                >
                  {label}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Root>,
      );

      screen.getByRole('combobox').focus();
      await user.keyboard('{ArrowDown}');
      await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('option', { name: 'Apple' })));
      await user.keyboard('{Control>}a{/Control}');

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('follows a controlled value', async () => {
      const user = userEvent.setup();
      function Controlled() {
        const [value, setValue] = useState<string[]>(['apple']);
        return (
          <>
            <output data-testid='value'>{value.join(',')}</output>
            <Select.Root
              items={fruits}
              alignItemWithTrigger={false}
              multiple
              value={value}
              onValueChange={setValue}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Positioner>
                <Select.Popup>
                  <Select.SelectAll>Select all</Select.SelectAll>
                  {fruits.map(({ label, value: optionValue }) => (
                    <Select.Item
                      key={optionValue}
                      value={optionValue}
                      label={label}
                    >
                      {label}
                    </Select.Item>
                  ))}
                </Select.Popup>
              </Select.Positioner>
            </Select.Root>
          </>
        );
      }
      render(<Controlled />);

      await user.click(screen.getByRole('combobox'));
      await user.click(selectAllOption());
      expect(screen.getByTestId('value')).toHaveTextContent('apple,banana,cherry');
      expect(screen.getByRole('combobox')).toHaveTextContent('Apple, Banana, Cherry');
    });

    it('has no axe violations in the mixed state', async () => {
      const user = userEvent.setup();
      const { container } = renderSelectAll({ defaultValue: ['apple'] });
      await user.click(screen.getByRole('combobox'));
      expect(await axe(container)).toHaveNoViolations();
    });

    it('renders nothing without multiple', () => {
      render(
        <Select.Root
          items={fruits}
          defaultOpen
        >
          <Select.Positioner>
            <Select.Popup>
              <Select.SelectAll>Select all</Select.SelectAll>
            </Select.Popup>
          </Select.Positioner>
        </Select.Root>,
      );
      expect(screen.queryByRole('option', { name: 'Select all' })).not.toBeInTheDocument();
    });
  });

  it('forwards refs to the value and the options', () => {
    const value = createRef<HTMLSpanElement>();
    const option = createRef<HTMLButtonElement>();
    render(
      <Select.Root
        items={fruits}
        defaultOpen
        alignItemWithTrigger={false}
      >
        <Select.Trigger>
          <Select.Value
            ref={value}
            data-testid='select-value'
            placeholder='Pick a fruit...'
          />
        </Select.Trigger>
        <Select.Positioner>
          <Select.Popup>
            <Select.Item
              ref={option}
              value='apple'
              label='Apple'
            >
              Apple
            </Select.Item>
          </Select.Popup>
        </Select.Positioner>
      </Select.Root>,
    );
    expect(value.current).toBe(screen.getByTestId('select-value'));
    expect(option.current).toBe(screen.getByRole('option', { name: 'Apple' }));
  });
});

describe('Select.ItemIndicator', () => {
  function renderIndicators(props: { keepMounted?: boolean; multiple?: boolean; defaultValue?: string | string[] }) {
    const { keepMounted, multiple, defaultValue } = props;
    const items = fruits.map(({ label, value }) => (
      <Select.Item
        key={value}
        value={value}
        label={label}
      >
        {label}
        <Select.ItemIndicator
          data-testid={`indicator-${value}`}
          keepMounted={keepMounted}
        />
      </Select.Item>
    ));
    const popup = (
      <Select.Positioner>
        <Select.Popup>{items}</Select.Popup>
      </Select.Positioner>
    );
    if (multiple) {
      return render(
        <Select.Root
          multiple
          items={fruits}
          alignItemWithTrigger={false}
          defaultOpen
          defaultValue={Array.isArray(defaultValue) ? defaultValue : []}
        >
          <Select.Trigger>
            <Select.Value placeholder='Pick fruits...' />
          </Select.Trigger>
          {popup}
        </Select.Root>,
      );
    }
    return render(
      <Select.Root
        items={fruits}
        alignItemWithTrigger={false}
        defaultOpen
        defaultValue={typeof defaultValue === 'string' ? defaultValue : null}
      >
        <Select.Trigger>
          <Select.Value placeholder='Pick a fruit...' />
        </Select.Trigger>
        {popup}
      </Select.Root>,
    );
  }

  it('renders only inside the selected item, hidden from assistive technology', () => {
    renderIndicators({ defaultValue: 'banana' });

    expect(screen.queryByTestId('indicator-apple')).not.toBeInTheDocument();
    expect(screen.getByTestId('indicator-banana')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByTestId('indicator-cherry')).not.toBeInTheDocument();
  });

  it('renders in every item with keepMounted, marking only the selected one', () => {
    renderIndicators({ keepMounted: true, defaultValue: 'banana' });

    expect(screen.getByTestId('indicator-apple')).not.toHaveAttribute('data-selected');
    expect(screen.getByTestId('indicator-apple')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('indicator-banana')).toHaveAttribute('data-selected', '');
    expect(screen.getByTestId('indicator-cherry')).not.toHaveAttribute('data-selected');
  });

  it('follows the selection as items are toggled with multiple', async () => {
    const user = userEvent.setup();
    renderIndicators({ multiple: true, defaultValue: ['apple'] });

    await user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(screen.getByTestId('indicator-apple')).toBeInTheDocument();
    expect(screen.getByTestId('indicator-banana')).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Apple' }));
    expect(screen.queryByTestId('indicator-apple')).not.toBeInTheDocument();
    expect(screen.getByTestId('indicator-banana')).toBeInTheDocument();
  });

  it('requires an item around it', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Select.ItemIndicator />)).toThrow('Select.ItemIndicator must be used within Select.Item');
  });
});

describe('Select.Group', () => {
  function renderGrouped(props: { defaultOpen?: boolean; defaultValue?: string } = { defaultOpen: true }) {
    return render(
      <Select.Root
        items={fruits}
        alignItemWithTrigger={false}
        {...props}
      >
        <Select.Trigger aria-label='Fruit'>
          <Select.Value placeholder='Pick a fruit...' />
        </Select.Trigger>
        <Select.Positioner>
          <Select.Popup>
            <Select.Group>
              <Select.GroupLabel>Pome</Select.GroupLabel>
              <Select.Item
                value='apple'
                label='Apple'
              >
                Apple
              </Select.Item>
            </Select.Group>
            <Select.Group>
              <Select.GroupLabel>Other</Select.GroupLabel>
              <Select.Item
                value='banana'
                label='Banana'
              >
                Banana
              </Select.Item>
              <Select.Item
                value='cherry'
                label='Cherry'
              >
                Cherry
              </Select.Item>
            </Select.Group>
          </Select.Popup>
        </Select.Positioner>
      </Select.Root>,
    );
  }

  it('names each group by its label', () => {
    renderGrouped();
    const pome = screen.getByRole('group', { name: 'Pome' });
    const other = screen.getByRole('group', { name: 'Other' });
    expect(pome).toContainElement(screen.getByRole('option', { name: 'Apple' }));
    expect(other).toContainElement(screen.getByRole('option', { name: 'Cherry' }));
  });

  it('moves the active option across groups with the arrow keys', async () => {
    const user = userEvent.setup();
    renderGrouped({ defaultValue: 'apple' });
    screen.getByRole('combobox').focus();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('option', { name: 'Apple' })).toHaveFocus());

    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('option', { name: 'Banana' })).toHaveFocus();
  });

  it('has no violations when open', async () => {
    renderGrouped();
    expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });

  it('forwards refs to the group and its label', () => {
    const groupRef = createRef<HTMLDivElement>();
    const labelRef = createRef<HTMLDivElement>();
    render(
      <Select.Group ref={groupRef}>
        <Select.GroupLabel ref={labelRef}>Pome</Select.GroupLabel>
      </Select.Group>,
    );

    expect(groupRef.current).toBe(screen.getByRole('group', { name: 'Pome' }));
    expect(labelRef.current).toHaveTextContent('Pome');
  });

  it('throws when the label is used outside <Select.Group>', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Select.GroupLabel>Fruits</Select.GroupLabel>)).toThrow(/within <Select.Group>/);
  });
});

describe('Select item renders', () => {
  it('re-renders only the options whose highlight changes in a multiple select', async () => {
    const user = userEvent.setup();
    const renders: string[] = [];
    const options = [...fruits, { label: 'Date', value: 'date' }];
    render(
      <Select.Root
        items={options}
        alignItemWithTrigger={false}
        multiple
        defaultValue={['banana']}
      >
        <Select.Trigger>
          <Select.Value placeholder='Pick a fruit...' />
        </Select.Trigger>
        <Select.Positioner>
          <Select.Popup>
            {options.map(({ label, value }) => (
              <Select.Item
                key={value}
                value={value}
                label={label}
                render={props => {
                  renders.push(value);
                  return (
                    <button
                      type='button'
                      {...props}
                    />
                  );
                }}
              >
                {label}
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Root>,
    );
    await user.click(screen.getByRole('combobox'));
    await waitFor(() => expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('data-active'));

    renders.length = 0;
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('data-active');
    expect(new Set(renders)).toEqual(new Set(['banana', 'cherry']));

    await user.keyboard('{Enter}');
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true');
  });

  it('re-renders only the options whose highlight changes in a controlled single select', async () => {
    const user = userEvent.setup();
    const renders: string[] = [];
    render(
      <Select.Root
        items={fruits}
        alignItemWithTrigger={false}
        value='banana'
        onValueChange={() => {}}
      >
        <Select.Trigger>
          <Select.Value placeholder='Pick a fruit...' />
        </Select.Trigger>
        <Select.Positioner>
          <Select.Popup>
            {fruits.map(({ label, value }) => (
              <Select.Item
                key={value}
                value={value}
                label={label}
                render={props => {
                  renders.push(value);
                  return (
                    <button
                      type='button'
                      {...props}
                    />
                  );
                }}
              >
                {label}
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Root>,
    );
    await user.click(screen.getByRole('combobox'));
    await waitFor(() => expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('data-active'));

    renders.length = 0;
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('data-active');
    expect(new Set(renders)).toEqual(new Set(['banana', 'cherry']));
  });
});

describe('Select selection in a transition', () => {
  const neverResolves = new Promise<never>(() => {});
  function Suspends(): never {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- Suspending is React's thrown-thenable protocol; `React.use()` needs React 19.
    throw neverResolves;
  }

  type HoverRender = { item: string; hovered: string | null; active: boolean };
  type ItemRender = { item: string; parentValue: string; selected: unknown };

  function Fixture({
    update = 'transition',
    onRenderItem,
    suspendSelected = false,
    hoverInTransition = false,
    onRenderHover,
    suspendWhenActive,
  }: {
    update?: 'transition' | 'deferred';
    onRenderItem?: (render: ItemRender) => void;
    suspendSelected?: boolean;
    hoverInTransition?: boolean;
    onRenderHover?: (render: HoverRender) => void;
    suspendWhenActive?: string;
  }) {
    const [value, setValue] = useState<string>('');
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
          <Select.Root
            open
            items={fruits}
            alignItemWithTrigger={false}
            value={parentValue}
            onValueChange={next => (update === 'deferred' ? setValue(next) : startTransition(() => setValue(next)))}
          >
            <Select.Trigger>
              <Select.Value placeholder='Pick a fruit...' />
            </Select.Trigger>
            <Select.Positioner>
              <Select.Popup>
                {fruits.map(fruit => (
                  <Select.Item
                    key={fruit.value}
                    value={fruit.value}
                    label={fruit.label}
                    render={props => {
                      onRenderItem?.({ item: fruit.value, parentValue, selected: props['aria-selected'] });
                      const active = 'data-active' in props;
                      onRenderHover?.({ item: fruit.value, hovered, active });
                      return (
                        <button
                          type='button'
                          {...props}
                          onMouseMove={
                            hoverInTransition
                              ? event =>
                                  startTransition(() => {
                                    setHovered(fruit.value);
                                    props.onMouseMove?.(event);
                                  })
                              : props.onMouseMove
                          }
                        >
                          {props.children}
                          {suspendSelected && props['aria-selected'] ? <Suspends /> : null}
                          {active && suspendWhenActive === fruit.value ? <Suspends /> : null}
                        </button>
                      );
                    }}
                  >
                    {fruit.label}
                  </Select.Item>
                ))}
              </Select.Popup>
            </Select.Positioner>
          </Select.Root>
        </Suspense>
      </>
    );
  }

  describe.each(['transition', 'deferred'] as const)('when the parent updates the value with %s', update => {
    it('renders each option with the selection its parent passed down', async () => {
      const user = userEvent.setup();
      const renders: ItemRender[] = [];
      render(
        <Fixture
          update={update}
          onRenderItem={entry => renders.push(entry)}
        />,
      );

      await user.click(await screen.findByRole('option', { name: 'Banana' }));

      await waitFor(() =>
        expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true'),
      );
      expect(renders).not.toContainEqual({ item: 'banana', parentValue: 'banana', selected: false });
    });

    it('renders the new selection in the same render as its parent, with no second pass', async () => {
      const user = userEvent.setup();
      const renders: ItemRender[] = [];
      render(
        <Fixture
          update={update}
          onRenderItem={entry => renders.push(entry)}
        />,
      );

      await user.click(await screen.findByRole('option', { name: 'Banana' }));

      await waitFor(() =>
        expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true'),
      );
      expect(renders.filter(entry => entry.item === 'banana' && entry.parentValue === 'banana')).toEqual([
        { item: 'banana', parentValue: 'banana', selected: true },
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

      await user.click(await screen.findByRole('option', { name: 'Banana' }));

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

    screen.getByRole('option', { name: 'Apple' }).focus();
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('data-active');
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
    expect(renders).not.toContainEqual({ item: 'banana', hovered: 'banana', active: false });
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
