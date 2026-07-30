import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Text } from '../text';
import { Card } from './card';

describe('Mosaic Card', () => {
  it('renders each compound slot with the default alignment', () => {
    render(
      <Card data-testid='root'>
        <Card.Header data-testid='header'>Header</Card.Header>
        <Card.Content data-testid='content'>Content</Card.Content>
        <Card.Footer data-testid='footer'>Footer</Card.Footer>
      </Card>,
    );

    expect(screen.getByTestId('root')).toHaveClass('cl-card-root');
    expect(screen.getByTestId('root')).toHaveAttribute('data-alignment', 'start');
    expect(screen.getByTestId('header')).toHaveClass('cl-card-header');
    expect(screen.getByTestId('header')).toHaveAttribute('data-alignment', 'start');
    expect(screen.getByTestId('content')).toHaveClass('cl-card-content');
    expect(screen.getByTestId('footer')).toHaveClass('cl-card-footer');
  });

  it('reflects centered alignment on the root and header', () => {
    render(
      <Card
        alignment='center'
        data-testid='root'
      >
        <Card.Header data-testid='header'>Header</Card.Header>
      </Card>,
    );

    expect(screen.getByTestId('root')).toHaveAttribute('data-alignment', 'center');
    expect(screen.getByTestId('header')).toHaveAttribute('data-alignment', 'center');
  });

  it('provides the neutral text color to header copy', () => {
    render(
      <Card>
        <Card.Header>
          <Text>Supporting copy</Text>
        </Card.Header>
      </Card>,
    );

    expect(screen.getByText('Supporting copy')).toHaveAttribute('data-color', 'neutral');
  });

  it('lets consumer className and style win on every slot', () => {
    render(
      <Card
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
      </Card>,
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
});
