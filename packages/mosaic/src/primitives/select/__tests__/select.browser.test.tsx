import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { Select, type SelectItem } from '../index';

afterEach(() => cleanup());

const manyItems: SelectItem[] = Array.from({ length: 20 }, (_, i) => ({
  label: `Item ${i + 1}`,
  value: `item-${i + 1}`,
}));

describe('Select in a real browser', () => {
  it('scrolls options into view on arrow key navigation', async () => {
    render(<ScrollingSelect />);

    await userEvent.click(screen.getByRole('combobox'));
    for (let i = 0; i < 15; i++) {
      await userEvent.keyboard('{ArrowDown}');
    }

    const activeOption = document.querySelector<HTMLElement>('[role="option"][data-active]');
    expect(activeOption).not.toBeNull();
    expect(offsetInList(activeOption)).toBeGreaterThan(scrollList().clientHeight);
    await expect.poll(() => isVisibleInList(activeOption)).toBe(true);
  });

  it('scrolls selected item into view when reopening', async () => {
    render(<ScrollingSelect />);
    const trigger = screen.getByRole('combobox');

    await userEvent.click(trigger);
    for (let i = 0; i < 15; i++) {
      await userEvent.keyboard('{ArrowDown}');
    }
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => screen.queryByRole('listbox')).toBeNull();

    await userEvent.click(trigger);

    const selectedOption = document.querySelector<HTMLElement>('[role="option"][data-selected]');
    expect(selectedOption).not.toBeNull();
    expect(offsetInList(selectedOption)).toBeGreaterThan(scrollList().clientHeight);
    await expect.poll(() => isVisibleInList(selectedOption)).toBe(true);
  });

  it('aligns selected item with trigger vertically', async () => {
    render(
      <div style={{ paddingTop: '400px' }}>
        <AlignedSelect
          defaultOpen
          defaultValue='item-10'
        />
      </div>,
    );
    const trigger = screen.getByRole('combobox');

    const selectedOption = document.querySelector<HTMLElement>('[role="option"][data-selected]');
    expect(selectedOption).not.toBeNull();
    expect(top(selectedOption) - top(screen.getByTestId('select-popup'))).toBeGreaterThan(50);
    await expect.poll(() => Math.abs(top(selectedOption) - top(trigger))).toBeLessThan(1);
  });

  it('repositions when ancestor scrolls', async () => {
    render(
      <div
        data-testid='scroll-container'
        style={{ height: '200px', overflow: 'auto', paddingTop: '300px' }}
      >
        <AlignedSelect defaultValue='item-5' />
        <div style={{ height: '500px' }} />
      </div>,
    );

    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);

    const positioner = screen.getByTestId('select-positioner');
    const initialTriggerTop = top(trigger);
    const gap = top(positioner) - initialTriggerTop;

    screen.getByTestId('scroll-container').scrollTop += 100;

    expect(top(trigger)).toBeLessThan(initialTriggerTop - 50);
    await expect.poll(() => Math.abs(top(positioner) - top(trigger) - gap)).toBeLessThan(1);
  });
});

function ScrollingSelect() {
  return (
    <Select.Root
      items={manyItems}
      alignItemWithTrigger={false}
    >
      <Select.Trigger>
        <Select.Value placeholder='Pick...' />
      </Select.Trigger>
      <Select.Positioner>
        <Select.Popup>
          <div
            data-testid='scroll-list'
            style={{ display: 'flex', flexDirection: 'column', maxHeight: '100px', overflow: 'auto' }}
          >
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
    </Select.Root>
  );
}

function AlignedSelect(props: { defaultValue: string; defaultOpen?: boolean }) {
  return (
    <Select.Root
      items={manyItems}
      {...props}
    >
      <Select.Trigger>
        <Select.Value placeholder='Pick...' />
      </Select.Trigger>
      <Select.Positioner data-testid='select-positioner'>
        <Select.Popup
          data-testid='select-popup'
          style={{ display: 'flex', flexDirection: 'column' }}
        >
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
    </Select.Root>
  );
}

function scrollList() {
  return screen.getByTestId('scroll-list');
}

function offsetInList(option: HTMLElement | null) {
  const list = scrollList();
  return top(option) - list.getBoundingClientRect().top + list.scrollTop;
}

function isVisibleInList(option: HTMLElement | null) {
  const listRect = scrollList().getBoundingClientRect();
  const optionRect = option?.getBoundingClientRect();
  return optionRect != null && optionRect.top >= listRect.top - 1 && optionRect.bottom <= listRect.bottom + 1;
}

function top(element: HTMLElement | null) {
  return element?.getBoundingClientRect().top ?? Number.NaN;
}
