import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Heading, HeadingContext } from './heading';

describe('Mosaic Heading', () => {
  it('renders an h2 with its children', () => {
    render(<Heading>Title</Heading>);
    expect(screen.getByRole('heading', { level: 2, name: 'Title' })).toBeInTheDocument();
  });

  it('applies default variants when none are passed', () => {
    render(<Heading>Title</Heading>);
    const heading = screen.getByRole('heading');
    expect(heading).toHaveClass('cl-heading');
    expect(heading).toHaveAttribute('data-size', 'base');
    expect(heading).toHaveAttribute('data-intent', 'primary');
  });

  it('wires variant props and consumer className/style through to the element', () => {
    render(
      <Heading
        size='2xl'
        intent='destructive'
        className='my-heading'
        style={{ marginTop: '8px' }}
      >
        Title
      </Heading>,
    );
    const heading = screen.getByRole('heading');
    expect(heading).toHaveAttribute('data-size', '2xl');
    expect(heading).toHaveAttribute('data-intent', 'destructive');
    expect(heading).toHaveClass('cl-heading', 'my-heading');
    expect(heading).toHaveStyle({ marginTop: '8px' });
  });

  it('renders a different element through the render prop, keeping the slot props', () => {
    render(<Heading render={p => <h3 {...p} />}>Title</Heading>);
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveClass('cl-heading');
    expect(heading).toHaveAttribute('data-size', 'base');
  });

  it('reads defaults from HeadingContext, with own props winning', () => {
    render(
      <HeadingContext.Provider value={{ size: 'xl', intent: 'mutedForeground' }}>
        <Heading intent='destructive'>Title</Heading>
      </HeadingContext.Provider>,
    );
    const heading = screen.getByRole('heading');
    expect(heading).toHaveAttribute('data-size', 'xl');
    expect(heading).toHaveAttribute('data-intent', 'destructive');
  });

  it('forwards arbitrary props and the ref', () => {
    const ref = React.createRef<HTMLHeadingElement>();
    render(
      <Heading
        ref={ref}
        id='section-title'
      >
        Title
      </Heading>,
    );
    const heading = screen.getByRole('heading');
    expect(ref.current).toBe(heading);
    expect(heading).toHaveAttribute('id', 'section-title');
  });
});
