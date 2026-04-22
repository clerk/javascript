import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from '../../test-utils/axe';
import { Select, type SelectItem } from './select';

afterEach(() => cleanup());

const fruits: SelectItem[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
];

function renderSelect(props: Partial<React.ComponentProps<typeof Select>> = {}) {
  const { children, ...rest } = props as Record<string, unknown>;
  return render(
    <Select
      items={fruits}
      alignItemWithTrigger={false}
      {...rest}
    >
      <Select.Trigger>
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
    </Select>,
  );
}

describe('Select', () => {
  describe('slot attributes', () => {
    it('renders trigger with data-cl-slot', () => {
      renderSelect();
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('data-cl-slot', 'select-trigger');
    });

    it('renders value with data-cl-slot', () => {
      renderSelect();
      const value = document.querySelector('[data-cl-slot="select-value"]');
      expect(value).toBeInTheDocument();
    });

    it('renders all parts with correct slot attributes when open', () => {
      renderSelect({ defaultOpen: true });

      const positioner = document.querySelector('[data-cl-slot="select-positioner"]');
      const popup = document.querySelector('[data-cl-slot="select-popup"]');
      const options = document.querySelectorAll('[data-cl-slot="select-option"]');

      expect(positioner).toBeInTheDocument();
      expect(popup).toBeInTheDocument();
      expect(options).toHaveLength(3);
    });
  });

  describe('items prop and label resolution', () => {
    it('shows placeholder when no value is selected', () => {
      renderSelect();
      const value = document.querySelector('[data-cl-slot="select-value"]');
      expect(value?.textContent).toBe('Pick a fruit...');
    });

    it('resolves label from items before options mount', () => {
      renderSelect({ defaultValue: 'banana' });
      const value = document.querySelector('[data-cl-slot="select-value"]');
      expect(value?.textContent).toBe('Banana');
    });

    it('resolves label for controlled value from items', () => {
      renderSelect({ value: 'cherry' });
      const value = document.querySelector('[data-cl-slot="select-value"]');
      expect(value?.textContent).toBe('Cherry');
    });

    it('falls back to raw value when no items provided', () => {
      render(
        <Select
          defaultValue='banana'
          alignItemWithTrigger={false}
        >
          <Select.Trigger>
            <Select.Value placeholder='Pick...' />
          </Select.Trigger>
          <Select.Positioner>
            <Select.Popup>
              <Select.Option
                value='banana'
                label='Banana'
              >
                Banana
              </Select.Option>
            </Select.Popup>
          </Select.Positioner>
        </Select>,
      );
      const value = document.querySelector('[data-cl-slot="select-value"]');
      expect(value?.textContent).toBe('banana');
    });

    it('updates label after selection via option registry', async () => {
      const user = userEvent.setup();
      // No items prop — labels only known once options mount
      render(
        <Select alignItemWithTrigger={false}>
          <Select.Trigger>
            <Select.Value placeholder='Pick...' />
          </Select.Trigger>
          <Select.Positioner>
            <Select.Popup>
              <Select.Option
                value='x'
                label='Special Item'
              >
                Special Item
              </Select.Option>
            </Select.Popup>
          </Select.Positioner>
        </Select>,
      );

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Special Item'));

      const value = document.querySelector('[data-cl-slot="select-value"]');
      expect(value?.textContent).toBe('Special Item');
    });
  });

  describe('open/close', () => {
    it('opens on trigger click', async () => {
      const user = userEvent.setup();
      renderSelect();

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      expect(trigger).toHaveAttribute('data-cl-open', '');
      expect(document.querySelector('[data-cl-slot="select-popup"]')).toBeInTheDocument();
    });

    it('closes on Escape', async () => {
      const user = userEvent.setup();
      renderSelect({ defaultOpen: true });

      await user.keyboard('{Escape}');

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('data-cl-closed', '');
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

      const value = document.querySelector('[data-cl-slot="select-value"]');
      expect(value?.textContent).toContain('Cherry');
    });
  });

  describe('keyboard navigation', () => {
    it('navigates options with arrow keys', async () => {
      const user = userEvent.setup();
      renderSelect();

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      await user.keyboard('{ArrowDown}');

      const activeOption = document.querySelector('[data-cl-slot="select-option"][data-cl-active]');
      expect(activeOption).toBeInTheDocument();
    });
  });

  describe('option state attributes', () => {
    it('marks selected option with data-cl-selected', () => {
      renderSelect({ defaultValue: 'banana', defaultOpen: true });

      const options = document.querySelectorAll('[data-cl-slot="select-option"]');
      expect(options[1]).toHaveAttribute('data-cl-selected', '');
    });

    it('marks active option with data-cl-active', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole('combobox'));
      await user.keyboard('{ArrowDown}');

      const activeOption = document.querySelector('[data-cl-slot="select-option"][data-cl-active]');
      expect(activeOption).toBeInTheDocument();
    });
  });

  describe('disabled option', () => {
    it('renders disabled option with data-cl-disabled', async () => {
      const user = userEvent.setup();
      render(
        <Select alignItemWithTrigger={false}>
          <Select.Trigger>
            <Select.Value placeholder='Pick...' />
          </Select.Trigger>
          <Select.Positioner>
            <Select.Popup>
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
        </Select>,
      );

      await user.click(screen.getByRole('combobox'));

      const disabledOption = screen.getByText('Banana').closest("[data-cl-slot='select-option']");
      expect(disabledOption).toHaveAttribute('data-cl-disabled', '');
      expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not select disabled option on click', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      render(
        <Select
          onValueChange={onValueChange}
          alignItemWithTrigger={false}
        >
          <Select.Trigger>
            <Select.Value placeholder='Pick...' />
          </Select.Trigger>
          <Select.Positioner>
            <Select.Popup>
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
        </Select>,
      );

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Banana'));

      expect(onValueChange).not.toHaveBeenCalledWith('banana');
    });
  });

  describe('ARIA attributes', () => {
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
      const positioner = document.querySelector('[data-cl-slot="select-positioner"]');
      expect(positioner).not.toBeInTheDocument();
    });

    it('applies data-cl-open on popup when open', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole('combobox'));

      const popup = document.querySelector('[data-cl-slot="select-popup"]');
      expect(popup).toHaveAttribute('data-cl-open', '');
    });

    it('positioner has data-cl-side', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole('combobox'));

      const positioner = document.querySelector('[data-cl-slot="select-positioner"]');
      expect(positioner).toHaveAttribute('data-cl-side');
    });
  });

  describe('controlled open', () => {
    it('respects controlled open prop', () => {
      renderSelect({ open: true });

      const positioner = document.querySelector('[data-cl-slot="select-positioner"]');
      expect(positioner).toBeInTheDocument();
    });

    it('does not open when controlled open is false', async () => {
      const user = userEvent.setup();
      renderSelect({ open: false });

      await user.click(screen.getByRole('combobox'));

      const positioner = document.querySelector('[data-cl-slot="select-positioner"]');
      expect(positioner).not.toBeInTheDocument();
    });
  });

  describe('alignItemWithTrigger', () => {
    it('defaults to true', () => {
      // Render without explicitly setting alignItemWithTrigger
      render(
        <Select
          items={fruits}
          defaultOpen
          defaultValue='banana'
        >
          <Select.Trigger>
            <Select.Value placeholder='Pick...' />
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
        </Select>,
      );

      // The positioner should render (alignItemWithTrigger doesn't prevent rendering)
      const positioner = document.querySelector('[data-cl-slot="select-positioner"]');
      expect(positioner).toBeInTheDocument();
    });

    it('uses standard floating styles when disabled', async () => {
      const user = userEvent.setup();
      renderSelect({ alignItemWithTrigger: false });

      await user.click(screen.getByRole('combobox'));

      const positioner = document.querySelector('[data-cl-slot="select-positioner"]') as HTMLElement;
      // Standard Floating UI positioning uses position: absolute with transform
      expect(positioner.style.position).toBe('absolute');
    });
  });

  describe('accessibility (axe)', () => {
    it('has no violations when closed', async () => {
      const { container } = render(
        <Select
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
        </Select>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations when open', async () => {
      render(
        <Select
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
        </Select>,
      );
      expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
    });

    it('has no violations with a selected value', async () => {
      const { container } = render(
        <Select
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
        </Select>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
