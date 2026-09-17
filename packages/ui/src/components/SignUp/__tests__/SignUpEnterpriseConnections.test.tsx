import type { SignUpEnterpriseConnectionResource } from '@clerk/shared/types';
import { beforeEach, describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';
import { clearFetchCache } from '@/ui/hooks/useFetch';

import { SignUpEnterpriseConnections } from '../SignUpEnterpriseConnections';

const { createFixtures } = bindCreateFixtures('SignUp');

describe('SignUpEnterpriseConnections', () => {
  beforeEach(clearFetchCache);
  it('shows organization labels for identical names and selects the matching ID', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withEmailAddress());
    fixtures.signUp.__experimental_getEnterpriseConnections.mockResolvedValue([
      { id: 'ec_1', name: 'Google', provider: 'oauth_google', organizationName: 'Acme Labs', domain: 'example.com' },
      { id: 'ec_2', name: 'Google', provider: 'oauth_google', organizationName: 'Acme Corp', domain: 'example.com' },
    ] as SignUpEnterpriseConnectionResource[]);
    fixtures.signUp.authenticateWithRedirect.mockResolvedValue(undefined);
    const { userEvent } = render(<SignUpEnterpriseConnections />, { wrapper });
    await userEvent.click(await screen.findByRole('button', { name: 'Google Acme Corp' }));
    expect(fixtures.signUp.authenticateWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ enterpriseConnectionId: 'ec_2', continueSignUp: true }),
    );
    screen.getByRole('button', { name: 'Google Acme Labs' });
  });

  it('falls back to the domain, provider and initial icon for incomplete labels', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withEmailAddress());
    fixtures.signUp.__experimental_getEnterpriseConnections.mockResolvedValue([
      { id: 'ec_1', name: ' ', provider: 'oauth_google', domain: 'example.com' },
      { id: 'ec_2', name: '', provider: 'unknown', logoPublicUrl: ' ' },
      { id: 'ec_3', name: 'Workspace', provider: 'saml_okta' },
    ] as SignUpEnterpriseConnectionResource[]);
    render(<SignUpEnterpriseConnections />, { wrapper });
    await screen.findByRole('button', { name: 'Google Sign in with example.com' });
    screen.getByRole('button', { name: 'Enterprise SSO Enterprise SSO' });
    screen.getByRole('button', { name: 'Workspace Okta' });
    expect(document.querySelectorAll('.cl-enterpriseConnectionButtonIcon')).toHaveLength(3);
  });
});
