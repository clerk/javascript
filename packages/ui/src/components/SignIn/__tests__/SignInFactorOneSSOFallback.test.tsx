import type { SignInResource } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { SignInFactorOne } from '../SignInFactorOne';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('SignInFactorOne SSO fallback', () => {
  it('offers the fallback next to the SSO action for a single connection', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress();
      f.withEnterpriseSso();
      f.startSignInWithEnterpriseSSO({ supportSSOFallback: true });
    });

    render(<SignInFactorOne />, { wrapper });

    await screen.findByText('Continue with SSO');
    screen.getByText("Can't use SSO?");
  });

  it('does not render the fallback when the instance does not offer one', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress();
      f.withEnterpriseSso();
      f.startSignInWithEnterpriseSSO();
    });

    render(<SignInFactorOne />, { wrapper });

    expect(screen.queryByText("Can't use SSO?")).not.toBeInTheDocument();
  });

  it('offers a single fallback action alongside multiple connections', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress();
      f.withEnterpriseSso();
      f.startSignInWithEnterpriseSSO({
        supportSSOFallback: true,
        enterpriseConnections: [
          { id: 'conn_okta', name: 'Okta' },
          { id: 'conn_msft', name: 'Microsoft' },
        ],
      });
    });

    render(<SignInFactorOne />, { wrapper });

    await screen.findByText('Okta');
    screen.getByText('Microsoft');
    expect(screen.getAllByText("Can't use SSO?")).toHaveLength(1);
  });

  it('redirects to the identity provider when the SSO action is used', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.withEnterpriseSso();
      f.startSignInWithEnterpriseSSO({ supportSSOFallback: true });
    });

    const { userEvent } = render(<SignInFactorOne />, { wrapper });

    await userEvent.click(await screen.findByText('Continue with SSO'));

    expect(fixtures.signIn.authenticateWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ strategy: 'enterprise_sso', continueSignIn: true }),
    );
  });

  it('prepares the email code with the handle and warns on the code screen', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.withEnterpriseSso();
      f.startSignInWithEnterpriseSSO({ supportSSOFallback: true });
    });
    fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));

    const { userEvent } = render(<SignInFactorOne />, { wrapper });

    await userEvent.click(await screen.findByText("Can't use SSO?"));

    await screen.findByText('Check your email');
    screen.getByText(/Your organization requires single sign-on/i);
    expect(fixtures.signIn.prepareFirstFactor).toHaveBeenCalledWith(
      expect.objectContaining({ strategy: 'email_code', emailAddressId: 'idn_hmac' }),
    );
  });

  it('masks the email address on the code screen', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.withEnterpriseSso();
      f.startSignInWithEnterpriseSSO({ identifier: 'hello@clerk.com', supportSSOFallback: true });
    });
    fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));

    const { userEvent } = render(<SignInFactorOne />, { wrapper });

    await userEvent.click(await screen.findByText("Can't use SSO?"));

    await screen.findByText('h***@clerk.com');
    expect(screen.queryByText('hello@clerk.com')).not.toBeInTheDocument();
  });

  it('returns to the SSO screen from the code screen', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.withEnterpriseSso();
      f.startSignInWithEnterpriseSSO({ supportSSOFallback: true });
    });
    fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));

    const { userEvent } = render(<SignInFactorOne />, { wrapper });

    await userEvent.click(await screen.findByText("Can't use SSO?"));
    await userEvent.click(await screen.findByText('Use another method'));

    await screen.findByText('Continue with SSO');
  });
});
