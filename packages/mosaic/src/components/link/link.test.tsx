import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Link } from './link';

describe('Link', () => {
  it('renders a real link with its own slot and variants', () => {
    render(
      <Link
        href='https://example.com'
        color='neutral'
        size='sm'
      >
        Open
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Open' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveClass('cl-link');
    expect(link).toHaveAttribute('data-color', 'neutral');
    expect(link).toHaveAttribute('data-size', 'sm');
    expect(link).not.toHaveAttribute('type');
  });

  it('marks a link that opens a new tab with a trailing icon hidden from assistive tech', () => {
    render(
      <>
        <Link
          href='https://example.com'
          target='_blank'
        >
          External
        </Link>
        <Link href='https://example.com'>Internal</Link>
      </>,
    );
    const external = screen.getByRole('link', { name: 'External' });
    const arrow = external.querySelector('[data-icon="inline-end"]');
    expect(arrow).toHaveAttribute('aria-hidden', 'true');
    expect(external.lastElementChild?.contains(arrow)).toBe(true);
    expect(screen.getByRole('link', { name: 'Internal' }).querySelector('svg')).toBeNull();
  });
});
