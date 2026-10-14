import { describe, expect, it } from 'vitest';

import { fapiUrl, serveFapi } from './fake-fapi';
import {
  fapiClient,
  fapiEmailAddress,
  fapiMembership,
  fapiOrganization,
  fapiOrganizationInvitation,
  fapiSession,
  fapiUser,
  fapiVerification,
} from './fapi';
import recorded from './recorded/organization-invitations.json';
import { shapeDifferences } from './shape';

const TEST_DEFAULT = 'A test-friendly default. Tests that need the real value seed it.';
const TYPE_REQUIRES = 'Required by the @clerk/shared type, but real FAPI omits it.';
const TYPE_FORBIDS_NULL = 'Real FAPI sends null, but the @clerk/shared type does not allow null.';
const LOADS_SCRIPT = 'Real loaders make clerk-js inject the Protect script.';
const UNTYPED = 'Not in the @clerk/shared types.';

const KNOWN_DIFFERENCES: Record<string, string> = {
  'client.last_authentication_strategy': TEST_DEFAULT,
  'environment.organization_settings.domains.default_role': TEST_DEFAULT,
  'client.sessions[].last_active_token.id': TYPE_REQUIRES,
  'client.sessions[].tasks': TYPE_REQUIRES,
  'client.sessions[].user.create_organizations_limit': TYPE_REQUIRES,
  'client.sessions[].user.profile_image_id': TYPE_REQUIRES,
  'environment.user_settings.sign_in.second_factor.enabled': TYPE_REQUIRES,
  'environment.user_settings.sign_up.allowlist_only': TYPE_REQUIRES,
  'client.sessions[].public_user_data.username': TYPE_FORBIDS_NULL,
  'client.sessions[].user.email_addresses[].verification.attempts': TYPE_FORBIDS_NULL,
  'client.sessions[].user.email_addresses[].verification.expire_at': TYPE_FORBIDS_NULL,
  'environment.display_config.captcha_provider': TYPE_FORBIDS_NULL,
  'environment.display_config.google_one_tap_client_id': TYPE_FORBIDS_NULL,
  'environment.display_config.privacy_policy_url': TYPE_FORBIDS_NULL,
  'environment.display_config.support_email': TYPE_FORBIDS_NULL,
  'environment.display_config.terms_url': TYPE_FORBIDS_NULL,
  'environment.protect_config.loaders': LOADS_SCRIPT,
  'client.sessions[].public_user_data.profile_image_url': UNTYPED,
  'client.sessions[].user.banned': UNTYPED,
  'client.sessions[].user.bypass_client_trust': UNTYPED,
  'client.sessions[].user.deprovisioned': UNTYPED,
  'client.sessions[].user.email_addresses[].created_at': UNTYPED,
  'client.sessions[].user.email_addresses[].reserved': UNTYPED,
  'client.sessions[].user.email_addresses[].updated_at': UNTYPED,
  'client.sessions[].user.last_active_at': UNTYPED,
  'client.sessions[].user.locale': UNTYPED,
  'client.sessions[].user.locked': UNTYPED,
  'client.sessions[].user.lockout_expires_in_seconds': UNTYPED,
  'client.sessions[].user.mfa_disabled_at': UNTYPED,
  'client.sessions[].user.mfa_enabled_at': UNTYPED,
  'client.sessions[].user.organization_memberships[].organization.logo_url': UNTYPED,
  'client.sessions[].user.password_last_updated_at': UNTYPED,
  'client.sessions[].user.profile_image_url': UNTYPED,
  'client.sessions[].user.saml_accounts': UNTYPED,
  'client.sessions[].user.verification_attempts_remaining': UNTYPED,
  'environment.api_keys_settings.enabled': UNTYPED,
  'environment.auth_config.cookieless_dev': UNTYPED,
  'environment.auth_config.email_address': UNTYPED,
  'environment.auth_config.email_address_verification_strategies': UNTYPED,
  'environment.auth_config.enhanced_email_deliverability': UNTYPED,
  'environment.auth_config.first_factors': UNTYPED,
  'environment.auth_config.first_name': UNTYPED,
  'environment.auth_config.identification_requirements': UNTYPED,
  'environment.auth_config.identification_strategies': UNTYPED,
  'environment.auth_config.last_name': UNTYPED,
  'environment.auth_config.native_settings': UNTYPED,
  'environment.auth_config.password': UNTYPED,
  'environment.auth_config.phone_number': UNTYPED,
  'environment.auth_config.second_factors': UNTYPED,
  'environment.auth_config.session_minter': UNTYPED,
  'environment.auth_config.test_mode': UNTYPED,
  'environment.auth_config.url_based_session_syncing': UNTYPED,
  'environment.auth_config.username': UNTYPED,
  'environment.commerce_settings.billing.free_trial_requires_payment_method': UNTYPED,
  'environment.display_config.experimental_force_oauth_first': UNTYPED,
  'environment.display_config.favicon_image': UNTYPED,
  'environment.display_config.favicon_url': UNTYPED,
  'environment.display_config.help_url': UNTYPED,
  'environment.display_config.logo_image': UNTYPED,
  'environment.display_config.logo_link_url': UNTYPED,
  'environment.display_config.logo_url': UNTYPED,
  'environment.display_config.oauth_consent_url': UNTYPED,
  'environment.display_config.oauth_device_verification_url': UNTYPED,
  'environment.fraud_settings': UNTYPED,
  'environment.organization_settings.creator_role': UNTYPED,
  'environment.organization_settings.organization_creation_defaults.automatic_organization_creation': UNTYPED,
  'environment.organization_settings.organization_creation_defaults.detect_from_email_domain': UNTYPED,
  'environment.organization_settings.organization_creation_defaults.fallback': UNTYPED,
  'environment.organization_settings.organization_creation_defaults.organization_name_template': UNTYPED,
  'environment.user_settings.actions.create_organizations_limit': UNTYPED,
  'environment.user_settings.attack_protection.email_link': UNTYPED,
  'environment.user_settings.attack_protection.pii': UNTYPED,
  'environment.user_settings.attack_protection.user_lockout': UNTYPED,
  'environment.user_settings.attributes.ticket': UNTYPED,
  'environment.user_settings.passkey_settings.satisfies_second_factor': UNTYPED,
  'environment.user_settings.password_settings.disable_password_reverification': UNTYPED,
  'environment.user_settings.password_settings.enforce_hibp_on_sign_in': UNTYPED,
  'environment.user_settings.restrictions': UNTYPED,
  'environment.user_settings.saml': UNTYPED,
  'environment.user_settings.sign_up.captcha_widget_type': UNTYPED,
  'environment.user_settings.sign_up.custom_action_required': UNTYPED,
  'environment.user_settings.social.oauth_google': UNTYPED,
  'environment.user_settings.username_settings.allow_extended_special_characters': UNTYPED,
  'environment.user_settings.username_settings.allow_numeric_usernames': UNTYPED,
};

