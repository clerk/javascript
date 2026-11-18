import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  CompositeItemsProvider,
  type CompositeKeyEvent,
  useComposite,
  useCompositeItem,
  useCompositeItems,
  type UseCompositeOptions,
} from '../use-composite';

afterEach(() => cleanup());

interface ListProps extends Partial<UseCompositeOptions> {
  items?: { name: string; disabled?: boolean; ariaDisabled?: boolean }[];
  selected?: string;
}

const THREE = [{ name: 'One' }, { name: 'Two' }, { name: 'Three' }];

function List({ items = THREE, selected, ...options }: ListProps) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const composite = useComposite(element, {
    getItems: () => Array.from(element?.querySelectorAll<HTMLElement>('[data-item]') ?? []),
    preferred: {
      key: selected,
      getItem: () => element?.querySelector<HTMLElement>(`[data-name="${selected}"]`) ?? undefined,
    },
    ...options,
  });
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- Test host; the keys come from the focusable items inside it.
    <div
      ref={setElement}
      onKeyDown={composite.handleKeyDown}
    >
      {items.map(item => (
        <button
          key={item.name}
          data-item
          data-name={item.name}
          disabled={item.disabled}
          aria-disabled={item.ariaDisabled || undefined}
        >
          {item.name}
        </button>
      ))}
      <input aria-label='nested' />
    </div>
  );
}

const button = (name: string) => screen.getByRole('button', { name });

function tabStops() {
  return screen
    .getAllByRole('button')
    .filter(element => element.getAttribute('tabindex') === '0')
    .map(element => element.textContent);
}

