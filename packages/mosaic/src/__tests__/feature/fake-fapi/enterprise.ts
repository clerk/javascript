import type { ExternalAccountJSON, VerificationJSON } from '@clerk/shared/types';
import { http, HttpResponse } from 'msw';

import type { FakeFapiState } from '../fake-fapi';

export type EnterpriseExternalAccount = Omit<ExternalAccountJSON, 'provider'> & { provider: string };

export type EnterprisePreparation =
  | { kind: 'saml'; verification: VerificationJSON }
  | { kind: 'oidc'; account: EnterpriseExternalAccount };

export interface FakeEnterpriseLinking {
  enabled: boolean;
  preparations: Record<string, EnterprisePreparation>;
  verifiedLinks: { userId: string; connectionId: string }[];
  pendingExternalAccounts: { userId: string; connectionId: string; account: EnterpriseExternalAccount }[];
}

function rejected(code: 'resource_not_found' | 'feature_not_enabled') {
  return HttpResponse.json(
    { errors: [{ code, message: code === 'resource_not_found' ? 'not found' : 'Feature not enabled' }] },
    { status: code === 'resource_not_found' ? 404 : 403 },
  );
}

export function enterpriseHandlers(state: FakeFapiState, url: (path: string) => string) {
  return [
    http.get(url('/v1/me/enterprise_connections'), ({ request }) => {
      const user = state.client.sessions.find(session => session.id === state.client.last_active_session_id)?.user;
      if (!user) {
        return rejected('resource_not_found');
      }
      const withLinking = new URL(request.url).searchParams.get('with_organization_account_linking') === 'true';
      const connections = withLinking
        ? state.enterpriseConnections.filter(
            connection =>
              connection.active &&
              connection.organization_id &&
              connection.allow_organization_account_linking &&
              user.organization_memberships.some(
                membership => membership.organization.id === connection.organization_id,
              ) &&
              !state.enterpriseLinking.verifiedLinks.some(
                link => link.userId === user.id && link.connectionId === connection.id,
              ),
          )
        : state.enterpriseConnections;
      return HttpResponse.json({ response: connections, client: state.client });
    }),
    http.post(url('/v1/me/external_accounts'), async ({ request }) => {
      const user = state.client.sessions.find(session => session.id === state.client.last_active_session_id)?.user;
      if (!user) {
        return rejected('resource_not_found');
      }
      const body = new URLSearchParams(await request.text());
      const connectionId = body.get('enterprise_connection_id');
      if (!connectionId) {
        return undefined;
      }
      if (!state.enterpriseLinking.enabled) {
        return rejected('feature_not_enabled');
      }
      const connection = state.enterpriseConnections.find(item => item.id === connectionId);
      if (!connection?.active || !connection.organization_id) {
        return rejected('resource_not_found');
      }
      if (!connection.allow_organization_account_linking) {
        return rejected('feature_not_enabled');
      }
      if (
        !user.organization_memberships.some(membership => membership.organization.id === connection.organization_id)
      ) {
        return rejected('resource_not_found');
      }
      const preparation = state.enterpriseLinking.preparations[connection.id];
      if (!preparation) {
        throw new Error(`Missing enterprise preparation for ${connection.id}`);
      }
      if (preparation.kind === 'saml') {
        if (
          !connection.provider.startsWith('saml_') ||
          preparation.verification.strategy !== 'saml' ||
          preparation.verification.status !== 'unverified'
        ) {
          throw new Error(`Invalid SAML preparation for ${connection.id}`);
        }
        const primaryEmail = user.email_addresses.find(email => email.id === user.primary_email_address_id);
        if (!primaryEmail) {
          return rejected('resource_not_found');
        }
        if (
          state.enterpriseLinking.verifiedLinks.some(
            link => link.userId === user.id && link.connectionId === connection.id,
          )
        ) {
          return HttpResponse.json(
            {
              errors: [
                {
                  code: 'enterprise_sso_account_already_connected',
                  message: 'Already connected',
                  long_message: `An enterprise account is already connected for this connection email: ${primaryEmail.email_address}`,
                },
              ],
            },
            { status: 400 },
          );
        }
        return HttpResponse.json({
          response: { object: 'external_account', verification: preparation.verification },
          client: state.client,
        });
      }
      const account = preparation.account;
      if (
        !connection.provider.startsWith('oidc_') ||
        !account.provider.startsWith('oauth_') ||
        account.verification?.strategy !== account.provider ||
        account.verification.status !== 'unverified'
      ) {
        throw new Error(`Invalid OIDC preparation for ${connection.id}`);
      }
      state.enterpriseLinking.pendingExternalAccounts = [
        ...state.enterpriseLinking.pendingExternalAccounts.filter(
          item => item.userId !== user.id || item.account.id !== account.id,
        ),
        { userId: user.id, connectionId: connection.id, account },
      ];
      return HttpResponse.json({ response: account, client: state.client });
    }),
  ];
}
