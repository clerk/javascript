import { ClerkAPIResponseError } from '@clerk/shared/error';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Flow } from '@/customizables';
import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import type { EnterpriseConnectionProviderType } from '../../../types';

// The dispatch reads `organizationEnterpriseConnection.provider`. The nested
// sub-flows also read `enterpriseConnection` (via `Step.Footer.Reset`), which is
// left undefined so that footer self-hides in this isolated render.
const contextState = vi.hoisted(() => ({
  provider: undefined as string | undefined,
  isOIDCFlowEnabled: true,
  enterpriseConnection: undefined as
    | {
        id: string;
        oauthConfig: {
          redirectUri?: string;
          discoveryUrl?: string;
          authUrl?: string;
          tokenUrl?: string;
          userInfoUrl?: string;
        } | null;
      }
    | undefined,
}));
const updateConnection = vi.hoisted(() => vi.fn());

const CardErrorProbe = () => {
  const { error } = useCardState();

  return error ? <div>{error}</div> : null;
};

vi.mock('../../../ConfigureSSOContext', () => ({
  useConfigureSSO: () => ({
    enterpriseConnection: contextState.enterpriseConnection,
    contentRef: { current: null },
    enterpriseConnectionMutations: { updateConnection },
    organizationEnterpriseConnection: {
      provider: contextState.provider,
      hasConnection: true,
    },
    isOIDCFlowEnabled: contextState.isOIDCFlowEnabled,
  }),
}));

import { ConfigureProviderStep, resolveConfigureSteps } from '../index';
import { OidcCustomConfigureSteps } from '../oidc';
import {
  SamlCustomConfigureSteps,
  SamlGoogleConfigureSteps,
  SamlMicrosoftConfigureSteps,
  SamlOktaConfigureSteps,
} from '../saml';

const { createFixtures } = bindCreateFixtures('ConfigureSSO');

describe('resolveConfigureSteps', () => {
  it('dispatches custom and legacy OIDC provider keys to the OIDC sub-flow', () => {
    expect(resolveConfigureSteps('oauth_custom_clerk_dev', true)).toBe(OidcCustomConfigureSteps);
    expect(resolveConfigureSteps('oidc_clerk_dev', true)).toBe(OidcCustomConfigureSteps);
    expect(resolveConfigureSteps('oidc_ghe_acme', true)).toBe(OidcCustomConfigureSteps);
    expect(resolveConfigureSteps('oidc_gitlab_ent_acme', true)).toBe(OidcCustomConfigureSteps);
    expect(resolveConfigureSteps('oidc_custom', true)).toBe(OidcCustomConfigureSteps);
  });

  it('does not dispatch OIDC providers while the experimental flow is disabled', () => {
    expect(resolveConfigureSteps('oauth_custom_clerk_dev', false)).toBeUndefined();
    expect(resolveConfigureSteps('oidc_clerk_dev', false)).toBeUndefined();
  });

  it('dispatches SAML providers by exact literal', () => {
    expect(resolveConfigureSteps('saml_okta', false)).toBe(SamlOktaConfigureSteps);
    expect(resolveConfigureSteps('saml_custom', false)).toBe(SamlCustomConfigureSteps);
    expect(resolveConfigureSteps('saml_google', false)).toBe(SamlGoogleConfigureSteps);
    expect(resolveConfigureSteps('saml_microsoft', false)).toBe(SamlMicrosoftConfigureSteps);
  });

  it('returns undefined for an unrecognized provider so the caller can degrade', () => {
    expect(resolveConfigureSteps('ldap_enterprise' as EnterpriseConnectionProviderType, true)).toBeUndefined();
  });
});

