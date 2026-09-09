import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createBaseClientJSON, createBaseEnvironmentJSON } from '../../clerk-js/src/test/fixtures.ts';
function createNativeEnvironmentJSON() {
  const environment = createBaseEnvironmentJSON();
  const settings = environment.user_settings;
  settings.social = Object.fromEntries(
    Object.entries(settings.social).map(([strategy, provider]) => [
      strategy,
      { ...provider, name: strategy, logo_url: null },
    ]),
  );
  settings.username_settings = { min_length: 4, max_length: 64 };
  environment.organization_settings.actions = { admin_delete: false };
  environment.organization_settings.domains.default_role = null;
  return environment;
}
const verification = {
  status: 'unverified',
  strategy: 'oauth_google',
  external_verification_redirect_url: 'https://provider.example/authorize',
  attempts: null,
  expire_at: null,
  error: null,
  verified_at_client: null,
};
const signIn = {
  object: 'sign_in',
  id: 'sia_native',
  status: 'needs_first_factor',
  identifier: null,
  supported_first_factors: [],
  supported_second_factors: [],
  first_factor_verification: verification,
  second_factor_verification: null,
  created_session_id: null,
  user_data: {},
};
const signUp = {
  object: 'sign_up',
  id: 'sua_native',
  status: 'missing_requirements',
  required_fields: [],
  optional_fields: [],
  missing_fields: [],
  unverified_fields: [],
  verifications: { external_account: verification },
  unsafe_metadata: {},
  created_session_id: null,
  username: null,
  first_name: null,
  last_name: null,
  email_address: null,
  phone_number: null,
  has_password: false,
  created_user_id: null,
  abandon_at: null,
  web3_wallet: null,
  legal_accepted_at: null,
  locale: null,
};
export function sessionFixture(status = 'active') {
  const now = Date.now();
  return {
    object: 'session',
    id: 'sess_native',
    status,
    expire_at: now + 86400000,
    abandon_at: now + 86400000,
    created_at: now,
    updated_at: now,
    last_active_at: now,
    last_active_organization_id: null,
    actor: null,
    factor_verification_age: [0, 0],
    tasks: status === 'pending' ? [{ key: 'choose-organization' }] : [],
    public_user_data: {
      first_name: 'Test',
      last_name: 'User',
      image_url: '',
      identifier: 'test@example.com',
      user_id: 'user_native',
    },
    user: {
      object: 'user',
      id: 'user_native',
      first_name: 'Test',
      last_name: 'User',
      image_url: '',
      username: null,
      primary_email_address_id: null,
      primary_phone_number_id: null,
      primary_web3_wallet_id: null,
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
      enterprise_accounts: [],
      organization_memberships: [],
      passkeys: [],
      password_enabled: true,
      totp_enabled: false,
      backup_code_enabled: false,
      two_factor_enabled: false,
      public_metadata: {},
      unsafe_metadata: {},
      created_at: now,
      updated_at: now,
      last_sign_in_at: now,
    },
  };
}

export function tokenFixture() {
  const now = Math.floor(Date.now() / 1000);
  const base64 = object => Buffer.from(JSON.stringify(object)).toString('base64url');
  return {
    object: 'token',
    jwt: `${base64({ alg: 'RS256', typ: 'JWT' })}.${base64({ sub: 'user_native', sid: 'sess_native', iat: now, exp: now + 60, iss: 'https://native-core.clerk.accounts.dev' })}.fixture_signature`,
  };
}

export const fixtures = {
  environment: createNativeEnvironmentJSON(),
  client: { ...createBaseClientJSON(), sessions: [], captcha_bypass: true },
  signIn,
  signUp,
  session: sessionFixture(),
  token: tokenFixture(),
};
fixtures.authenticatedClient = {
  ...fixtures.client,
  id: 'client_native',
  sessions: [fixtures.session],
  last_active_session_id: fixtures.session.id,
  sign_in: { ...signIn, status: 'complete', created_session_id: fixtures.session.id },
  sign_up: { ...signUp, status: 'complete', created_session_id: fixtures.session.id },
};
if (process.argv[1] === fileURLToPath(import.meta.url)) fs.writeFileSync(process.argv[2], JSON.stringify(fixtures));
