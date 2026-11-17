import * as stylex from '@stylexjs/stylex';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../mosaic-provider';
import { axe } from '../../primitives/test-utils/axe';
import { Card } from '../card';
import type { SwitcherRootProps } from '.';
import { Switcher } from '.';
import { SwitcherSurfaceProvider } from './switcher.context';

function PopupContent() {
  return (
    <>
      <Switcher.Header
        avatar={
          <Switcher.BadgedAvatar
            name='Acme'
            badge={{ name: 'Alice Smith' }}
            size='md'
          />
        }
        title='Acme'
        description='alice@example.com'
      />
      <Switcher.Separator />
      <Switcher.Group>
        <Switcher.Item render={<button type='button' />}>
          <Switcher.ItemMedia>
            <Switcher.Avatar
              name='Globex Corp'
              shape='square'
              size='sm'
            />
          </Switcher.ItemMedia>
          <Switcher.ItemContent>
            <Switcher.ItemLabel>Globex</Switcher.ItemLabel>
            <Switcher.ItemDescription>Member</Switcher.ItemDescription>
          </Switcher.ItemContent>
          <Switcher.ItemTrailing>Pro</Switcher.ItemTrailing>
        </Switcher.Item>
      </Switcher.Group>
    </>
  );
}

function atomsOf(style: stylex.StyleXStyles): string[] {
  return stylex
    .props(style)
    .className!.split(' ')
    .filter(name => !name.includes('__'));
}

