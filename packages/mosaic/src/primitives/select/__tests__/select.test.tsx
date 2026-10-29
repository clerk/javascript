import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
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
            <Select.Option
              key={value}
              value={value}
              label={label}
            >
              {label}
            </Select.Option>
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
                <Select.Option
                  key={value}
                  value={value}
                  label={label}
                >
                  {label}
                </Select.Option>
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

    it('shows placeholder when the controlled value is an empty string', () => {
      renderSelect({ value: '' });
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
              <Select.Option
                value='banana'
                label='Banana'
              >
                Banana
              </Select.Option>
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
              <Select.Option
                value='x'
                label='Special Item'
              >
                Special Item
              </Select.Option>
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
                <Select.Option
                  key={value}
                  value={value}
                  label={label}
                >
                  {label}
                </Select.Option>
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

  describe('option state attributes', () => {
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

  describe('disabled option', () => {
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
              <Select.Option
                value='apple'
                label='Apple'
              >
                Apple
              </Select.Option>
              <Select.Option
                value='banana'
                label='Banana'
                disabled
              >
                Banana
              </Select.Option>
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
              <Select.Option
                value='apple'
                label='Apple'
              >
                Apple
              </Select.Option>
              <Select.Option
                value='banana'
                label='Banana'
                disabled
              >
                Banana
              </Select.Option>
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
                <Select.Option
                  key={value}
                  value={value}
                  label={label}
                >
                  {label}
                </Select.Option>
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
      renderSelect({ alignItemWithTrigger: true, value: '' });

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
                <Select.Option
                  key={value}
                  value={value}
                  label={label}
                >
                  {label}
                </Select.Option>
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
                <Select.Option
                  key={value}
                  value={value}
                  label={label}
                >
                  {label}
                </Select.Option>
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
                <Select.Option
                  key={value}
                  value={value}
                  label={label}
                >
                  {label}
                </Select.Option>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Root>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('option button type', () => {
    it('renders options with type="button" so they do not submit a wrapping form', () => {
      renderSelect({ defaultOpen: true });
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
      for (const option of options) {
        expect(option).toHaveAttribute('type', 'button');
      }
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
              <Select.Option
                value='apple'
                label='Apple'
                aria-disabled={false}
              >
                Apple
              </Select.Option>
              <Select.Option
                value='banana'
                label='Banana'
              >
                Banana
              </Select.Option>
              <Select.Option
                value='cherry'
                label='Cherry'
              >
                Cherry
              </Select.Option>
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
                <Select.Option
                  key={value}
                  value={value}
                  label={label}
                  disabled={value === disabledValue}
                >
                  {label}
                </Select.Option>
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
            <Select.Option
              ref={option}
              value='apple'
              label='Apple'
            >
              Apple
            </Select.Option>
          </Select.Popup>
        </Select.Positioner>
      </Select.Root>,
    );
    expect(value.current).toBe(screen.getByTestId('select-value'));
    expect(option.current).toBe(screen.getByRole('option', { name: 'Apple' }));
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
              <Select.Option
                value='apple'
                label='Apple'
              >
                Apple
              </Select.Option>
            </Select.Group>
            <Select.Group>
              <Select.GroupLabel>Other</Select.GroupLabel>
              <Select.Option
                value='banana'
                label='Banana'
              >
                Banana
              </Select.Option>
              <Select.Option
                value='cherry'
                label='Cherry'
              >
                Cherry
              </Select.Option>
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
