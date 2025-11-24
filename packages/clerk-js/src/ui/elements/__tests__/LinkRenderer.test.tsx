import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';

import { LinkRenderer } from '../LinkRenderer';

const { createFixtures } = bindCreateFixtures('SignUp');

describe('LinkRenderer', () => {
  it('renders a simple link', async () => {
    const { wrapper } = await createFixtures();

    const screen = render(<LinkRenderer text='I agree to the [Terms of Service](https://example.com/terms)' />, {
      wrapper,
    });

    expect(screen.queryByRole('link', { name: 'Terms of Service' })).toBeInTheDocument();
  });

  it('renders multiple links', async () => {
    const { wrapper } = await createFixtures();

    const screen = render(
      <LinkRenderer text='I agree to the [Terms of Service](https://example.com/terms) and [Privacy Policy](https://example.com/privacy)' />,
      { wrapper },
    );

    expect(screen.queryByRole('link', { name: 'Terms of Service' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument();
  });

  it('does not render links with broken format', async () => {
    const { wrapper } = await createFixtures();

    const screen = render(
      <LinkRenderer text='I agree to the [Terms of Service]https://example.com/terms) and [Privacy Policy](https://example.com/privacy)' />,
      { wrapper },
    );

    screen.findByText('[Terms of Service]https://example.com/terms)');
    expect(screen.queryByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument();
  });
});
