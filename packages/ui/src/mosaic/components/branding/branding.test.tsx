import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Branding } from './branding';

describe('Branding', () => {
  // The logo names the link, so the mark is what a screen reader reaches rather than an unnamed link.
  it('signs with Clerk, in a tab of its own', () => {
    render(<Branding data-testid='branding' />);

    expect(screen.getByTestId('branding')).toHaveTextContent('Secured by');
    expect(screen.getByTestId('branding')).toHaveClass('cl-branding');
    const logo = screen.getByRole('link', { name: 'Clerk' });
    expect(logo).toHaveClass('cl-branding-link');
    expect(logo).toHaveAttribute('href', 'https://go.clerk.com/components');
    expect(logo).toHaveAttribute('target', '_blank');
    expect(logo).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