describe('useComposite', () => {
  describe('tab stop', () => {
    it('has one tab stop, on the first item by default', () => {
      render(<List />);
      expect(tabStops()).toEqual(['One']);
      expect(button('Two')).toHaveAttribute('tabindex', '-1');
    });

    it('starts on the preferred item', () => {
      render(<List selected='Two' />);
      expect(tabStops()).toEqual(['Two']);
    });

    it('skips a disabled first item', () => {
      render(<List items={[{ name: 'One', disabled: true }, { name: 'Two' }]} />);
      expect(tabStops()).toEqual(['Two']);
    });

    it('does not rest on a preferred item that cannot take focus', () => {
      render(
        <List
          selected='One'
          items={[{ name: 'One', disabled: true }, { name: 'Two' }]}
        />,
      );
      expect(tabStops()).toEqual(['Two']);
    });

    it('follows focus from a click', async () => {
      render(<List />);
      await userEvent.click(button('Three'));
      expect(tabStops()).toEqual(['Three']);
    });

    it('follows a change of selection', () => {
      const { rerender } = render(<List selected='One' />);
      rerender(<List selected='Three' />);
      expect(tabStops()).toEqual(['Three']);
    });
  });

  describe('keys', () => {
    it('moves along the horizontal axis and ignores the other', async () => {
      render(<List orientation='horizontal' />);
      button('One').focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(button('Two')).toHaveFocus();
      await userEvent.keyboard('{ArrowDown}');
      expect(button('Two')).toHaveFocus();
    });

    it('moves along the vertical axis and ignores the other', async () => {
      render(<List orientation='vertical' />);
      button('One').focus();
      await userEvent.keyboard('{ArrowDown}');
      expect(button('Two')).toHaveFocus();
      await userEvent.keyboard('{ArrowRight}');
      expect(button('Two')).toHaveFocus();
    });

    it('flips horizontal arrows only in RTL', async () => {
      render(
        <List
          orientation='both'
          rtl
        />,
      );
      button('One').focus();
      await userEvent.keyboard('{ArrowLeft}');
      expect(button('Two')).toHaveFocus();
      await userEvent.keyboard('{ArrowDown}');
      expect(button('Three')).toHaveFocus();
    });

    it('loops by default and stops at the edges without loop', async () => {
      const { unmount } = render(<List orientation='horizontal' />);
      button('One').focus();
      await userEvent.keyboard('{ArrowLeft}');
      expect(button('Three')).toHaveFocus();
      unmount();

      render(
        <List
          orientation='horizontal'
          loop={false}
        />,
      );
      button('One').focus();
      await userEvent.keyboard('{ArrowLeft}');
      expect(button('One')).toHaveFocus();
    });

    it('goes to the first and last enabled items with Home and End', async () => {
      render(
        <List
          orientation='horizontal'
          items={[
            { name: 'One', ariaDisabled: true },
            { name: 'Two' },
            { name: 'Three' },
            { name: 'Four', disabled: true },
          ]}
        />,
      );
      button('Two').focus();
      await userEvent.keyboard('{End}');
      expect(button('Three')).toHaveFocus();
      await userEvent.keyboard('{Home}');
      expect(button('Two')).toHaveFocus();
    });

    it('skips disabled items', async () => {
      render(
        <List
          orientation='horizontal'
          items={[
            { name: 'One' },
            { name: 'Two', disabled: true },
            { name: 'Three', ariaDisabled: true },
            { name: 'Four' },
          ]}
        />,
      );
      button('One').focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(button('Four')).toHaveFocus();
    });

    it('does nothing when every item is disabled', async () => {
      const onNavigate = vi.fn();
      render(
        <List
          onNavigate={onNavigate}
          orientation='horizontal'
          items={[
            { name: 'One', ariaDisabled: true },
            { name: 'Two', ariaDisabled: true },
          ]}
        />,
      );
      button('One').focus();
      await userEvent.keyboard('{ArrowRight}{End}');
      expect(button('One')).toHaveFocus();
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it.each(['{Control>}', '{Meta>}', '{Shift>}', '{Alt>}'])('still moves with %s held', async modifier => {
      render(<List orientation='horizontal' />);
      button('One').focus();
      await userEvent.keyboard(`${modifier}{ArrowRight}`);
      expect(button('Two')).toHaveFocus();
    });

    it('can leave Home and End alone', async () => {
      render(
        <List
          orientation='horizontal'
          homeEnd={false}
        />,
      );
      button('Two').focus();
      await userEvent.keyboard('{Home}{End}');
      expect(button('Two')).toHaveFocus();
    });

    it('leaves keys from a nested field alone', async () => {
      render(<List orientation='horizontal' />);
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'abc');
      await userEvent.keyboard('{ArrowLeft}{Home}');
      expect(input).toHaveFocus();
      expect(input).toHaveProperty('selectionStart', 0);
    });

    it.each([
      ['arrows', '{ArrowRight}', false],
      ['arrows', '{End}', true],
      ['all', '{End}', false],
      ['none', '{ArrowRight}', true],
    ] as const)('with stopPropagation %s, %s reaching a parent is %s', async (mode, key, reaches) => {
      const onParent = vi.fn();
      render(
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- Test host; the keys come from the focusable items inside it.
        <div onKeyDown={onParent}>
          <List
            orientation='horizontal'
            stopPropagation={mode}
          />
        </div>,
      );
      button('One').focus();
      await userEvent.keyboard(key);
      expect(onParent).toHaveBeenCalledTimes(reaches ? 1 : 0);
    });

    it('ignores a modified key that is not a navigation key', async () => {
      render(<List orientation='horizontal' />);
      button('One').focus();
      await userEvent.keyboard('{Control>}c{/Control}');
      expect(button('One')).toHaveFocus();
    });

    it('keeps a nested composite separate from its parent', async () => {
      function Group({ names, children }: { names: string[]; children?: React.ReactNode }) {
        const [element, setElement] = useState<HTMLElement | null>(null);
        const composite = useComposite(element, {
          orientation: 'horizontal',
          getItems: () => Array.from(element?.querySelectorAll<HTMLElement>(':scope > button') ?? []),
        });
        return (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- Test host; the keys come from the focusable items inside it.
          <div
            ref={setElement}
            onKeyDown={composite.handleKeyDown}
          >
            {names.map(name => (
              <button key={name}>{name}</button>
            ))}
            {children}
          </div>
        );
      }
      render(
        <Group names={['Outer one', 'Outer two']}>
          <Group names={['Inner one', 'Inner two']} />
        </Group>,
      );
      await userEvent.click(button('Inner one'));
      await userEvent.keyboard('{ArrowRight}');
      expect(button('Inner two')).toHaveFocus();
      await userEvent.keyboard('{Home}');
      expect(button('Inner one')).toHaveFocus();
      expect(button('Outer one')).toHaveAttribute('tabindex', '0');
    });

    it('reports the item it moved to', async () => {
      const onNavigate = vi.fn();
      render(
        <List
          orientation='horizontal'
          onNavigate={onNavigate}
        />,
      );
      button('One').focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(onNavigate).toHaveBeenCalledExactlyOnceWith(button('Two'));
    });

    it('lets getNextItem take over a key or refuse it', async () => {
      const getNextItem = (event: CompositeKeyEvent, _target: HTMLElement, defaultNext: () => HTMLElement | null) => {
        if (event.key === 'ArrowRight') {
          return button('Three');
        }
        return event.key === 'ArrowLeft' ? null : defaultNext();
      };
      render(
        <List
          orientation='horizontal'
          getNextItem={getNextItem}
        />,
      );
      button('One').focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(button('Three')).toHaveFocus();
      await userEvent.keyboard('{ArrowLeft}');
      expect(button('Three')).toHaveFocus();
      await userEvent.keyboard('{Home}');
      expect(button('One')).toHaveFocus();
    });
  });

  describe('changing items', () => {
    it('moves focus to the nearest item when the focused item is removed', async () => {
      const { rerender } = render(<List recoverFocus />);
      button('Two').focus();
      rerender(
        <List
          recoverFocus
          items={[{ name: 'One' }, { name: 'Three' }]}
        />,
      );
      await act(async () => {});
      expect(button('Three')).toHaveFocus();
      expect(tabStops()).toEqual(['Three']);
    });

    it('does not move focus on removal unless asked', async () => {
      const { rerender } = render(<List />);
      button('Two').focus();
      rerender(<List items={[{ name: 'One' }, { name: 'Three' }]} />);
      await act(async () => {});
      expect(document.body).toHaveFocus();
    });

    it('does not take focus when an unfocused active item is removed', async () => {
      const { rerender } = render(<List recoverFocus />);
      await userEvent.click(button('Two'));
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.tab();
      const focused = document.activeElement;
      rerender(
        <List
          recoverFocus
          items={[{ name: 'One' }, { name: 'Three' }]}
        />,
      );
      await act(async () => {});
      expect(document.activeElement).toBe(focused);
      expect(tabStops()).toEqual(['Three']);
    });

    it('moves the tab stop when the active item becomes disabled', () => {
      const { rerender } = render(<List />);
      rerender(<List items={[{ name: 'One', disabled: true }, { name: 'Two' }, { name: 'Three' }]} />);
      expect(tabStops()).toEqual(['Two']);
    });

    it('tabs back to a neighbour after the active item was removed', async () => {
      const { rerender } = render(<List />);
      await userEvent.click(button('Two'));
      screen.getByRole('textbox').focus();
      rerender(<List items={[{ name: 'One' }, { name: 'Three' }]} />);
      await act(async () => {});
      await userEvent.tab({ shift: true });
      expect(button('Three')).toHaveFocus();
    });

    it('does not take focus when turned back on after focus left', async () => {
      const { rerender } = render(<List recoverFocus />);
      await userEvent.click(button('Two'));
      rerender(
        <List
          recoverFocus
          enabled={false}
        />,
      );
      const input = screen.getByRole('textbox');
      input.focus();
      rerender(<List recoverFocus />);
      await act(async () => {});
      expect(input).toHaveFocus();
    });

    it('keeps the active item when turned off and on', async () => {
      const { rerender } = render(<List />);
      await userEvent.click(button('Two'));
      rerender(<List enabled={false} />);
      rerender(<List />);
      expect(tabStops()).toEqual(['Two']);
    });

    it('does not take focus when mounted again after a move', async () => {
      const view = (open: boolean) => (
        <>
          {open && <List recoverFocus />}
          <button>Outside</button>
        </>
      );
      const { rerender } = render(view(true));
      await userEvent.click(button('One'));
      await userEvent.keyboard('{ArrowRight}');
      rerender(view(false));
      button('Outside').focus();
      rerender(view(true));
      await act(async () => {});
      expect(button('Outside')).toHaveFocus();
    });

    it('keeps the active item when items are reordered', async () => {
      const { rerender } = render(<List />);
      await userEvent.click(button('Two'));
      rerender(<List items={[{ name: 'Two' }, { name: 'One' }, { name: 'Three' }]} />);
      expect(tabStops()).toEqual(['Two']);
    });
  });

  describe('registered items', () => {
    function Item({ name }: { name: string }) {
      const ref = useCompositeItem();
      return <button ref={ref}>{name}</button>;
    }

    it('finds an item by its current value', () => {
      function Valued({ value, selected }: { value: string; selected: string }) {
        const [element, setElement] = useState<HTMLElement | null>(null);
        const items = useCompositeItems();
        useComposite(element, {
          getItems: items.getItems,
          preferred: { key: selected, getItem: () => items.getItem(selected) },
        });
        return (
          <CompositeItemsProvider value={items}>
            <div ref={setElement}>
              <ValuedItem
                name='One'
                value='one'
              />
              <ValuedItem
                name='Two'
                value={value}
              />
            </div>
          </CompositeItemsProvider>
        );
      }
      function ValuedItem({ name, value }: { name: string; value: string }) {
        const ref = useCompositeItem(value);
        return <button ref={ref}>{name}</button>;
      }
      const { rerender } = render(
        <Valued
          value='two'
          selected='two'
        />,
      );
      expect(tabStops()).toEqual(['Two']);
      rerender(
        <Valued
          value='renamed'
          selected='one'
        />,
      );
      expect(tabStops()).toEqual(['One']);
      rerender(
        <Valued
          value='renamed'
          selected='renamed'
        />,
      );
      expect(tabStops()).toEqual(['Two']);
    });

    function Group({ names }: { names: string[] }) {
      const [element, setElement] = useState<HTMLElement | null>(null);
      const items = useCompositeItems();
      const composite = useComposite(element, { getItems: items.getItems, orientation: 'horizontal' });
      return (
        <CompositeItemsProvider value={items}>
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- Test host; the keys come from the focusable items inside it. */}
          <div
            ref={setElement}
            onKeyDown={composite.handleKeyDown}
          >
            {names.map(name => (
              <Item
                key={name}
                name={name}
              />
            ))}
          </div>
        </CompositeItemsProvider>
      );
    }

    it('has a tab stop on the first commit', () => {
      render(<Group names={['One', 'Two']} />);
      expect(tabStops()).toEqual(['One']);
    });

    it('follows document order when an item mounts in the middle', async () => {
      const { rerender } = render(<Group names={['One', 'Three']} />);
      rerender(<Group names={['One', 'Two', 'Three']} />);
      button('One').focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(button('Two')).toHaveFocus();
    });

    it('follows document order when items are reordered', async () => {
      const { rerender } = render(<Group names={['One', 'Two', 'Three']} />);
      rerender(<Group names={['Three', 'Two', 'One']} />);
      button('Three').focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(button('Two')).toHaveFocus();
    });

    it('forgets an item that unmounts', async () => {
      const { rerender } = render(<Group names={['One', 'Two', 'Three']} />);
      rerender(<Group names={['One', 'Three']} />);
      button('One').focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(button('Three')).toHaveFocus();
    });

    it('keeps an unregistered control out of navigation', async () => {
      function Mixed() {
        const [element, setElement] = useState<HTMLElement | null>(null);
        const items = useCompositeItems();
        const composite = useComposite(element, { getItems: items.getItems, orientation: 'horizontal' });
        return (
          <CompositeItemsProvider value={items}>
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- Test host; the keys come from the focusable items inside it. */}
            <div
              ref={setElement}
              onKeyDown={composite.handleKeyDown}
            >
              <Item name='One' />
              <button>Other</button>
              <Item name='Two' />
            </div>
          </CompositeItemsProvider>
        );
      }
      render(<Mixed />);
      expect(button('Other')).not.toHaveAttribute('tabindex');
      button('One').focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(button('Two')).toHaveFocus();
    });
  });

  describe('tabindex ownership', () => {
    it('restores original tabindexes when disabled', () => {
      function Host({ enabled }: { enabled: boolean }) {
        const [element, setElement] = useState<HTMLElement | null>(null);
        useComposite(element, {
          enabled,
          getItems: () => Array.from(element?.querySelectorAll<HTMLElement>('button') ?? []),
        });
        return (
          <div ref={setElement}>
            <button tabIndex={-1}>One</button>
            <button>Two</button>
          </div>
        );
      }
      const { rerender } = render(<Host enabled />);
      expect(button('One')).toHaveAttribute('tabindex', '0');
      expect(button('Two')).toHaveAttribute('tabindex', '-1');
      rerender(<Host enabled={false} />);
      expect(button('One')).toHaveAttribute('tabindex', '-1');
      expect(button('Two')).not.toHaveAttribute('tabindex');
    });
  });
});
