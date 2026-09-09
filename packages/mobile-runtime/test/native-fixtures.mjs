import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createBaseClientJSON, createBaseEnvironmentJSON } from '../../clerk-js/src/test/fixtures.ts';
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
export const fixtures = {
  environment: createBaseEnvironmentJSON(),
  client: { ...createBaseClientJSON(), sessions: [], captcha_bypass: true },
  signIn,
  signUp,
};
if (process.argv[1] === fileURLToPath(import.meta.url)) fs.writeFileSync(process.argv[2], JSON.stringify(fixtures));
