import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { fapiUrl, serveFapi, worker } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser, fapiVerification } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfileEnterpriseAccountsSection } from '../user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section';
import { enterpriseAccountSeed, enterpriseMember, okta } from './enterprise-accounts.fixtures';

function serveUsers() {
  return serveFapi(
    enterpriseAccountSeed({
      client: fapiClient([
        fapiSession({ id: 'sess_1', user: enterpriseMember() }),
        fapiSession({ id: 'sess_2', user: fapiUser({ id: 'user_2' }) }),
      ]),
      enterpriseConnections: [okta],
    }),
  );
}

function deferred<T>() {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>(fulfill => {
    resolve = fulfill;
  });
  return { promise, resolve };
}

describe('enterprise account identity', () => {
  it.each(['switch', 'sign out'] as const)('does not navigate an old linking response after %s', async change => {
    serveUsers();
    const response = deferred<Response>();
    let received = false;
    worker.use(
      http.post(fapiUrl('/v1/me/external_accounts'), () => {
        received = true;
        return response.promise;
      }),
    );
    const { clerk } = await renderWithClerk(<UserProfileEnterpriseAccountsSection />);
    const navigate = vi.spyOn(clerk, '__internal_windowNavigate').mockImplementation(() => {});
    const original = clerk.user;
    if (!original) {
      throw new Error('Expected original user');
    }
    const create = vi.spyOn(original, 'createExternalAccount');
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect Acme Okta' }));
    await waitFor(() => expect(received).toBe(true));
    await act(() => (change === 'switch' ? clerk.setActive({ session: 'sess_2' }) : clerk.signOut()));
    expect(clerk.user?.id).toBe(change === 'switch' ? 'user_2' : undefined);
    await act(async () => {
      response.resolve(
        HttpResponse.json({
          response: {
            object: 'external_account',
            verification: fapiVerification('saml', {
              status: 'unverified',
              external_verification_redirect_url: 'https://idp.example/old-user-link',
            }),
          },
          client: null,
        }),
      );
      await create.mock.results[0]?.value;
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not offer the previous user connection while the next user query loads', async () => {
    const fapi = serveUsers();
    const nextQuery = deferred<Response>();
    let nextReceived = false;
    worker.use(
      http.get(fapiUrl('/v1/me/enterprise_connections'), () => {
        if (fapi.client.last_active_session_id === 'sess_2') {
          nextReceived = true;
          return nextQuery.promise;
        }
        return HttpResponse.json({ response: [okta], client: null });
      }),
    );
    const { clerk } = await renderWithClerk(<UserProfileEnterpriseAccountsSection />);
    expect(await screen.findByRole('button', { name: 'Connect Acme Okta' })).toBeVisible();
    await act(() => clerk.setActive({ session: 'sess_2' }));
    await waitFor(() => expect(nextReceived).toBe(true));
    expect(clerk.user?.id).toBe('user_2');
    try {
      expect(screen.queryByRole('button', { name: 'Connect Acme Okta' })).toBeNull();
    } finally {
      await act(async () => {
        nextQuery.resolve(HttpResponse.json({ response: [], client: null }));
        await nextQuery.promise;
      });
    }
  });
});
