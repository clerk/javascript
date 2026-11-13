import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Item } from '.';

const overrides = stylex.create({
  root: { marginTop: '8px' },
});

const atoms = (style: stylex.StyleXStyles) =>
  (stylex.props(style).className ?? '').split(' ').filter(name => /^x[a-z0-9]+$/.test(name));

describe('Mosaic Item', () => {
  it('renders a div with its children', () => {
    render(<Item.Root>Hi</Item.Root>);
    expect(screen.getByText('Hi')).toBeInTheDocument();
  });

  it('applies its base class and is not interactive by default', () => {
    render(<Item.Root>Hi</Item.Root>);
    const item = screen.getByText('Hi');
    expect(item).toHaveClass('cl-item');
    expect(item).not.toHaveAttribute('data-interactive');
  });

  it('reflects the label variant as a data attribute, defaulting to default', () => {
    const { rerender } = render(<Item.Label>Clerk</Item.Label>);
    expect(screen.getByText('Clerk')).toHaveAttribute('data-variant', 'default');
    rerender(<Item.Label variant='interactive'>Clerk</Item.Label>);
    expect(screen.getByText('Clerk')).toHaveAttribute('data-variant', 'interactive');
  });

  // StyleX keeps only the last atom that declares a property, so the reset's `color: inherit`
  // survives on the variant that declares no color of its own. That is what puts the interactive
  // label on the row's color and carries it through the row's hover promotion. `Item.Content`
  // declares no color either, so it stands in for the untouched reset.
  it('lets the row color the interactive label, and not the default one', () => {
    render(
      <Item.Content data-testid='reset-only'>
        <Item.Label>Default</Item.Label>
        <Item.Label variant='interactive'>Interactive</Item.Label>
      </Item.Content>,
    );

    const atoms = (element: HTMLElement) => element.className.split(' ');
    const resetAtoms = atoms(screen.getByTestId('reset-only'));
    const inherited = (text: string) => resetAtoms.filter(atom => atoms(screen.getByText(text)).includes(atom));

    expect(inherited('Interactive')).toHaveLength(inherited('Default').length + 1);
  });

  it('applies xstyle to the root element', () => {
    render(<Item.Root xstyle={overrides.root}>Hi</Item.Root>);
    expect(screen.getByText('Hi')).toHaveClass('cl-item', ...atoms(overrides.root));
  });

  it('merges a render-sourced className instead of clobbering its own', () => {
    render(<Item.Content render={<Item.Actions />}>Hi</Item.Content>);
    expect(screen.getByText('Hi')).toHaveClass('cl-item-content', 'cl-item-actions');
  });

  it('renders a custom element via render and marks it interactive', () => {
    render(
      <Item.Root
        render={({ children, ...props }) => (
          <a
            {...props}
            href='/settings'
          >
            {children}
          </a>
        )}
      >
        <Item.Content>
          <Item.Label>Settings</Item.Label>
        </Item.Content>
      </Item.Root>,
    );
    const link = screen.getByRole('link', { name: 'Settings' });
    expect(link).toHaveClass('cl-item');
    expect(link).toHaveAttribute('data-interactive', '');
    expect(link).toHaveAttribute('href', '/settings');
  });

  it('renders media with its stable class', () => {
    render(
      <Item.Media>
        <span>icon</span>
      </Item.Media>,
    );
    const media = screen.getByText('icon').parentElement;
    expect(media).toHaveClass('cl-item-media');
  });

  it('renders the composed slots with their stable classes', () => {
    render(
      <Item.Root>
        <Item.Content>
          <Item.Label>Test Organization</Item.Label>
          <Item.Description>Member</Item.Description>
        </Item.Content>
        <Item.Actions>
          <button type='button'>Manage</button>
        </Item.Actions>
      </Item.Root>,
    );
    expect(screen.getByText('Test Organization')).toHaveClass('cl-item-label');
    expect(screen.getByText('Member')).toHaveClass('cl-item-description');
    expect(screen.getByRole('button', { name: 'Manage' }).parentElement).toHaveClass('cl-item-actions');
  });

  it('renders a group without imposing a role', () => {
    render(
      <Item.Group data-testid='group'>
        <Item.Root>One</Item.Root>
        <Item.Root>Two</Item.Root>
      </Item.Group>,
    );
    const group = screen.getByTestId('group');
    expect(group).toHaveClass('cl-item-group');
    expect(group).not.toHaveAttribute('role');
  });

  it('forwards the ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Item.Root ref={ref}>Hi</Item.Root>);
    expect(ref.current).toBe(screen.getByText('Hi'));
  });
});
