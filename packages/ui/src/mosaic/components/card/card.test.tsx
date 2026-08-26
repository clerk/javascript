import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Text } from '../text';
import { Card } from './card';

describe('Mosaic Card', () => {
  it('renders each compound slot with the default alignment', () => {
    render(
      <Card.Root data-testid='root'>
        <Card.Header data-testid='header'>Header</Card.Header>
        <Card.Content data-testid='content'>Content</Card.Content>
        <Card.Footer data-testid='footer'>Footer</Card.Footer>
      </Card.Root>,
    );

    expect(screen.getByTestId('root')).toHaveClass('cl-card-root');
    expect(screen.getByTestId('root')).toHaveAttribute('data-alignment', 'start');
    expect(screen.getByTestId('root')).toHaveAttribute('data-elevation', 'card');
    expect(screen.getByTestId('header')).toHaveClass('cl-card-header');
    expect(screen.getByTestId('header')).toHaveAttribute('data-alignment', 'start');
    expect(screen.getByTestId('content')).toHaveClass('cl-card-content');
    expect(screen.getByTestId('footer')).toHaveClass('cl-card-footer');
    expect(screen.getByTestId('footer')).toHaveAttribute('data-elevation', 'card');
  });

  it('reflects centered alignment on the root and header', () => {
    render(
      <Card.Root
        alignment='center'
        data-testid='root'
      >
        <Card.Header data-testid='header'>Header</Card.Header>
      </Card.Root>,
    );

    expect(screen.getByTestId('root')).toHaveAttribute('data-alignment', 'center');
    expect(screen.getByTestId('header')).toHaveAttribute('data-alignment', 'center');
  });

  it('reflects flush elevation on the root and footer', () => {
    render(
      <Card.Root
        elevation='flush'
        data-testid='root'
      >
        <Card.Footer data-testid='footer' />
      </Card.Root>,
    );

    expect(screen.getByTestId('root')).toHaveAttribute('data-elevation', 'flush');
    expect(screen.getByTestId('footer')).toHaveAttribute('data-elevation', 'flush');
  });

  it('reflects overlay elevation on the root and footer', () => {
    render(
      <Card.Root
        elevation='overlay'
        data-testid='root'
      >
        <Card.Footer data-testid='footer' />
      </Card.Root>,
    );

    expect(screen.getByTestId('root')).toHaveAttribute('data-elevation', 'overlay');
    expect(screen.getByTestId('footer')).toHaveAttribute('data-elevation', 'overlay');
  });

  it('provides the neutral text color to header copy', () => {
    render(
      <Card.Root>
        <Card.Header>
          <Text>Supporting copy</Text>
        </Card.Header>
      </Card.Root>,
    );

    expect(screen.getByText('Supporting copy')).toHaveAttribute('data-color', 'neutral');
  });

  it('lets consumer className and style win on every slot', () => {
    render(
      <Card.Root
        className='my-card'
        style={{ width: '20rem' }}
        data-testid='root'
      >
        <Card.Header
          className='my-header'
          style={{ textAlign: 'right' }}
          data-testid='header'
        />
        <Card.Content
          className='my-content'
          style={{ paddingInline: 0 }}
          data-testid='content'
        />
        <Card.Footer
          className='my-footer'
          style={{ paddingBlockEnd: 0 }}
          data-testid='footer'
        />
      </Card.Root>,
    );

    expect(screen.getByTestId('root')).toHaveClass('cl-card-root', 'my-card');
    expect(screen.getByTestId('root')).toHaveStyle({ width: '20rem' });
    expect(screen.getByTestId('header')).toHaveClass('cl-card-header', 'my-header');
    expect(screen.getByTestId('header')).toHaveStyle({ textAlign: 'right' });
    expect(screen.getByTestId('content')).toHaveClass('cl-card-content', 'my-content');
    expect(screen.getByTestId('content')).toHaveStyle({ paddingInline: 0 });
    expect(screen.getByTestId('footer')).toHaveClass('cl-card-footer', 'my-footer');
    expect(screen.getByTestId('footer')).toHaveStyle({ paddingBlockEnd: 0 });
  });

  it('forwards refs and arbitrary props from compound slots', () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const headerRef = React.createRef<HTMLDivElement>();
    const contentRef = React.createRef<HTMLDivElement>();
    const footerRef = React.createRef<HTMLDivElement>();

    render(
      <Card.Root
        ref={rootRef}
        aria-label='Card'
      >
        <Card.Header ref={headerRef} />
        <Card.Content ref={contentRef} />
        <Card.Footer ref={footerRef} />
      </Card.Root>,
    );

    expect(rootRef.current).toBe(screen.getByLabelText('Card'));
    expect(headerRef.current).toHaveClass('cl-card-header');
    expect(contentRef.current).toHaveClass('cl-card-content');
    expect(footerRef.current).toHaveClass('cl-card-footer');
  });

  // The logo names the link, so the mark is what a screen reader reaches rather than an unnamed link.
  it('signs the card with Clerk, in a tab of its own', () => {
    render(
      <Card.Root data-testid='root'>
        <Card.Content>Content</Card.Content>
      </Card.Root>,
    );

    // The mark closes the card out. Held by position rather than by a class: the branding
    // carries no slot for a consumer to reach, so a test has none to reach for either.
    const branding = screen.getByTestId('root').lastElementChild;
    expect(branding).toHaveTextContent('Secured by');

    const logo = screen.getByRole('link', { name: 'Clerk' });
    expect(branding).toContainElement(logo);
    expect(logo).toHaveAttribute('href', 'https://go.clerk.com/components');
    expect(logo).toHaveAttribute('target', '_blank');
    expect(logo).toHaveAttribute('rel', 'noopener noreferrer');
  });

  // An instance that has paid the branding off carries none of it, so the caller reading
  // `displayConfig.branded` turns the signature off rather than the card assuming it.
  it('withholds the branding where the caller turns it off', () => {
    render(
      <Card.Root renderBranding={false}>
        <Card.Content>Content</Card.Content>
      </Card.Root>,
    );

    expect(screen.queryByText('Secured by')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Clerk' })).toBeNull();
  });

  it('supports custom elements through render on every slot', () => {
    render(
      <Card.Root render={props => <section {...props} />}>
        <Card.Header render={props => <header {...props}>Header</header>} />
        <Card.Content render={props => <main {...props}>Content</main>} />
        <Card.Footer render={props => <footer {...props}>Footer</footer>} />
      </Card.Root>,
    );

    expect(screen.getByText('Header').tagName).toBe('HEADER');
    expect(screen.getByText('Content').tagName).toBe('MAIN');
    expect(screen.getByText('Footer').tagName).toBe('FOOTER');
    expect(screen.getByText('Header').closest('section')).toHaveClass('cl-card-root');
  });
});
