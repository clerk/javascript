import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Item } from './item';

describe('Mosaic Item', () => {
  it('renders a div with its children', () => {
    render(<Item>Hi</Item>);
    expect(screen.getByText('Hi')).toBeInTheDocument();
  });

  it('applies default variants when none are passed', () => {
    render(<Item>Hi</Item>);
    const item = screen.getByText('Hi');
    expect(item).toHaveClass('cl-item');
    expect(item).toHaveAttribute('data-variant', 'default');
    expect(item).toHaveAttribute('data-size', 'default');
    expect(item).not.toHaveAttribute('data-interactive');
  });

  it('wires variant props and consumer className/style through to the element', () => {
    render(
      <Item
        variant='outline'
        size='sm'
        className='my-item'
        style={{ marginTop: '8px' }}
      >
        Hi
      </Item>,
    );
    const item = screen.getByText('Hi');
    expect(item).toHaveAttribute('data-variant', 'outline');
    expect(item).toHaveAttribute('data-size', 'sm');
    expect(item).toHaveClass('cl-item', 'my-item');
    expect(item).toHaveStyle({ marginTop: '8px' });
  });

  it('renders a custom element via render and marks it interactive', () => {
    render(
      <Item
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
          <Item.Title>Settings</Item.Title>
        </Item.Content>
      </Item>,
    );
    const link = screen.getByRole('link', { name: 'Settings' });
    expect(link).toHaveClass('cl-item');
    expect(link).toHaveAttribute('data-interactive', '');
    expect(link).toHaveAttribute('href', '/settings');
  });

  it('renders the media variants', () => {
    render(
      <Item.Media variant='icon'>
        <span>icon</span>
      </Item.Media>,
    );
    const media = screen.getByText('icon').parentElement;
    expect(media).toHaveClass('cl-item-media');
    expect(media).toHaveAttribute('data-variant', 'icon');
  });

  it('renders the composed slots with their stable classes', () => {
    render(
      <Item>
        <Item.Content>
          <Item.Title>Test Organization</Item.Title>
          <Item.Description>Member</Item.Description>
        </Item.Content>
        <Item.Actions>
          <button type='button'>Manage</button>
        </Item.Actions>
      </Item>,
    );
    expect(screen.getByText('Test Organization')).toHaveClass('cl-item-title');
    expect(screen.getByText('Member')).toHaveClass('cl-item-description');
    expect(screen.getByRole('button', { name: 'Manage' }).parentElement).toHaveClass('cl-item-actions');
  });

  it('renders a group as a list and a separator', () => {
    render(
      <Item.Group>
        <Item>One</Item>
        <Item.Separator data-testid='sep' />
        <Item>Two</Item>
      </Item.Group>,
    );
    expect(screen.getByRole('list')).toHaveClass('cl-item-group');
    expect(screen.getByTestId('sep')).toHaveClass('cl-item-separator');
  });

  it('forwards the ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Item ref={ref}>Hi</Item>);
    expect(ref.current).toBe(screen.getByText('Hi'));
  });
});
