import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Item } from './item';

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

  it('reflects the size prop as a data attribute, defaulting to md', () => {
    const { rerender } = render(<Item.Root>Hi</Item.Root>);
    expect(screen.getByText('Hi')).toHaveAttribute('data-size', 'md');
    rerender(<Item.Root size='xs'>Hi</Item.Root>);
    expect(screen.getByText('Hi')).toHaveAttribute('data-size', 'xs');
  });

  it('reads the size from the root in media', () => {
    const { rerender } = render(
      <Item.Root size='xs'>
        <Item.Media data-testid='media' />
      </Item.Root>,
    );
    expect(screen.getByTestId('media')).toHaveAttribute('data-size', 'xs');
    rerender(
      <Item.Root size='md'>
        <Item.Media data-testid='media' />
      </Item.Root>,
    );
    expect(screen.getByTestId('media')).toHaveAttribute('data-size', 'md');
  });

  it('falls back to the default size when media renders outside a root', () => {
    render(<Item.Media data-testid='media' />);
    expect(screen.getByTestId('media')).toHaveAttribute('data-size', 'md');
  });

  it('reflects the label variant as a data attribute, defaulting to primary', () => {
    const { rerender } = render(<Item.Label>Clerk</Item.Label>);
    expect(screen.getByText('Clerk')).toHaveAttribute('data-variant', 'primary');
    rerender(<Item.Label variant='secondary'>Clerk</Item.Label>);
    expect(screen.getByText('Clerk')).toHaveAttribute('data-variant', 'secondary');
  });

  // StyleX keeps only the last atom that declares a property, so the reset's `color: inherit`
  // survives on the variant that declares no color of its own. That is what puts the secondary
  // label on the row's color and carries it through the row's hover promotion. `Item.Content`
  // declares no color either, so it stands in for the untouched reset.
  it('lets the row color the secondary label, and not the primary one', () => {
    render(
      <Item.Content data-testid='reset-only'>
        <Item.Label>Primary</Item.Label>
        <Item.Label variant='secondary'>Secondary</Item.Label>
      </Item.Content>,
    );

    const atoms = (element: HTMLElement) => element.className.split(' ');
    const resetAtoms = atoms(screen.getByTestId('reset-only'));
    const inherited = (text: string) => resetAtoms.filter(atom => atoms(screen.getByText(text)).includes(atom));

    expect(inherited('Secondary')).toHaveLength(inherited('Primary').length + 1);
  });

  it('wires consumer className/style through to the element', () => {
    render(
      <Item.Root
        className='my-item'
        style={{ marginTop: '8px' }}
      >
        Hi
      </Item.Root>,
    );
    const item = screen.getByText('Hi');
    expect(item).toHaveClass('cl-item', 'my-item');
    expect(item).toHaveStyle({ marginTop: '8px' });
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

  it('renders a group and a separator without imposing a role', () => {
    render(
      <Item.Group data-testid='group'>
        <Item.Root>One</Item.Root>
        <Item.Separator data-testid='sep' />
        <Item.Root>Two</Item.Root>
      </Item.Group>,
    );
    const group = screen.getByTestId('group');
    expect(group).toHaveClass('cl-item-group');
    expect(group).not.toHaveAttribute('role');
    expect(screen.getByTestId('sep')).toHaveClass('cl-item-separator');
  });

  it('reflects the group variant as a data attribute, defaulting to default', () => {
    const { rerender } = render(<Item.Group data-testid='group'>One</Item.Group>);
    expect(screen.getByTestId('group')).toHaveAttribute('data-variant', 'default');
    rerender(
      <Item.Group
        data-testid='group'
        variant='outline'
      >
        One
      </Item.Group>,
    );
    expect(screen.getByTestId('group')).toHaveAttribute('data-variant', 'outline');
  });

  it('reads the variant from the group in its rows', () => {
    render(
      <Item.Group variant='outline'>
        <Item.Root>Outlined</Item.Root>
      </Item.Group>,
    );
    expect(screen.getByText('Outlined')).toHaveAttribute('data-variant', 'outline');
  });

  it('falls back to the default variant when a row renders outside a group', () => {
    render(<Item.Root>Hi</Item.Root>);
    expect(screen.getByText('Hi')).toHaveAttribute('data-variant', 'default');
  });

  it('gives an outlined row a border atom a default row does not carry', () => {
    render(
      <>
        <Item.Root>Plain</Item.Root>
        <Item.Group variant='outline'>
          <Item.Root>Outlined</Item.Root>
        </Item.Group>
      </>,
    );

    const atoms = (text: string) => screen.getByText(text).className.split(' ');
    expect(atoms('Outlined').filter(atom => !atoms('Plain').includes(atom))).not.toHaveLength(0);
  });

  it('forwards the ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Item.Root ref={ref}>Hi</Item.Root>);
    expect(ref.current).toBe(screen.getByText('Hi'));
  });
});
