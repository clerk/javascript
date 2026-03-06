import React from 'react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { ImpersonationFab } from '../';

const { createFixtures } = bindCreateFixtures('UserButton');

describe('ImpersonationFab', () => {
  it('does not render when user has no actor', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    render(<ImpersonationFab />, { wrapper });
    expect(document.getElementById('cl-impersonationEye')).toBeNull();
  });

  it('renders when user has actor without type (impersonation)', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({
        email_addresses: ['test@clerk.com'],
        actor: { sub: 'user_impersonated' },
      });
    });
    render(<ImpersonationFab />, { wrapper });
    expect(document.getElementById('cl-impersonationEye')).toBeInTheDocument();
  });

  it('does not render when user has actor with type "agent"', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({
        email_addresses: ['test@clerk.com'],
        actor: { sub: 'user_agent', type: 'agent' },
      });
    });
    render(<ImpersonationFab />, { wrapper });
    expect(document.getElementById('cl-impersonationEye')).toBeNull();
  });
});
