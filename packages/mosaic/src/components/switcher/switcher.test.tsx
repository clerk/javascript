import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { MosaicProvider } from '../../mosaic-provider';
import { axe } from '../../primitives/test-utils/axe';
import { Switcher } from '.';
import { SwitcherSurfaceProvider } from './switcher.context';

function Popover() {
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
        <Popover />
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
          <Popover />
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
});
