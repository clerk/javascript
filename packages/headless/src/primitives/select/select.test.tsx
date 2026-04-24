import { cleanup, render, screen, waitFor } from '@testing-library/react';
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

    it('scrolls options into view on arrow key navigation', async () => {
      const manyItems = Array.from({ length: 20 }, (_, i) => ({
        label: `Item ${i + 1}`,
        value: `item-${i + 1}`,
      }));

      const user = userEvent.setup();
      render(
        <Select
          items={manyItems}
          alignItemWithTrigger={false}
        >
          <Select.Trigger>
            <Select.Value placeholder='Pick...' />
          </Select.Trigger>
          <Select.Positioner>
            <Select.Popup>
              <div style={{ maxHeight: '100px', overflow: 'auto' }}>
                {manyItems.map(({ label, value }) => (
                  <Select.Option
                    key={value}
                    value={value}
                    label={label}
                  >
                    {label}
                  </Select.Option>
                ))}
              </div>
            </Select.Popup>
          </Select.Positioner>
        </Select>,
      );

      await user.click(screen.getByRole('combobox'));

      // Navigate down through many items to force scrolling
      for (let i = 0; i < 15; i++) {
        await user.keyboard('{ArrowDown}');
      }

      const activeOption = document.querySelector('[data-cl-slot="select-option"][data-cl-active]');
      expect(activeOption).toBeInTheDocument();

      // The active item should be visible within its scroll container
      const scrollContainer = activeOption!.closest('div[style]') as HTMLElement;
      const optionRect = activeOption!.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();

      expect(optionRect.bottom).toBeLessThanOrEqual(containerRect.bottom + 1);
      expect(optionRect.top).toBeGreaterThanOrEqual(containerRect.top - 1);
    });

    it('scrolls selected item into view when reopening', async () => {
      const manyItems = Array.from({ length: 20 }, (_, i) => ({
        label: `Item ${i + 1}`,
        value: `item-${i + 1}`,
      }));

      const user = userEvent.setup();
      render(
        <Select
          items={manyItems}
          alignItemWithTrigger={false}
        >
          <Select.Trigger>
            <Select.Value placeholder='Pick...' />
          </Select.Trigger>
          <Select.Positioner>
            <Select.Popup>
              <div style={{ maxHeight: '100px', overflow: 'auto' }}>
                {manyItems.map(({ label, value }) => (
                  <Select.Option
                    key={value}
                    value={value}
                    label={label}
                  >
                    {label}
                  </Select.Option>
                ))}
              </div>
            </Select.Popup>
          </Select.Positioner>
        </Select>,
      );

      const trigger = screen.getByRole('combobox');

      // Open, navigate to item near the bottom, select it
      await user.click(trigger);
      for (let i = 0; i < 15; i++) {
        await user.keyboard('{ArrowDown}');
      }
      await user.keyboard('{Enter}');

      // Reopen — the selected item should be scrolled into view
      await user.click(trigger);

      const selectedOption = document.querySelector('[data-cl-slot="select-option"][data-cl-selected]');
      expect(selectedOption).toBeInTheDocument();

      const scrollContainer = selectedOption!.closest('div[style]') as HTMLElement;
      const optionRect = selectedOption!.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();

      expect(optionRect.bottom).toBeLessThanOrEqual(containerRect.bottom + 1);
      expect(optionRect.top).toBeGreaterThanOrEqual(containerRect.top - 1);
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

    const manyItems: SelectItem[] = Array.from({ length: 20 }, (_, i) => ({
      label: `Item ${i + 1}`,
      value: `item-${i + 1}`,
    }));

    it('aligns selected item with trigger vertically', async () => {
      render(
        <Select
          items={manyItems}
          defaultOpen
          defaultValue='item-10'
        >
          <Select.Trigger>
            <Select.Value placeholder='Pick...' />
          </Select.Trigger>
          <Select.Positioner>
            <Select.Popup>
              {manyItems.map(({ label, value }) => (
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

      const trigger = screen.getByRole('combobox');
      const selectedOption = document.querySelector('[data-cl-slot="select-option"][data-cl-selected]');
      expect(selectedOption).toBeInTheDocument();

      const triggerRect = trigger.getBoundingClientRect();
      const selectedRect = selectedOption!.getBoundingClientRect();

      // The selected item should be positioned near the trigger's vertical position
      expect(Math.abs(selectedRect.top - triggerRect.top)).toBeLessThan(50);
    });

    it('repositions when ancestor scrolls', async () => {
      const user = userEvent.setup();
      render(
        <div
          data-testid='scroll-container'
          style={{ height: '200px', overflow: 'auto', paddingTop: '300px' }}
        >
          <Select
            items={manyItems}
            defaultValue='item-5'
          >
            <Select.Trigger>
              <Select.Value placeholder='Pick...' />
            </Select.Trigger>
            <Select.Positioner>
              <Select.Popup>
                {manyItems.map(({ label, value }) => (
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
          </Select>
          <div style={{ height: '500px' }} />
        </div>,
      );

      await user.click(screen.getByRole('combobox'));

      const positioner = document.querySelector('[data-cl-slot="select-positioner"]') as HTMLElement;
      const initialTop = positioner.getBoundingClientRect().top;

      // Scroll the container
      const scrollContainer = screen.getByTestId('scroll-container');
      scrollContainer.scrollTop = 100;
      scrollContainer.dispatchEvent(new Event('scroll'));

      // autoUpdate repositions on scroll — wait for the update
      await waitFor(() => {
        const newTop = positioner.getBoundingClientRect().top;
        expect(newTop).not.toBe(initialTop);
      });
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