describe('ConfigureProviderStep', () => {
  beforeEach(() => {
    contextState.provider = undefined;
    contextState.isOIDCFlowEnabled = true;
    contextState.enterpriseConnection = undefined;
    updateConnection.mockReset();
  });

  const renderStep = (wrapper: React.ComponentType<{ children?: React.ReactNode }>) =>
    render(
      <Flow.Root flow='configureSSO'>
        <CardStateProvider>
          <ConfigureProviderStep />
          <CardErrorProbe />
        </CardStateProvider>
      </Flow.Root>,
      { wrapper },
    );

  it('renders the OIDC configure steps for a custom OAuth provider key without throwing', async () => {
    contextState.provider = 'oauth_custom_clerk_dev';
    contextState.enterpriseConnection = {
      id: 'ent_123',
      oauthConfig: {
        redirectUri: 'https://instance.example/v1/oauth_callback',
      },
    };
    const { wrapper } = await createFixtures();

    const { userEvent } = renderStep(wrapper);

    expect(await screen.findAllByText(/create a new oidc application/i)).not.toHaveLength(0);
    const redirectUri = screen.getByRole('textbox', { name: 'Authorized redirect URI' });
    expect(redirectUri).toHaveAttribute('readonly');
    expect(redirectUri).toHaveValue('https://instance.example/v1/oauth_callback');
    expect(screen.getByText('Ensure your ID token includes the following claims:')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(5);
    expect(screen.getByText('sub')).toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'ID token claim' })).toBeInTheDocument();
    expect(screen.getByText('given_name')).toBeInTheDocument();
    expect(screen.getByText('family_name')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    const discoveryMode = await screen.findByRole('radio', { name: 'Add via discovery endpoint' });
    const manualMode = screen.getByRole('radio', { name: 'Configure manually' });
    expect(discoveryMode).toBeChecked();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();

    await userEvent.click(manualMode);

    expect(screen.getAllByRole('textbox')).toHaveLength(3);
  });

  it('saves the discovery endpoint before advancing to credentials', async () => {
    contextState.provider = 'oidc_clerk_dev';
    contextState.enterpriseConnection = { id: 'ent_123', oauthConfig: null };
    updateConnection.mockReset();
    updateConnection.mockResolvedValue({});
    const { wrapper } = await createFixtures();

    const { userEvent } = renderStep(wrapper);

    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Discovery endpoint' }),
      'https://idp.example/.well-known/openid-configuration',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await vi.waitFor(() => {
      expect(updateConnection).toHaveBeenCalledWith('ent_123', {
        oidc: { discoveryUrl: 'https://idp.example/.well-known/openid-configuration' },
      });
    });
  });

  it('saves manual endpoints before advancing to credentials', async () => {
    contextState.provider = 'oidc_clerk_dev';
    contextState.enterpriseConnection = { id: 'ent_123', oauthConfig: null };
    updateConnection.mockReset();
    updateConnection.mockResolvedValue({});
    const { wrapper } = await createFixtures();

    const { userEvent } = renderStep(wrapper);

    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    const manualMode = await screen.findByRole('radio', { name: 'Configure manually' });
    await userEvent.click(manualMode);

    const authUrl = screen.getByRole('textbox', { name: 'Authorization URL' });
    const tokenUrl = screen.getByRole('textbox', { name: 'Token URL' });
    const userInfoUrl = screen.getByRole('textbox', { name: 'User Info URL' });
    await userEvent.type(authUrl, 'https://idp.example/authorize');
    await userEvent.type(tokenUrl, 'https://idp.example/token');
    await userEvent.type(userInfoUrl, 'https://idp.example/userinfo');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await vi.waitFor(() => {
      expect(updateConnection).toHaveBeenCalledWith('ent_123', {
        oidc: {
          authUrl: 'https://idp.example/authorize',
          tokenUrl: 'https://idp.example/token',
          userInfoUrl: 'https://idp.example/userinfo',
        },
      });
    });
  });

  it('saves manual endpoints without a user info URL', async () => {
    contextState.provider = 'oidc_clerk_dev';
    contextState.enterpriseConnection = { id: 'ent_123', oauthConfig: null };
    updateConnection.mockReset();
    updateConnection.mockResolvedValue({});
    const { wrapper } = await createFixtures();

    const { userEvent } = renderStep(wrapper);

    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    const manualMode = await screen.findByRole('radio', { name: 'Configure manually' });
    await userEvent.click(manualMode);

    const authUrl = screen.getByRole('textbox', { name: 'Authorization URL' });
    const tokenUrl = screen.getByRole('textbox', { name: 'Token URL' });
    await userEvent.type(authUrl, 'https://idp.example/authorize');
    await userEvent.type(tokenUrl, 'https://idp.example/token');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await vi.waitFor(() => {
      expect(updateConnection).toHaveBeenCalledWith('ent_123', {
        oidc: {
          authUrl: 'https://idp.example/authorize',
          tokenUrl: 'https://idp.example/token',
          userInfoUrl: '',
        },
      });
    });
  });

  it('clears endpoint API errors when switching configuration modes', async () => {
    contextState.provider = 'oidc_clerk_dev';
    contextState.enterpriseConnection = { id: 'ent_123', oauthConfig: null };
    updateConnection.mockRejectedValueOnce(
      new ClerkAPIResponseError('Error', {
        data: [
          {
            code: 'form_param_invalid',
            long_message: 'The endpoint configuration is invalid.',
            message: 'The endpoint configuration is invalid.',
          },
        ],
        status: 422,
      }),
    );
    const { wrapper } = await createFixtures();

    const { userEvent } = renderStep(wrapper);

    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Discovery endpoint' }), 'https://idp.example/discovery');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('The endpoint configuration is invalid.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'Configure manually' }));

    expect(screen.queryByText('The endpoint configuration is invalid.')).not.toBeInTheDocument();
  });

  it('saves credentials before advancing', async () => {
    contextState.provider = 'oidc_clerk_dev';
    contextState.enterpriseConnection = { id: 'ent_123', oauthConfig: null };
    updateConnection.mockReset();
    updateConnection.mockResolvedValue({});
    const { wrapper } = await createFixtures();

    const { userEvent } = renderStep(wrapper);

    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Discovery endpoint' }),
      'https://idp.example/.well-known/openid-configuration',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    const clientId = await screen.findByRole('textbox', { name: 'Client ID' });
    const clientSecret = screen.getByLabelText('Client secret');
    await userEvent.type(clientId, 'client_123');
    await userEvent.type(clientSecret, 'secret_456');

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await vi.waitFor(() => {
      expect(updateConnection).toHaveBeenLastCalledWith('ent_123', {
        oidc: { clientId: 'client_123', clientSecret: 'secret_456' },
      });
    });
  });

  it('displays credential API errors on their matching fields', async () => {
    contextState.provider = 'oidc_clerk_dev';
    contextState.enterpriseConnection = { id: 'ent_123', oauthConfig: null };
    updateConnection.mockReset();
    updateConnection.mockResolvedValueOnce({});
    updateConnection.mockRejectedValueOnce(
      new ClerkAPIResponseError('Error', {
        data: [
          {
            code: 'form_param_invalid',
            long_message: 'Client ID is invalid.',
            message: 'Client ID is invalid.',
            meta: { param_name: 'client_id' },
          },
          {
            code: 'form_param_invalid',
            long_message: 'Client secret is invalid.',
            message: 'Client secret is invalid.',
            meta: { param_name: 'client_secret' },
          },
        ],
        status: 422,
      }),
    );
    const { wrapper } = await createFixtures();

    const { userEvent } = renderStep(wrapper);

    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Discovery endpoint' }),
      'https://idp.example/.well-known/openid-configuration',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    const clientId = await screen.findByRole('textbox', { name: 'Client ID' });
    const clientSecret = screen.getByLabelText('Client secret');
    await userEvent.type(clientId, 'client_123');
    await userEvent.type(clientSecret, 'secret_456');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('Client ID is invalid.')).toBeInTheDocument();
    expect(await screen.findByText('Client secret is invalid.')).toBeInTheDocument();
    expect(clientId).toHaveAttribute('aria-describedby', 'error-clientId');
    expect(clientSecret).toHaveAttribute('aria-describedby', 'error-clientSecret');
  });

  it('selects manual mode when an existing connection has manual endpoints without a discovery URL', async () => {
    contextState.provider = 'oidc_clerk_dev';
    contextState.enterpriseConnection = {
      id: 'ent_123',
      oauthConfig: {
        authUrl: 'https://idp.example/authorize',
        tokenUrl: 'https://idp.example/token',
        userInfoUrl: 'https://idp.example/userinfo',
      },
    };
    const { wrapper } = await createFixtures();

    const { userEvent } = renderStep(wrapper);

    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));

    const discoveryMode = await screen.findByRole('radio', { name: 'Add via discovery endpoint' });
    const manualMode = screen.getByRole('radio', { name: 'Configure manually' });
    expect(discoveryMode).not.toBeChecked();
    expect(manualMode).toBeChecked();
    expect(screen.getByRole('textbox', { name: 'Authorization URL' })).toHaveValue('https://idp.example/authorize');
  });

  it('populates manual endpoints resolved from discovery', async () => {
    contextState.provider = 'oidc_clerk_dev';
    contextState.enterpriseConnection = {
      id: 'ent_123',
      oauthConfig: {
        discoveryUrl: 'https://idp.example/.well-known/openid-configuration',
        authUrl: 'https://idp.example/authorize',
        tokenUrl: 'https://idp.example/token',
        userInfoUrl: 'https://idp.example/userinfo',
      },
    };
    const { wrapper } = await createFixtures();

    const { userEvent } = renderStep(wrapper);

    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    const manualMode = await screen.findByRole('radio', { name: 'Configure manually' });
    await userEvent.click(manualMode);

    expect(screen.getByRole('textbox', { name: 'Authorization URL' })).toHaveValue('https://idp.example/authorize');
    expect(screen.getByRole('textbox', { name: 'Token URL' })).toHaveValue('https://idp.example/token');
    expect(screen.getByRole('textbox', { name: 'User Info URL' })).toHaveValue('https://idp.example/userinfo');
  });

  it('retains manual mode when returning from credentials with a stale discovery URL', async () => {
    contextState.provider = 'oidc_clerk_dev';
    contextState.enterpriseConnection = {
      id: 'ent_123',
      oauthConfig: {
        discoveryUrl: 'https://idp.example/.well-known/openid-configuration',
        authUrl: 'https://idp.example/authorize',
        tokenUrl: 'https://idp.example/token',
        userInfoUrl: 'https://idp.example/userinfo',
      },
    };
    updateConnection.mockResolvedValue({});
    const { wrapper } = await createFixtures();

    const { userEvent } = renderStep(wrapper);

    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    const manualMode = await screen.findByRole('radio', { name: 'Configure manually' });
    await userEvent.click(manualMode);
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await screen.findByRole('textbox', { name: 'Client ID' });
    await userEvent.click(screen.getByRole('button', { name: 'Previous' }));

    expect(await screen.findByRole('radio', { name: 'Configure manually' })).toBeChecked();
    expect(screen.getByRole('textbox', { name: 'Authorization URL' })).toHaveValue('https://idp.example/authorize');
  });

  it('degrades to the unsupported-provider state for a provider the SDK does not recognize', async () => {
    contextState.provider = 'ldap_enterprise';
    const { wrapper } = await createFixtures();

    renderStep(wrapper);

    expect(await screen.findByText(/unsupported provider/i)).toBeInTheDocument();
  });

  it('degrades to the unsupported-provider state for an existing OIDC connection when the flag is off', async () => {
    contextState.provider = 'oauth_custom_clerk_dev';
    contextState.isOIDCFlowEnabled = false;
    const { wrapper } = await createFixtures();

    renderStep(wrapper);

    expect(await screen.findByText(/unsupported provider/i)).toBeInTheDocument();
    expect(screen.queryByText(/create a new oidc application/i)).not.toBeInTheDocument();
  });
});