describe('Switcher', () => {
  it('renders the popover parts with their switcher slots', async () => {
    const { container } = render(
      <MosaicProvider>
        <PopupContent />
      </MosaicProvider>,
    );

    expect(container.querySelector('.cl-switcher-header')).toHaveTextContent('Acmealice@example.com');
    expect(container.querySelector('.cl-switcher-avatar')).toHaveAttribute('aria-hidden');
    expect(container.querySelector('.cl-switcher-separator')?.tagName).toBe('HR');
    const row = screen.getByRole('button', { name: 'Globex Member Pro' });
    expect(row).toHaveClass('cl-switcher-item');
    expect(row).toHaveAttribute('data-interactive');
    expect(container.querySelector('.cl-switcher-item-label')).toHaveAttribute('data-variant', 'default');
    expect((await axe(container)).violations).toEqual([]);
  });

  it.each(['user-button', 'organization-switcher'] as const)('takes the %s slot prefix from the surface', surface => {
    const { container } = render(
      <MosaicProvider>
        <SwitcherSurfaceProvider value={surface}>
          <PopupContent />
        </SwitcherSurfaceProvider>
      </MosaicProvider>,
    );

    for (const part of ['header', 'avatar', 'group', 'separator', 'item', 'item-label']) {
      expect(container.querySelector(`.cl-${surface}-${part}`)).not.toBeNull();
    }
    expect(container.querySelector('[class*="cl-switcher-"]')).toBeNull();
  });

  it('shapes the avatar by its shape prop', () => {
    const { container } = render(
      <MosaicProvider>
        <Switcher.Avatar
          name='Alice Smith'
          shape='circle'
          size='sm'
        />
        <Switcher.Avatar
          name='Acme'
          shape='square'
          size='sm'
        />
      </MosaicProvider>,
    );

    const [circle, square] = container.querySelectorAll('.cl-avatar');
    expect(circle).toHaveAttribute('data-shape', 'circle');
    expect(square).toHaveAttribute('data-shape', 'square');
  });

  it('forwards refs and xstyle to the root elements', () => {
    const probe = stylex.create({ root: { maxWidth: '900px' } });
    const itemRef = React.createRef<HTMLDivElement>();
    const triggerRef = React.createRef<HTMLButtonElement>();
    render(
      <MosaicProvider>
        <Switcher.Group
          data-testid='group'
          xstyle={probe.root}
        >
          <Switcher.Item
            ref={itemRef}
            xstyle={probe.root}
          >
            <Switcher.ItemLabel xstyle={probe.root}>Globex</Switcher.ItemLabel>
          </Switcher.Item>
        </Switcher.Group>
        <Switcher.Avatar
          name='Acme'
          shape='square'
          size='sm'
          xstyle={probe.root}
        />
        <Switcher.Trigger
          ref={triggerRef}
          aria-label='Open account menu'
          avatar={null}
          xstyle={probe.root}
        />
      </MosaicProvider>,
    );

    const atoms = atomsOf(probe.root);
    expect(itemRef.current).toHaveClass('cl-switcher-item', ...atoms);
    expect(triggerRef.current).toBe(screen.getByRole('button', { name: 'Open account menu' }));
    expect(triggerRef.current).toHaveClass('cl-switcher-trigger', ...atoms);
    expect(screen.getByTestId('group')).toHaveClass('cl-switcher-group', ...atoms);
    expect(screen.getByText('Globex')).toHaveClass('cl-switcher-item-label', ...atoms);
    expect(document.querySelector('.cl-avatar')).toHaveClass(...atoms);
  });

  it('renders the trigger as a plain button, with or without its label', () => {
    const { rerender } = render(
      <MosaicProvider>
        <Switcher.Trigger
          aria-label='Open account menu'
          avatar={
            <Switcher.Avatar
              name='Acme'
              shape='square'
              size='sm'
            />
          }
          name='Acme'
          badge='Pro'
          variant='full'
        />
      </MosaicProvider>,
    );

    const trigger = screen.getByRole('button', { name: 'Open account menu' });
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveClass('cl-switcher-trigger');
    expect(trigger).toHaveAttribute('data-variant', 'full');
    expect(trigger.querySelector('.cl-switcher-trigger-label')).toHaveTextContent('Acme');
    expect(trigger).toHaveTextContent('Pro');
    expect(trigger.querySelector('.cl-badge')).toHaveTextContent('Pro');

    rerender(
      <MosaicProvider>
        <Switcher.Trigger
          aria-label='Open account menu'
          avatar={
            <Switcher.Avatar
              name='Acme'
              shape='circle'
              size='sm'
            />
          }
          shape='circle'
        />
      </MosaicProvider>,
    );

    const avatarOnly = screen.getByRole('button', { name: 'Open account menu' });
    expect(avatarOnly).toHaveAttribute('data-variant', 'condensed');
    expect(avatarOnly.querySelector('.cl-switcher-trigger-label')).toBeNull();
    expect(avatarOnly.querySelector('.cl-avatar')).toHaveAttribute('data-shape', 'circle');
  });

  it('keeps the label and an empty badge when given empty strings', () => {
    render(
      <MosaicProvider>
        <Switcher.Trigger
          aria-label='Open account menu'
          avatar={null}
          name=''
          badge=''
        />
      </MosaicProvider>,
    );

    const trigger = screen.getByRole('button', { name: 'Open account menu' });
    expect(trigger.querySelector('.cl-switcher-trigger-label')).not.toBeNull();
    expect(trigger.querySelector('.cl-badge')).not.toBeNull();
  });

  describe('Root, Trigger and Popup', () => {
    function Composed(props: Partial<SwitcherRootProps>) {
      return (
        <MosaicProvider>
          <Switcher.Root {...props}>
            <Switcher.Trigger
              aria-label='Open account menu'
              avatar={
                <Switcher.BadgedAvatar
                  name='Acme'
                  badge={{ name: 'Alice Smith' }}
                  size='sm'
                />
              }
              name='Acme'
              badge='Pro'
              variant='full'
            />
            <Switcher.Popup aria-label='Account menu'>
              <PopupContent />
            </Switcher.Popup>
          </Switcher.Root>
        </MosaicProvider>
      );
    }

    it('opens the popup from the trigger, and closes it with Escape', async () => {
      const user = userEvent.setup();
      render(<Composed />);

      const trigger = screen.getByRole('button', { name: 'Open account menu' });
      expect(trigger).toHaveClass('cl-popover-trigger', 'cl-switcher-trigger');
      expect(trigger).toHaveAttribute('data-variant', 'full');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('dialog')).toBeNull();

      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(trigger).toHaveAttribute('data-open');
      const dialog = await screen.findByRole('dialog', { name: 'Account menu' });
      expect(trigger).toHaveAttribute('aria-controls', dialog.id);
      const popup = dialog.querySelector('.cl-switcher-popover');
      expect(popup).toHaveClass('cl-popover-popup');
      expect(popup?.querySelector('.cl-card-root')).toContainElement(
        screen.getByRole('button', { name: 'Globex Member Pro' }),
      );
      expect(popup?.querySelector('.cl-switcher-header')).not.toBeNull();

      await user.keyboard('{Escape}');

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();
    });

    it('opens from the keyboard and moves focus into the popup', async () => {
      const user = userEvent.setup();
      render(<Composed />);

      await user.tab();
      expect(screen.getByRole('button', { name: 'Open account menu' })).toHaveFocus();
      await user.keyboard('{Enter}');

      await screen.findByRole('dialog', { name: 'Account menu' });
      await waitFor(() => expect(screen.getByRole('button', { name: 'Globex Member Pro' })).toHaveFocus());
    });

    it('follows a controlled open state', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const { rerender } = render(
        <Composed
          open
          onOpenChange={onOpenChange}
        />,
      );

      expect(await screen.findByRole('dialog', { name: 'Account menu' })).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Open account menu' }));
      expect(onOpenChange).toHaveBeenCalledWith(false);

      rerender(
        <Composed
          open={false}
          onOpenChange={onOpenChange}
        />,
      );
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });
  });

  it('renders open in normal flow from the content parts inside a Card, with the trigger beside it on its own', () => {
    const { container } = render(
      <MosaicProvider>
        <Card.Root>
          <PopupContent />
        </Card.Root>
        <Switcher.Trigger
          aria-label='Open account menu'
          avatar={
            <Switcher.BadgedAvatar
              name='Acme'
              badge={{ name: 'Alice Smith' }}
              size='sm'
            />
          }
          name='Acme'
          variant='full'
        />
      </MosaicProvider>,
    );

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(container.querySelector('.cl-card-root .cl-switcher-header')).not.toBeNull();
    expect(container.querySelector('.cl-card-root .cl-switcher-item')).not.toBeNull();
    const trigger = screen.getByRole('button', { name: 'Open account menu' });
    expect(trigger).toHaveClass('cl-switcher-trigger');
    expect(trigger).not.toHaveClass('cl-popover-trigger');
    expect(trigger).toHaveAttribute('data-variant', 'full');
    expect(trigger).not.toHaveAttribute('aria-expanded');
  });
});