function resourcePath(request: string, path: string): string {
  if (request === 'GET /v1/environment') {
    return `environment.${path}`;
  }
  if (request === 'GET /v1/client') {
    return path.replace(/^response\./, 'client.');
  }
  return path.replace(/^meta\.client\./, 'client.');
}

function serveRecordedScenario() {
  const acme = fapiOrganization({ id: 'org_acme', name: 'Acme', slug: 'acme' });
  const membership = fapiMembership(acme, {
    id: 'orgmem_ada',
    role: 'org:admin',
    role_name: 'Admin',
    permissions: ['org:sys_memberships:read', 'org:sys_memberships:manage'],
  });
  const ada = fapiUser({
    id: 'user_ada',
    first_name: 'Ada',
    last_name: 'Lovelace',
    last_sign_in_at: 1767225600000,
    email_addresses: [
      fapiEmailAddress({
        id: 'idn_1',
        email_address: 'ada+clerk_test@example.com',
        verification: fapiVerification('admin', { status: 'verified' }),
      }),
    ],
    organization_memberships: [membership],
  });
  serveFapi({
    client: fapiClient([fapiSession({ id: 'sess_1', user: ada, last_active_organization_id: 'org_acme' })]),
    memberships: [membership],
    organizationInvitations: [
      fapiOrganizationInvitation({
        id: 'orginv_bob',
        organization_id: 'org_acme',
        email_address: 'bob+clerk_test@example.com',
        inviter_id: 'user_ada',
      }),
      fapiOrganizationInvitation({
        id: 'orginv_carol',
        organization_id: 'org_acme',
        email_address: 'carol+clerk_test@example.com',
        inviter_id: 'user_ada',
        status: 'revoked',
      }),
    ],
  });
}

function valueAt(value: unknown, path: Array<string | number>): unknown {
  return path.reduce<unknown>(
    (current, key) => (typeof current === 'object' && current !== null ? Reflect.get(current, key) : undefined),
    value,
  );
}

function pendingInvitationsCount(client: unknown): unknown {
  return valueAt(client, [
    'sessions',
    0,
    'user',
    'organization_memberships',
    0,
    'organization',
    'pending_invitations_count',
  ]);
}

const exchanges = recorded.steps.flatMap(step => step.exchanges.map(exchange => ({ step: step.name, ...exchange })));

describe('fake FAPI against a recorded FAPI session', () => {
  it.each(exchanges)('$step: $request answers like FAPI', async exchange => {
    serveRecordedScenario();
    const [method = 'GET', path = ''] = exchange.request.split(' ');
    const url = new URL(fapiUrl(path));
    for (const [key, value] of Object.entries(exchange.query)) {
      url.searchParams.set(key, value);
    }
    const response = await fetch(url, { method, body: exchange.body ? new URLSearchParams() : undefined });

    expect(response.status).toBe(exchange.status);
    const differences = shapeDifferences(exchange.response, await response.json()).filter(
      difference => !(resourcePath(exchange.request, difference.split(':')[0] ?? '') in KNOWN_DIFFERENCES),
    );
    expect(differences).toEqual([]);
  });

  it('counts pending invitations on the organization like FAPI', async () => {
    serveRecordedScenario();
    const [initial, , , , , revoke] = exchanges;
    const before: unknown = await fetch(fapiUrl('/v1/client')).then(response => response.json());
    const after: unknown = await fetch(fapiUrl(revoke?.request.split(' ')[1] ?? ''), { method: 'POST' }).then(
      response => response.json(),
    );

    expect([
      pendingInvitationsCount(valueAt(before, ['response'])),
      pendingInvitationsCount(valueAt(after, ['client'])),
    ]).toEqual([
      pendingInvitationsCount(valueAt(initial, ['response', 'response'])),
      pendingInvitationsCount(valueAt(revoke, ['response', 'client'])),
    ]);
  });
});
