import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Spinner } from './spinner';

/** The spinner is decorative, so it has no role or name to query — only its slot class. */
const spinner = (container: HTMLElement) => container.querySelector('.cl-spinner');

describe('Mosaic Spinner', () => {
  it('renders a decorative element carrying the slot class', () => {
    const { container } = render(<Spinner />);
    const el = spinner(container);
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies the default size when none is passed', () => {
    const { container } = render(<Spinner />);
    expect(spinner(container)).toHaveAttribute('data-size', 'md');
  });

  it.each(['sm', 'md'] as const)('reflects the %s size', size => {
    const { container } = render(<Spinner size={size} />);
    expect(spinner(container)).toHaveAttribute('data-size', size);
  });

  it('lets the consumer className and style win', () => {
    const { container } = render(
      <Spinner
        className='my-spinner'
        style={{ marginTop: '8px' }}
      />,
    );
    const el = spinner(container);
    expect(el).toHaveClass('cl-spinner', 'my-spinner');
    expect(el).toHaveStyle({ marginTop: '8px' });
  });

  it('forwards arbitrary span props and the ref', () => {
    const ref = React.createRef<HTMLSpanElement>();
    const { container } = render(
      <Spinner
        ref={ref}
        id='pending'
      />,
    );
    const el = spinner(container);
    expect(ref.current).toBe(el);
    expect(el).toHaveAttribute('id', 'pending');
  });
});
