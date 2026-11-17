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

  it('takes its slot prefix from the surface', () => {
    const { container } = render(
      <MosaicProvider>
        <SwitcherSurfaceProvider value='organization-switcher'>
          <Popover />
        </SwitcherSurfaceProvider>
      </MosaicProvider>,
    );

    expect(container.querySelector('.cl-organization-switcher-item')).not.toBeNull();
    expect(container.querySelector('.cl-switcher-item')).toBeNull();
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
        />
      </MosaicProvider>,
    );

    const trigger = screen.getByRole('button', { name: 'Open account menu' });
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveClass('cl-switcher-trigger');
    expect(trigger).toHaveAttribute('data-variant', 'full');
    expect(trigger.querySelector('.cl-switcher-trigger-label')).toHaveTextContent('Acme');
    expect(trigger).toHaveTextContent('Pro');

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

    expect(screen.getByRole('button', { name: 'Open account menu' }).querySelector('.cl-switcher-trigger-label')).toBe(
      null,
    );
  });
});
